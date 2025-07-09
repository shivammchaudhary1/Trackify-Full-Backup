const express = require("express");
const {
  getProjectDetailsByName,
  getProjectDetailsByClientName,
  getProjectReport,
  getUserReport,
  report,
  generateMonthlyReport,
  savingMonthlyReport,
  adminReport,
  generateEncashMentReport,
  saveEncashmentReport,
  getEncashmentReport,
} = require("../controller/reports.controller.js");

const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/projectbyname")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getProjectDetailsByName));

Router.route("/projectbyclientname")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getProjectDetailsByClientName));

Router.route("/projectreport/:id")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getProjectReport));

Router.route("/user/:userId")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getUserReport));

Router.route("/userreport").all(isAllowed).get(withAsyncErrorHandling(report));

Router.route("/monthlyreport/:workspaceId")
  .all(isAllowed)
  .post(withAsyncErrorHandling(generateMonthlyReport));

Router.route("/savingmonthlyreport/:userId/:workspaceId")
  .all(isAllowed)
  .post(withAsyncErrorHandling(savingMonthlyReport));

Router.route("/admin-report")
  .all(isAllowed)
  .get(withAsyncErrorHandling(adminReport));

Router.route("/admin-encashment-report")
  .all(isAllowed)
  .post(withAsyncErrorHandling(generateEncashMentReport));

Router.route("/admin-encashed-leave-report")
  .all(isAllowed)
  .post(withAsyncErrorHandling(saveEncashmentReport));
Router.route("/admin-get-saved-encashed-leave-report")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getEncashmentReport));

module.exports = Router;
