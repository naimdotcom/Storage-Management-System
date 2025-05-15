const crypto = require("crypto");

/**
 * Generates a 6 digit OTP, and its expiry in 5 minutes from the current time
 * @returns {Object} An object containing the OTP and its expiry
 */
const otpGenerator = () => {
  const otp = crypto.randomInt(100000, 999999); // Generate a 6 digit OTP
  const date = new Date();
  const expiry = new Date(date.getTime() + 5 * 60 * 1000); // Expiry in 5 minutes from now

  return { otp, expiry };
};

module.exports = { otpGenerator };
