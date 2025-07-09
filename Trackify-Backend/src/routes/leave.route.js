const express = require("express");
const leaveController = require("../controller/leave.controller.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

//user
Router.route("/createleave")
  .all(isAllowed)
  .post(withAsyncErrorHandling(leaveController.createLeaveRequest));

Router.route("/getleaves/:userId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(leaveController.getRequestedLeaveByUser));

Router.route("/updateleave")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(leaveController.updateLeaveRequest));

Router.route("/deleteleave")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(leaveController.deleteLeaveRequest));

Router.route("/getuserleavebalance/:userId/:workspaceId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(leaveController.getUserLeaveBalance));

//admin
Router.route("/getallleaves/:userId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(leaveController.getAllLeaves));

Router.route("/updatestatus")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(leaveController.updateStatusOfLeave));

module.exports = Router;
