const express = require("express");
const {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
} = require("../../controller/auth.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/signup").post(signup);
_.route("/login").post(login);
_.route("/verify-otp").post(verifyAuth, verifyOtp);
_.route("/resend-otp").post(verifyAuth, resendOtp);
_.route("/forgot-password").post(verifyAuth, forgotPassword);
_.route("/reset-password").post(verifyAuth, resetPassword);

module.exports = _;
