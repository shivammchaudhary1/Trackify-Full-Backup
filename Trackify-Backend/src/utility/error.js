const chalk = require("chalk");

/**
 * Express error handling middleware
 * Logs detailed errors for developers and returns user-friendly messages.
 */
const throwError = ({ err, message, req, res }) => {
  // Log error details for developers
  console.error(chalk.red(`[Error] ${new Date().toISOString()}`));
  console.error(chalk.yellow(`Path: ${req.originalUrl}`));
  console.error(chalk.cyan(`Method: ${req.method}`));
  console.error(chalk.magenta(`Message: ${err?.message || "Unknown Error"}`));
  console.error(
    chalk.gray(`Stack: ${err.stack || "No stack trace available"}`)
  );

  // Customize user-facing messages based on the error type
  let statusCode = 500;
  let userMessage =
    message ?? "An unexpected error occurred. Please try again later.";

  if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    userMessage = message ?? "Invalid data provided. Please check your input.";
  } else if (err.name === "MongoError" && err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 400;
    userMessage = message ?? "Duplicate entry. The record already exists.";
  } else if (err.name === "CastError") {
    // Mongoose cast error (e.g., invalid ObjectId)
    statusCode = 400;
    userMessage = "Invalid ID format.";
  } else if (err.name === "FetchError") {
    // Custom fetch error handling
    statusCode = 502;
    userMessage =
      message ??
      "Error communicating with an external service. Please try again later.";
  } else if (err.statusCode) {
    // Errors with explicitly defined status codes
    statusCode = err.statusCode;
    userMessage = err.message || userMessage;
  }

  // Return the error response to the user
  res.status(statusCode).json({
    message: userMessage,
  });
};

module.exports = throwError;
