const { bucket } = require("../config/firebase");
const { File } = require("../Model/file.model");
const fs = require("fs");
const Storage = require("../Model/storage.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const uploadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const user = req.user;
    if (!file || !id) {
      return res.status(400).json(new ApiError(400, "Please enter file"));
    }

    const isFolderExist = await File.findById(id);
    if (!isFolderExist)
      return res
        .status(400)
        .json(new ApiError(400, "Folder not found", { success: false }));
    if (isFolderExist.type !== "folder" || isFolderExist.isDeleted)
      return res
        .status(400)
        .json(new ApiError(400, "Folder deleted", { success: false }));

    const destinationPath = `user_files/${user.id ? user.id : "unknown"}/${
      req.file.filename
    }`;

    await bucket.upload(file.path, {
      destination: destinationPath,
      metadata: { contentType: file.mimetype },
    });

    const fileRef = bucket.file(destinationPath);

    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    const mimeType = file.mimetype;
    const fileSize = file.size;

    console.log("mimeType", mimeType);
    console.log("fileSize", fileSize);

    const fileCreated = await File.create({
      ownerId: user.id,
      type: "file",
      name: req.file.originalname,
      parentId: id,
      mimeType: mimeType,
      size: fileSize,
      fileUrl: url,
    });

    let updateFields = {
      usedStorage: fileSize,
    };

    if (mimeType.startsWith("image/")) {
      updateFields.imageItem = 1;
      updateFields.imageStorage = fileSize;
    } else if (mimeType.startsWith("video/")) {
      updateFields.videoItem = 1;
      updateFields.videoStorage = fileSize;
    } else if (mimeType === "application/pdf") {
      updateFields.pdfItem = 1;
      updateFields.pdfStorage = fileSize;
    } else if (mimeType === "text/plain") {
      updateFields.txtItem = 1;
      updateFields.txtStorage = fileSize;
    } else {
      updateFields.otherItem = 1;
      updateFields.otherStorage = fileSize;
    }

    const updateStorageSummary = await Storage.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        $inc: updateFields,
      },
      { new: true }
    );

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(file.path);
    }

    return res.status(200).json(
      new ApiResponse(200, "File created successfully", {
        success: true,
        file: fileCreated,
      })
    );
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log("error from createFile", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const { id: parentId } = req.params;
    console.log("parentId", parentId, req.body);
    const user = req.user;
    if (!parentId) {
      return res.status(400).json(new ApiError(400, "Please enter parentId"));
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

    const folderCreated = await File.create({
      ownerId: user.id,
      name: name ? name : "New Folder",
      type: "folder",
      parentId: parentId,
      mimeType: "folder",
      size: 0,
    });

    if (!folderCreated) {
      return res
        .status(400)
        .json(new ApiError(400, "Folder not created", { success: false }));
    }

    return res.status(201).json(
      new ApiResponse(201, "Folder created successfully", {
        success: true,
        folder: folderCreated,
      })
    );
  } catch (error) {
    console.log("error from createFolder", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const getFolderFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Please enter parentId"));
    }

    const folder = await File.findById(id);
    if (!folder)
      return res
        .status(400)
        .json(new ApiError(400, "Folder not found", { success: false }));
    if (folder.isDeleted)
      return res
        .status(400)
        .json(new ApiError(400, "Folder deleted", { success: false }));
    if (folder.type !== "folder")
      return res
        .status(400)
        .json(new ApiError(400, "Not a folder", { success: false }));

    const files = await File.find({
      ownerId: user.id,
      parentId: id,
      isDeleted: false,
    }).select("-__v");

    return res.status(200).json(
      new ApiResponse(200, "Files found", {
        success: true,
        folder: folder,
        files: files,
      })
    );
  } catch (error) {
    console.log("error from getFolderFiles", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const getFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Please enter fileId"));
    }

    const fileOrFolder = await File.findOne({
      ownerId: user.id,
      _id: id,
      isDeleted: false,
    });
    if (!fileOrFolder) {
      return res.status(400).json(new ApiError(400, "File not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "File found", {
        success: true,
        ...(fileOrFolder.type == "folder" && { folder: fileOrFolder }),
        ...(fileOrFolder.type == "file" && { file: fileOrFolder }),
      })
    );
  } catch (error) {
    console.log("error from getFile", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const deleteFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Please enter fileId"));
    }

    const fileOrFolder = await File.findOneAndUpdate(
      {
        ownerId: user.id,
        _id: id,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        new: true,
      }
    );
    if (!fileOrFolder) {
      return res.status(400).json(new ApiError(400, "File not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "File deleted", {
        success: true,
        ...(fileOrFolder.type == "folder" && { folder: fileOrFolder }),
        ...(fileOrFolder.type == "file" && { file: fileOrFolder }),
      })
    );
  } catch (error) {
    console.log("error from deleteFile", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const renameFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const user = req.user;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Please enter fileId"));
    }
    if (!name) {
      return res.status(400).json(new ApiError(400, "Please enter name"));
    }

    const fileOrFolder = await File.findOneAndUpdate(
      {
        ownerId: user.id,
        _id: id,
        isDeleted: false,
      },
      {
        name: name,
      },
      {
        new: true,
      }
    );
    if (!fileOrFolder) {
      return res.status(400).json(new ApiError(400, "File not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "File renamed", {
        success: true,
        ...(fileOrFolder.type == "folder" && { folder: fileOrFolder }),
        ...(fileOrFolder.type == "file" && { file: fileOrFolder }),
      })
    );
  } catch (error) {
    console.log("error from renameFile", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const getMimeTypeFiles = async (req, res) => {
  try {
    const { mime } = req.query;
    const user = req.user;

    if (!mime) {
      return res.status(400).json(new ApiError(400, "Please enter mime"));
    }

    let mimeRegex;
    switch (mime.toLowerCase()) {
      case "image":
        mimeRegex = /^image\//i;
        break;
      case "video":
        mimeRegex = /^video\//i;
        break;
      case "pdf":
        mimeRegex = /^application\/pdf$/i;
        break;
      case "txt":
      case "note":
        mimeRegex = /^text\/plain$/i;
        break;
      default:
        return res
          .status(400)
          .json(new ApiError(400, "Unsupported mime filter"));
    }

    const files = await File.find({
      ownerId: user.id,
      type: "file",
      mimeType: { $regex: mimeRegex },
      isDeleted: false,
    }).select("-__v");

    if (!files.length) {
      return res.status(400).json(new ApiError(400, "No files found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "Files found", {
        success: true,
        files: files,
      })
    );
  } catch (error) {
    console.log("error from getMimeTypeFiles", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

const addToFavoriteFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Please enter fileId"));
    }

    const fileOrFolder = await File.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        isFavorite: true,
      },
      {
        new: true,
      }
    );
    if (!fileOrFolder) {
      return res.status(400).json(new ApiError(400, "File not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "File added to favorite", {
        success: true,
        ...(fileOrFolder.type == "folder" && { folder: fileOrFolder }),
        ...(fileOrFolder.type == "file" && { file: fileOrFolder }),
      })
    );
  } catch (error) {
    console.log("error from addToFavorite", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

module.exports = {
  uploadFile,
  createFolder,
  deleteFileOrFolder,
  renameFileOrFolder,
  getFolderFiles,
  getFileOrFolder,
  getMimeTypeFiles,
  addToFavoriteFileOrFolder,
};
