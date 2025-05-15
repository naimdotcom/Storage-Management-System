const express = require("express");
const _ = express.Router();
const authRoute = require("./api/auth.routes");

_.use("/auth", authRoute);

module.exports = _;
