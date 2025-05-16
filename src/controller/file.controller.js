const { bucket } = require("../config/firebase");
const { File } = require("../Model/file.model");
const fs = require("fs");
const Storage = require("../Model/storage.model");
const uploadFile = async (req, res) => {
  try {
    const { parentId } = req.body;
    const file = req.file;
    const user = req.user;
    if (!file || !parentId) {
      return res.status(400).json(new ApiError(400, "Please enter file"));
    }

    const isFolderExist = await File.findById(parentId);
    if (!isFolderExist)
      return res
        .status(400)
        .json(new ApiError(400, "Folder not found", { success: false }));
    if (isFolderExist.type !== "folder" || isFolderExist.isDeleted)
      return res
        .status(400)
        .json(new ApiError(400, "Folder deleted", { success: false }));

    const destinationPath = `user_files/${user._id}/${req.file.filename}`;

    await bucket.upload(file.path, {
      destination: destinationPath,
      metadata: { contentType: file.mimetype },
    });

    const fileRef = bucket.file(destinationPath);

    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    fs.unlinkSync(file.path);

    const fileCreated = await File.create({
      ownerId: user._id,
      type: "file",
      fileName: req.file.originalname,
      parentId: parentId,
      mimeType: file.mimetype,
      fileSize: file.size,
      url: url,
    });

    const updateStorageSummary = await Storage.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        $inc: {
          usedStorage: file.size,
        },
      },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(200, "File created successfully", {
        success: true,
        file: fileCreated,
      })
    );
  } catch (error) {
    fs.unlinkSync(req.file.path);
    console.log("error from createFile", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createFolder = async (req, res) => {};

const deleteFile = async (req, res) => {};

const renameFile = async (req, res) => {};

module.exports = {
  uploadFile,
};
