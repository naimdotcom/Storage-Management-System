const { hashPassword, comparePassword } = require("../lib/bcrypt");
const { generateToken } = require("../lib/Jwt");
const { SendMail } = require("../lib/nodemailer");
const User = require("../Model/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { otpTemplate } = require("../utils/EmailTemplate");
const { otpGenerator } = require("../utils/Otp");

const signup = async (req, res) => {
  try {
    const { username, email, password, terms } = req.body;
    if (!terms == true || terms == false || !terms == "true") {
      return res
        .status(406)
        .json(new ApiError(406, "Please accept terms and conditions"));
    }
    if (!username || !email || !password) {
      return res.status(400).json(new ApiError(400, "Please fill all fields"));
    }
    const isUserExist = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (isUserExist) {
      return res
        .status(400)
        .json(
          new ApiError(400, "User already exist with this email or username")
        );
    }
    const { otp, expiry } = otpGenerator();
    const passwordHashed = await hashPassword(password);
    const user = await User.create({
      username,
      email,
      password: passwordHashed,
      termsAndConditions: terms,
      otp: otp,
      otpExpiry: expiry,
    });
    if (!user) {
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }

    const token = generateToken({ id: user._id }, "6m");

    // send otp to user
    const mail = await SendMail(
      otpTemplate(otp),
      email,
      "Email Verification Code"
    );

    return res
      .status(200)
      .cookie("tempToken", token, {})
      .json(
        new ApiResponse(200, "User created successfully", {
          token: `Bearer ${token}`,
          redirect: "/otp",
        })
      );
  } catch (error) {
    console.log("error from signup", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(new ApiError(400, "Please fill all fields"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    if (!user.isVerified) {
      const { otp, expiry } = otpGenerator();
      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();
      const mail = await SendMail(
        otpTemplate(otp),
        email,
        "Email Verification Code"
      );
      const tempToken = generateToken({ id: user._id }, "6m");
      return res.status(400).json(
        new ApiError(400, "Please verify your account", {
          redirect: "/otp",
          token: `Bearer ${tempToken}`,
        })
      );
    }

    if (user.termsAndConditions == false) {
      return res.status(400).json(
        new ApiError(400, "Please accept terms and conditions", {
          redirect: "/termsAndConditions",
        })
      );
    }

    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json(new ApiError(400, "Invalid password"));
    }

    const payload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      termsAndConditions: user.termsAndConditions,
    };

    const token = generateToken(payload, "10d");

    return res
      .status(200)
      .cookie("token", token, {})
      .json(
        new ApiResponse(200, "User logged in successfully", {
          token: `Bearer ${token}`,
          redirect: "/",
        })
      );
  } catch (error) {
    console.log("error from login", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
  } catch (error) {
    console.log("error from verifyOtp", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup, login, verifyOtp };
