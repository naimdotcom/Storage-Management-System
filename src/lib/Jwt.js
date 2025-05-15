const jwt = require("jsonwebtoken");

const generateToken = (payload, time) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log("error from verifyToken", error);
    return null;
  }
};

module.exports = { generateToken, verifyToken };
