const express = require("express");
const {
  signup,
  changeRole,
  getUser,
  invite,
  acceptWorkspaceInvitation,
  entries,
  deleteEntry,
  deleteUserFromWorkspace,
  editEntry,
  editEntryTitle,
  getAllUsersFromSelectedWorkspace,
  changeUserStatus,
  getAssets,
  addAsset,
  updateAsset,
  deleteAsset,
} = require("../controller/user.controller.js");

const authenticate = require("../middleware/auth.middleware.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

// Routes without authentication
Router.route("/create").all(isAllowed).post(withAsyncErrorHandling(signup));

Router.route("/accept-invitation/:token")
  .all(isAllowed)
  .post(withAsyncErrorHandling(acceptWorkspaceInvitation));

// Routes with authentication
Router.route("/user-actions/read/:userId")
  .all(isAllowed, authenticate)
  .get(withAsyncErrorHandling(getUser));

Router.route("/user-actions/change-role")
  .all(isAllowed, authenticate)
  .patch(withAsyncErrorHandling(changeRole));

Router.route("/user-actions/change-status")
  .all(isAllowed, authenticate)
  .patch(withAsyncErrorHandling(changeUserStatus));

Router.route("/invite")
  .all(isAllowed, authenticate)
  .post(withAsyncErrorHandling(invite));

Router.route("/entries")
  .all(isAllowed, authenticate)
  .get(withAsyncErrorHandling(entries));

Router.route("/entry/delete")
  .all(isAllowed, authenticate)
  .delete(withAsyncErrorHandling(deleteEntry));

Router.route("/entry/edit/:entryId")
  .all(isAllowed, authenticate)
  .patch(withAsyncErrorHandling(editEntry));

Router.route("/entry/title")
  .all(isAllowed, authenticate)
  .patch(withAsyncErrorHandling(editEntryTitle));

Router.route("/users/all")
  .all(isAllowed, authenticate)
  .get(withAsyncErrorHandling(getAllUsersFromSelectedWorkspace));

Router.route("/deleteuserfromworkspace/:workspaceId")
  .all(isAllowed, authenticate)
  .delete(withAsyncErrorHandling(deleteUserFromWorkspace));

Router.route("/assets")
  .all(isAllowed, authenticate)
  .get(withAsyncErrorHandling(getAssets))
  .post(withAsyncErrorHandling(addAsset));

Router.route("/assets/update")
  .all(isAllowed, authenticate)
  .patch(withAsyncErrorHandling(updateAsset));

Router.route("/assets/delete")
  .all(isAllowed, authenticate)
  .delete(withAsyncErrorHandling(deleteAsset));

module.exports = Router;
