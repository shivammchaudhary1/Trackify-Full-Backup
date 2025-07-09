const { USER_STATUS } = require("../../config/utility/user.utility.js");
const LeaveAutoAddSetting = require("../../models/leaveAutoAddSetting.model.js");
const LeaveBalance = require("../../models/leaveBalance.model.js");
const LeaveHistory = require("../../models/leaveHistory.model.js");
const { LEAVE_ADD_RECURRENCE } = require("../../config/utility/utility.js");
const { calculateNextStartDate } = require("../../utility/dateTime.utility.js");
const worker = require("../worker.js");
const logger = require("../../config/lib/logger.js");

async function addLeaveBalanceToUsers(job) {
  const { workspaceId, leaveSettingId } = job.data;

  try {
    const leaveSetting = await LeaveAutoAddSetting.findOne({
      _id: leaveSettingId,
      workspace: workspaceId,
    });

    if (
      !leaveSetting ||
      !leaveSetting.enabled ||
      !leaveSetting.nextExecutionDate
    ) {
      logger.error(
        "addLeaveBalanceToUsers:: Leave setting not found or is disabled"
      );
    }

    // Fetch all leave balances in the workspace with active users
    const leaveBalances = await LeaveBalance.find({
      workspace: workspaceId,
    }).populate({
      path: "user",
      select: "_id name statuses",
      match: { [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE },
    });

    // Populate to check if the user is active
    // Filter to only include active users
    const activeLeaveBalances = leaveBalances.filter(
      (lb) =>
        lb?.user && lb?.user?.statuses.get(workspaceId) === USER_STATUS.ACTIVE
    );
    for (const leaveBalance of activeLeaveBalances) {
      // Find the leave type in leaveBalance and update it
      const leaveType = leaveBalance.leaveBalance.find(
        (lb) => lb.type === leaveSetting.type
      );

      if (leaveType) {
        leaveType.value += leaveSetting.numberOfLeaves;
      } else {
        // If the leave type doesn't exist, add it
        leaveBalance.leaveBalance.push({
          type: leaveSetting.type,
          value: leaveSetting.numberOfLeaves,
          consumed: 0,
          isActive: true,
        });
      }

      // Save the updated leave balance
      await leaveBalance.save();

      await LeaveHistory.create({
        action: "addedByAdmin",
        leaveType: leaveSetting.type,
        leaveChangesCount: leaveSetting.numberOfLeaves,
        previousLeaveCount: leaveType.value,
        newLeaveCount: leaveType.value + leaveSetting.numberOfLeaves,
        user: leaveBalance.user._id,
        workspace: workspaceId,
      });
    }

    if (leaveSetting.lastExecutionDate) {
      const alreadyInHistory = leaveSetting.executionHistory.find(
        (historyDate) => historyDate === leaveSetting.lastExecutionDate
      );

      if (!alreadyInHistory) {
        leaveSetting.executionHistory.push(leaveSetting.lastExecutionDate);
      }
    }

    if (leaveSetting.recurrence === LEAVE_ADD_RECURRENCE.REPEAT) {
      const nextStartDate = calculateNextStartDate(
        leaveSetting,
        leaveSetting.nextExecutionDate
      );

      leaveSetting.isExecuted = false;
      leaveSetting.lastExecutionDate = leaveSetting.nextExecutionDate;
      leaveSetting.nextExecutionDate = nextStartDate;

      await leaveSetting.save();

      // Schedule a new job to be executed
      worker.createJob({
        data: {
          workspaceId,
          leaveSettingId,
        },
        name: "addLeaveBalanceToUsers",
        jobId: "addLeaveBalanceToUsers",
        time: nextStartDate,
      });
    } else {
      leaveSetting.isExecuted = true;
      leaveSetting.lastExecutionDate = leaveSetting.nextExecutionDate;
      leaveSetting.nextExecutionDate = null;

      await leaveSetting.save();
      // If Job was scheduled to execute once only then remove the job after completion.
      worker.removeJob(
        `addLeaveBalanceToUsers-${workspaceId}-${leaveSettingId}`
      );
    }
    logger.info(
      "addLeaveBalanceToUsers:: Task completed: addLeaveBalanceToUsers"
    );
  } catch (error) {
    logger.error(
      `addLeaveBalanceToUsers:: Failed to add leave balance, ${error.message}`
    );
  }
}

module.exports = addLeaveBalanceToUsers;
