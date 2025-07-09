const express = require("express");
const {
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
  newManualEntry,
  fetchEntries,
  markEntryAsBillableNonBillable,
  markEntryAsBulkIsBillableNonBillable,
} = require("../controller/timer.controller.js");

const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/timer-actions/start")
  .all(isAllowed)
  .post(withAsyncErrorHandling(startTimer));

Router.route("/timer-actions/stop")
  .all(isAllowed)
  .post(withAsyncErrorHandling(stopTimer));

Router.route("/timer-actions/pause")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(pauseTimer));

Router.route("/timer-actions/resume")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(resumeTimer));

Router.route("/timer-actions/manualEntry/:userId")
  .all(isAllowed)
  .post(withAsyncErrorHandling(newManualEntry));

Router.route("/entries/get-entries/:lastFetchedDate")
  .all(isAllowed)
  .get(withAsyncErrorHandling(fetchEntries));

Router.route("/entries/billable/nonBillable/:entryId")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(markEntryAsBillableNonBillable));

Router.route("/entries/billable/bulk-update")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(markEntryAsBulkIsBillableNonBillable));

module.exports = Router;
