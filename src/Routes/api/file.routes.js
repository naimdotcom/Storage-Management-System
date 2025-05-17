const express = require("express");
const { verifyAuth } = require("../../middleware/auth.middleware");
const {
  uploadFile,
  createFolder,
  getFolderFiles,
  getFile,
} = require("../../controller/file.controller");
const upload = require("../../middleware/multer.middleware");
const _ = express.Router();

_.route("/:id/upload").post(verifyAuth, upload.single("file"), uploadFile);

_.route("/:id/file").get(verifyAuth, getFile);

_.route("/:id/folder").post(verifyAuth, createFolder);

_.route("/:id/children").get(verifyAuth, getFolderFiles);

module.exports = _;
