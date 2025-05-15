const { SendMail } = require("../lib/nodemailer");
const User = require("../Model/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const signup = async (req, res) => {
  try {
    const { username, email, password, terms } = req.body;
    if (!terms) {
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
    const user = await User.create({
      username,
      email,
      password,
      termsAndConditions: terms,
      otp: otp,
      otpExpiry: expiry,
    });
    if (!user) {
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "6m",
      }
    );

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
          tempToken: `Bearer ${token}`,
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
  } catch (error) {
    console.log("error from login", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup };
