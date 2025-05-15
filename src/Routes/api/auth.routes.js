const express = require("express");
const {
  signup,
  login,
  verifyOtp,
} = require("../../controller/auth.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.use("/signup", signup);
_.use("/login", login);
_.use("/otp", verifyAuth, verifyOtp);

module.exports = _;
