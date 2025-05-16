const express = require("express");
const _ = express.Router();
const authRoute = require("./api/auth.routes");
const storageRoute = require("./api/storage.routes");

_.use("/auth", authRoute);
_.use("/storage", storageRoute);

module.exports = _;
