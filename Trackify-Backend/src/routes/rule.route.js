const express = require("express");

const {
  createRule,
  updateRule,
  getRule,
  deleteRule,
  toggleOvertime,
} = require("../controller/rule.controller.js");

const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/create").all(isAllowed).post(withAsyncErrorHandling(createRule));

Router.route("/update")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateRule));

Router.route("/get/:workspaceId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getRule));

Router.route("/delete")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(deleteRule));

// Overtime toggle
Router.route("/toggleOvertime")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(toggleOvertime));

module.exports = Router;
