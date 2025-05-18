const express = require("express");
const {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
  userAuth,
} = require("../../controller/auth.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/signup").post(signup);
_.route("/login").post(login);
_.route("/verify-otp").post(verifyAuth, verifyOtp);
_.route("/resend-otp").get(verifyAuth, resendOtp);
_.route("/forgot-password").post(verifyAuth, forgotPassword);
_.route("/reset-password").post(verifyAuth, resetPassword);
_.route("/user").get(verifyAuth, userAuth);
_.route("/google/callback").get(verifyAuth, userAuth);

module.exports = _;
