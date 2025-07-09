const express = require("express");
const {
  getAllLeaveRequests,
} = require("../controller/leave-history.controller.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/get-all/:workspaceId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getAllLeaveRequests));

module.exports = Router;
