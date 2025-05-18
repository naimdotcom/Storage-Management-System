const express = require("express");
const { verifyAuth } = require("../../middleware/auth.middleware");
const {
  uploadFile,
  createFolder,
  getFolderFiles,
  getFileOrFolder,
  deleteFileOrFolder,
  renameFileOrFolder,
  getMimeTypeFiles,
} = require("../../controller/file.controller");
const upload = require("../../middleware/multer.middleware");
const _ = express.Router();

_.route("/").get(verifyAuth, getMimeTypeFiles);

_.route("/:id")
  .get(verifyAuth, getFileOrFolder)
  .delete(verifyAuth, deleteFileOrFolder)
  .patch(verifyAuth, renameFileOrFolder);

_.route("/:id/children").get(verifyAuth, getFolderFiles);

_.route("/:id/folders").post(verifyAuth, createFolder);

_.route("/:id/upload").post(verifyAuth, upload.single("file"), uploadFile);

module.exports = _;
