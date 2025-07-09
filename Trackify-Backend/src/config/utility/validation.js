/**
 * Validates if the given password is strong.
 * A strong password must contain at least:
 * - One lowercase letter
 * - One uppercase letter
 * - One numeric digit
 * - One special character
 * - Minimum length of 6 characters
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} - Returns true if the password is strong, otherwise false.
 */
function checkPasswordIdValid(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
  return passwordRegex.test(password);
}

/**
 * Checks if the given email is valid.
 * A valid email address must contain:
 * - At least one alphanumeric character
 * - Exactly one '@' character
 * - At least one alphanumeric character
 * - A domain name with at least two characters
 *   (e.g. example.in, example.com, example.co.uk)
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email address is valid, otherwise false.
 */
const checkEmailIsValid = (email) => {
  // This is a very basic email validation. It does not check for
  // valid domain names, or if the email address actually exists.
  const emailRegex = /^\w+([.-]\w+)*@\w+([.-]\w+)*(\.\w{2,})+$/;
  return emailRegex.test(email);
};

module.exports = { checkPasswordIdValid, checkEmailIsValid };
