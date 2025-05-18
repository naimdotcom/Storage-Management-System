const { hashPassword, comparePassword } = require("../lib/bcrypt");
const { generateToken } = require("../lib/Jwt");
const { SendMail } = require("../lib/nodemailer");
const { File } = require("../Model/file.model");
const Storage = require("../Model/storage.model");
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

    const createStorageForUser = await Storage.create({
      userId: user._id,
      totalStorage: 16113868800, // 15GB in bytes = 15 * 1024 * 1024 * 1024
    });
    const createRootFolder = await File.create({
      ownerId: user._id,
      name: "root",
      size: 0,
      type: "folder",
      parentId: null,
      isRootFolder: true,
      mimeType: "folder",
    });
    if (!createStorageForUser || !createRootFolder) {
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }

    user.rootFolderId = createRootFolder._id;
    user.storageId = createStorageForUser._id;
    await user.save();

    const token = generateToken({ email: user.email }, "1d");

    // send otp to user
    const mail = await SendMail(
      otpTemplate(otp),
      email,
      "Email Verification Code"
    );

    return res
      .status(200)
      .cookie("token", token, {})
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
      const tempToken = generateToken({ email: user.email }, "1h");
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
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
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
    const user = req.user;
    if (!otp) {
      return res
        .status(400)
        .json(new ApiError(400, "Please enter otp", { success: false }));
    }

    const userFound = await User.findOne({ email: user.email });
    if (!userFound) {
      return res
        .status(400)
        .json(new ApiError(400, "User not found", { success: false }));
    }

    if (userFound.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json(new ApiError(400, "Otp expired", { success: false }));
    }

    if (userFound.otp !== otp) {
      return res
        .status(400)
        .json(new ApiError(400, "Invalid otp", { success: false }));
    }

    userFound.isVerified = true;
    userFound.otp = null;
    userFound.otpExpiry = null;
    await userFound.save();

    return res.status(200).json(
      new ApiResponse(200, "User verified successfully", {
        success: true,
      })
    );
  } catch (error) {
    console.log("error from verifyOtp", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const user = req.user;
    const userFound = await User.findById(user.id);
    if (!userFound) {
      return res
        .status(400)
        .json(new ApiError(400, "User not found", { success: false }));
    }

    const { otp, expiry } = otpGenerator();
    userFound.otp = otp;
    userFound.otpExpiry = expiry;
    await userFound.save();
    const token = generateToken({ id: userFound._id }, "1h");

    const mail = await SendMail(
      otpTemplate(otp),
      userFound.email,
      "Email Verification Code"
    );
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000, // 1 hour
      })
      .json(
        new ApiResponse(200, "Otp sent successfully", {
          redirect: "/otp",
          token: `Bearer ${token}`,
          success: true,
        })
      );
  } catch (error) {
    console.log("error from resendOtp", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json(new ApiError(400, "Please enter email"));
    }
    const FindUser = await User.findOne({ email });
    if (!FindUser) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    const date = new Date();
    const ForgotPassWordExpiry = new Date(date.getTime() + 60 * 60 * 1000); // Expiry in 1 hour from now

    FindUser.resetPasswordExpires = ForgotPassWordExpiry;
    const { otp, expiry } = otpGenerator();
    FindUser.otp = otp;
    FindUser.otpExpiry = expiry;
    await FindUser.save();
    const token = generateToken({ email: FindUser.email }, "1d");
    const mail = await SendMail(
      otpTemplate(otp),
      FindUser.email,
      "Email Verification Code"
    );

    return res.status(200).json(
      new ApiResponse(200, "Otp sent successfully", {
        redirect: "/otp",
        token: `Bearer ${token}`,
      })
    );
  } catch (error) {
    console.log("error from forgotPassword", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json(new ApiError(400, "Please enter password", { success: false }));
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json(new ApiError(400, "Password not matched", { success: false }));
    }

    const user = req.user;
    const userFound = await User.findById(user.id);
    if (!userFound) {
      return res
        .status(400)
        .json(new ApiError(400, "User not found", { success: false }));
    }
    if (userFound.resetPasswordExpires < new Date()) {
      return res
        .status(400)
        .json(new ApiError(400, "Link expired", { success: false }));
    }

    const passwordHashed = await hashPassword(newPassword);
    userFound.password = passwordHashed;
    await userFound.save();
    return res.status(200).json(
      new ApiResponse(200, "Password reset successfully", {
        success: true,
      })
    );
  } catch (error) {
    console.log("error from resetPassword", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userAuth = async (req, res) => {
  try {
    const user = req.user;
    const userFound = await User.findById(user.id).select(
      "-password -otp -otpExpiry -resetPasswordExpires -termsAndConditions"
    );
    if (!userFound) {
      return res
        .status(400)
        .json(new ApiError(400, "User not found", { success: false }));
    }

    // todo: if user not verified then send otp and other process

    return res.status(200).json(
      new ApiResponse(200, "User found", {
        success: true,
        user: userFound,
      })
    );
  } catch (error) {
    console.log("error from userAuth", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const renameUserName = async (req, res) => {
  try {
    const { username } = req.body;
    const user = req.user;
    const userFound = await User.findById(user.id);
    if (!userFound) {
      return res
        .status(400)
        .json(new ApiError(400, "User not found", { success: false }));
    }
    userFound.username = username;
    await userFound.save();
    return res.status(200).json(
      new ApiResponse(200, "User found", {
        success: true,
        user: userFound,
      })
    );
  } catch (error) {
    console.log("error from userAuth", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  userAuth,
  renameUserName,
};
