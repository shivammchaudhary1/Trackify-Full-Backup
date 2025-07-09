const bcrypt = require("bcryptjs");

// Function to encrypt (hash) a password
// This function takes a plain text password and encrypts it using a salt
// value. The salt value is a random string that is used to encrypt the
// password. The function returns the encrypted password.
/**
 * Encrypt (hash) a password
 * @param {string} password - The password to encrypt
 * @return {Promise<string>} - The encrypted password
 */
async function encryptPassword(password) {
  const saltRounds = 10;

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error("Password encryption failed.");
  }
}

/**
 * Compare a given password to a hashed password
 * @param {string} inputPassword - The input password to compare
 * @param {string} hashedPassword - The hashed password to compare against
 * @return {Promise<boolean>} - Whether the passwords match
 */
async function comparePassword(inputPassword, hashedPassword) {
  if (!inputPassword || !hashedPassword) {
    // If either the input password or the hashed password is missing, return false
    return false;
  }

  try {
    // Use bcrypt.compare to compare the two passwords
    return await bcrypt.compare(inputPassword, hashedPassword);
  } catch (error) {
    // If there is an error, throw a new error with a helpful message
    throw new Error("Failed to check password");
  }
}

module.exports = { encryptPassword, comparePassword };
