const express = require("express");
const {
  createHoliday,
  getHolidayDetails,
  updateHolidayDetails,
  deleteHolidayDetails,
  addLeaveType,
  deleteLeaveType,
  updateLeaveTypeName,
  getLeaveTypes,
  updateLeaveBalanceManually,
  updateLeaveBalanceManuallyToAllUsers,
  getLeaveBalances,
} = require("../controller/holiday.controller.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/requestholiday")
  .all(isAllowed)
  .post(withAsyncErrorHandling(createHoliday));

Router.route("/get-user-holidays")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getHolidayDetails));

Router.route("/updateholiday")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateHolidayDetails));

Router.route("/deleteholiday/:id")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(deleteHolidayDetails));

Router.route("/updateleavebalance")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateLeaveBalanceManually));

Router.route("/updateleavebalancetoallusers")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateLeaveBalanceManuallyToAllUsers));

Router.route("/addleavetype")
  .all(isAllowed)
  .post(withAsyncErrorHandling(addLeaveType));

Router.route("/deleteleavetype")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(deleteLeaveType));

Router.route("/updateleavetype")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateLeaveTypeName));

Router.route("/getleavetypes/:userId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getLeaveTypes));

Router.route("/getleavebalances/:workspaceId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getLeaveBalances));

module.exports = Router;
