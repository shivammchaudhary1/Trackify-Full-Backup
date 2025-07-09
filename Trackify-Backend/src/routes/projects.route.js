const express = require("express");
const {
  createProject,
  getProjectListForUser,
  getProjectListForWorkspace,
  getProject,
  deleteProject,
  updateProject,
  getTeamMembersForProject,
  removeTeamMember,
  addTeamMember,
} = require("../controller/project.controller.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/create")
  .all(isAllowed)
  .post(withAsyncErrorHandling(createProject));

Router.route("/all")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getProjectListForUser));

Router.route("/projectlistforworkspace/:id")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getProjectListForWorkspace));

Router.route("/project/:id")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getProject));

Router.route("/update/:id")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateProject));

Router.route("/delete/:id")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(deleteProject));

Router.route("/team/:id")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getTeamMembersForProject));

Router.route("/addmember/:id")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(addTeamMember));

Router.route("/removemember/:id")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(removeTeamMember));

module.exports = Router;
