const bcrypt = require("bcrypt");
/**
 * Hashes a password using bcrypt with a generated salt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
const hashPassword = async (password) => {
  // Generate a salt with the specified number of rounds or default to 10
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT, 10) || 10);

  // Hash the password using the generated salt
  const hashedPassword = await bcrypt.hash(password, salt);

  // Return the hashed password
  return hashedPassword;
};

/**
 * Compares a plain text password with a hashed password to check for a match.
 * @param {string} password - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, otherwise false.
 */
const comparePassword = (password, hashedPassword) => {
  // Use bcrypt to compare the plain text password with the hashed password
  return bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
