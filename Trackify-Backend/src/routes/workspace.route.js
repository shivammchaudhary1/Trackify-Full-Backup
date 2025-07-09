const express = require("express");
const {
  createWorkspace,
  switchWorkspace,
  deleteWorkspaceById,
  updateWorkspace,
  editTimer,
} = require("../controller/workspace.controller.js");

const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/create")
  .all(isAllowed)
  .post(withAsyncErrorHandling(createWorkspace));

Router.route("/workspace-actions/switch/:userId/:workspaceId")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(switchWorkspace));

Router.route("/workspace-actions/delete/:workspaceId")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(deleteWorkspaceById));

Router.route("/workspace-actions/update/:workspaceId")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateWorkspace));

Router.route("/edittimer")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(editTimer));

module.exports = Router;
