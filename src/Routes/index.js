const express = require("express");
const _ = express.Router();
const authRoute = require("./api/auth.routes");
const storageRoute = require("./api/storage.routes");
const directoryRoute = require("./api/file.routes");

_.use("/auth", authRoute);
_.use("/storage", storageRoute);
_.use("/directory", directoryRoute);

module.exports = _;
