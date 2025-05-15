const express = require("express");
const {
  signup,
  login,
  verifyOtp,
} = require("../../controller/auth.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/signup").post(signup);
_.route("/login").post(login);
_.route("/verify-otp").post(verifyAuth, verifyOtp);

module.exports = _;
