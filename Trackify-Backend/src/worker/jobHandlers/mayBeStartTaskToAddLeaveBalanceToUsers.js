const logger = require("../../config/lib/logger.js");
const worker = require("../worker.js");
const LeaveAutoAddSetting = require("../../models/leaveAutoAddSetting.model.js");

async function mayBeStartTaskToAddLeaveBalanceToUsers(job) {
  try {
    const autoLeaveSettings = await LeaveAutoAddSetting.find({
      enabled: true,
      isExecuted: false,
    }).populate({ path: "workspace", select: "_id" });

    if (autoLeaveSettings && autoLeaveSettings.length > 0) {
      autoLeaveSettings.forEach(async (setting) => {
        const nextExecutionDate = setting.nextExecutionDate;
        const workspaceId = setting.workspace._id;
        const leaveSettingId = setting._id;

        if (nextExecutionDate && setting.enabled) {
          // Schedule a new job to be executed at the next execution date
          worker.createJob({
            data: {
              workspaceId,
              leaveSettingId,
            },
            jobId: `addLeaveBalanceToUsers-${workspaceId}-${leaveSettingId}`,
            name: "addLeaveBalanceToUsers",
            time: nextExecutionDate,
          });
        }
      });
    }
  } catch (error) {
    logger.error(`mayBeStartTaskToAddLeaveBalanceToUsers:: ${error.message}`);
  }

  // Remove the job from the worker processJobs object after completion.
  worker.removeJob(job.id);
}

module.exports = mayBeStartTaskToAddLeaveBalanceToUsers;
