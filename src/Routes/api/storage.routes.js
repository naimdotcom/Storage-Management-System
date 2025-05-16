const express = require("express");
const { storageSummary } = require("../../controller/storage.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/").get(verifyAuth, storageSummary);

// todo: premium storage

module.exports = _;
