const express = require("express");
const { signup, login } = require("../../controller/auth.controller");
const _ = express.Router();

_.use("/signup", signup);
_.use("/login", login);

module.exports = _;
