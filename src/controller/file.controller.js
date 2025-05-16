const { File } = require("../Model/file.model");

const uploadFile = async (req, res) => {
  try {
    const { file, parentId } = req.body;
    const user = req.user;
    if (!file || !parentId) {
      return res.status(400).json(new ApiError(400, "Please enter file"));
    }

    const isFolderExist = await File.findById(parentId);
    if (!isFolderExist) {
      return res
        .status(400)
        .json(new ApiError(400, "Folder not found", { success: false }));
    }

    return res.status(200).json(
      new ApiResponse(200, "File created successfully", {
        success: true,
        file: file,
      })
    );
  } catch (error) {
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
