const express = require("express");
const authenticateJWT = require("../middleware/auth.middleware.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");
const {
    getSignedUrlForUploadApi,
    getSignedUrlForDeleteApi
} = require("../controller/file.controller.js");

const {
  updateProfile,
  changePassword,
  sendForgetLinkToMail,
  verifyEmailLinkAndUpdate,
  changeTheme,
  updateDemoState,
  getDemoState,
} = require("../controller/profile.controller.js");

const Router = express.Router();

Router.route("/changeTheme")
  .all(isAllowed, authenticateJWT)
  .patch(withAsyncErrorHandling(changeTheme));

Router.route("/update-profile")
  .all(isAllowed, authenticateJWT)
  .patch(withAsyncErrorHandling(updateProfile));

Router.route("/change-password/:id")
  .all(isAllowed, authenticateJWT)
  .patch(withAsyncErrorHandling(changePassword));

Router.route("/forget-password")
  .all(isAllowed)
  .post(withAsyncErrorHandling(sendForgetLinkToMail));

Router.route("/forget-password/:id/:token")
  .all(isAllowed)
  .post(withAsyncErrorHandling(verifyEmailLinkAndUpdate));
Router.route("/demo-state")
  .all(isAllowed, authenticateJWT)
  .get(withAsyncErrorHandling(getDemoState));
Router.route("/demo-state")
  .all(isAllowed, authenticateJWT)
  .patch(withAsyncErrorHandling(updateDemoState));
Router.route('/picture')
  .all(isAllowed)
  .put(withAsyncErrorHandling(getSignedUrlForUploadApi))
  .delete(withAsyncErrorHandling(getSignedUrlForDeleteApi));
  
module.exports = Router;
