const express = require("express");
const { verifyAuth } = require("../../middleware/auth.middleware");
const {
  uploadFile,
  createFolder,
} = require("../../controller/file.controller");
const upload = require("../../middleware/multer.middleware");
const _ = express.Router();

_.route("/upload-file").post(verifyAuth, upload.single("file"), uploadFile);
_.route("/create-folder").post(verifyAuth, createFolder);

module.exports = _;
