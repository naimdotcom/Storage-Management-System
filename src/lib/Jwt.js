const jwt = require("jsonwebtoken");

const generateToken = (payload, time) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
