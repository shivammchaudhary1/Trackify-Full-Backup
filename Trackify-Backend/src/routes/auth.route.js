const express = require("express");

const {
  login,
  logout,
  isAuthenticated,
} = require("../controller/auth.controller.js");
const authenticateJWT = require("../middleware/auth.middleware.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/login").all(isAllowed).post(withAsyncErrorHandling(login));

Router.route("/logout")
  .all(isAllowed, authenticateJWT)
  .post(withAsyncErrorHandling(logout));

Router.route("/isAuthenticated")
  .all(isAllowed, authenticateJWT)
  .post(withAsyncErrorHandling(isAuthenticated));

module.exports = Router;
