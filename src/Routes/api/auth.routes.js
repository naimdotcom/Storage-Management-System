const express = require("express");
const {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
  userAuth,
  renameUserName,
} = require("../../controller/auth.controller");
const passport = require("../../config/passport");
const { verifyAuth } = require("../../middleware/auth.middleware");
const { generateToken } = require("../../lib/Jwt");
const ApiResponse = require("../../utils/ApiResponse");
const _ = express.Router();

_.route("/signup").post(signup);
_.route("/login").post(login);
_.route("/verify-otp").post(verifyAuth, verifyOtp);
_.route("/resend-otp").get(verifyAuth, resendOtp);
_.route("/forgot-password").post(verifyAuth, forgotPassword);
_.route("/reset-password").post(verifyAuth, resetPassword);
_.route("/user").get(verifyAuth, userAuth);
post(verifyAuth, renameUserName);

// Google OAuth
_.route("/google").get(passport.authenticate("google", { scope: ["email"] }));

_.route("/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true, // keep session for the redirect
  }),
  async (req, res) => {
    // 🔑 Issue the same JWT you already create on normal login
    const payload = {
      id: req.user._id.toString(),
      username: req.user.username,
      email: req.user.email,
    };
    const token = generateToken(payload, "10d");

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(200, "User logged in", { success: true, redirect: "/" })
      ); // or send JSON for SPA
  }
);

module.exports = _;
