const express = require("express");
const { signup } = require("../../controller/auth.controller");
const _ = express.Router();

_.use("/signup", signup);

module.exports = _;
