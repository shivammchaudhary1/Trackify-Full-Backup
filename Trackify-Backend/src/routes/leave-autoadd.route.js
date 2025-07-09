const express = require("express");
const leaveAddSettingController = require("../controller/leaveAutoAddSetting.controller.js");
const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/create")
  .all(isAllowed)
  .post(
    withAsyncErrorHandling(
      leaveAddSettingController.createNewLeaveAutoPilotSetting
    )
  );

Router.route("/get-all")
  .all(isAllowed)
  .get(
    withAsyncErrorHandling(
      leaveAddSettingController.getAllLeaveAutoPilotSetting
    )
  );

Router.route("/update/:leaveSettingId")
  .all(isAllowed)
  .patch(
    withAsyncErrorHandling(
      leaveAddSettingController.updateLeaveAutoPilotSetting
    )
  );

Router.route("/enable/:leaveSettingId")
  .all(isAllowed)
  .patch(
    withAsyncErrorHandling(
      leaveAddSettingController.enableLeaveAutoPilotSetting
    )
  );

Router.route("/disable/:leaveSettingId")
  .all(isAllowed)
  .patch(
    withAsyncErrorHandling(
      leaveAddSettingController.disableLeaveAutoPilotSetting
    )
  );

Router.route("/delete/:leaveSettingId")
  .all(isAllowed)
  .delete(
    withAsyncErrorHandling(
      leaveAddSettingController.deleteLeaveAutoPilotSetting
    )
  );

Router.route("/get/:leaveSettingId")
  .all(isAllowed)
  .get(
    withAsyncErrorHandling(
      leaveAddSettingController.getByIdLeaveAutoPilotSetting
    )
  );

module.exports = Router;
