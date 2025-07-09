const mongoose = require("mongoose");
const { calculateNextStartDate } = require("../utility/dateTime.utility.js");
const worker = require("../worker/worker.js");

const LeaveAutoAddSetting = mongoose.model("LeaveAutoAddSetting");

/**
 * @function createNewLeaveAutoPilotSetting
 * @description Create a new leave auto-add setting
 * @param {string} req.body.type - Leave type
 * @param {string} req.body.frequency - Leave frequency
 * @param {string} req.body.date - Leave date
 * @param {number} req.body.numberOfLeaves - Number of leaves
 * @returns {Object} - Created leave setting
 */
async function createNewLeaveAutoPilotSetting(req, res) {
  const { _id: userId, currentWorkspace: workspaceId } = req.user;

  const {
    date,
    frequency,
    nextExecutionDate,
    numberOfLeaves,
    recurrence,
    type,
  } = req.body;

  if (
    !type ||
    !numberOfLeaves ||
    !recurrence ||
    (recurrence === "once" && !nextExecutionDate) ||
    (recurrence === "repeat" && (!frequency || !date))
  ) {
    return res.status(400).json({
      message:
        recurrence === "once"
          ? "Missing schedule date"
          : "Missing type, frequency, date, or number of leaves",
    });
  }

  const filter = {
    workspace: workspaceId,
    type,
    recurrence,
  };

  if (frequency) {
    filter.frequency = frequency;
  }

  try {
    const existingSetting = await LeaveAutoAddSetting.findOne(filter);

    if (existingSetting) {
      return res.status(400).json({
        message:
          "Leave setting for similar preference or type is already exist, please update or delete the setting first",
      });
    }

    const newLeaveSettingData = {
      recurrence,
      workspace: workspaceId,
      user: userId,
      type,
      numberOfLeaves,
    };

    if (recurrence === "once") {
      newLeaveSettingData.nextExecutionDate = nextExecutionDate;
    } else {
      newLeaveSettingData.frequency = frequency;
      newLeaveSettingData.date = date;
    }

    const newSetting = new LeaveAutoAddSetting(newLeaveSettingData);

    await newSetting.save();

    return res.json({ newSetting });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create new setting, Server error" });
  }
}

/**
 * @function enableLeaveAutoPilotSetting
 * @description Enable a leave auto-add setting
 * @param {string} req.params.leaveSettingId - Leave setting ID
 * @returns {Object} - Updated leave setting
 */
async function enableLeaveAutoPilotSetting(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { leaveSettingId } = req.params;

  try {
    const [alreadyEnabled, selectedSetting] = await Promise.all([
      LeaveAutoAddSetting.findOne({
        workspace: workspaceId,
        enabled: true,
      }),
      LeaveAutoAddSetting.findOne({
        _id: leaveSettingId,
        workspace: workspaceId,
        enabled: false,
      }),
    ]);

    if (alreadyEnabled) {
      return res.status(400).json({
        message:
          "We are allowing only one setting to be enabled, please disable other settings first",
      });
    }

    if (!selectedSetting) {
      return res.status(400).json({
        message: "Setting not found",
      });
    }

    const nextStartDate = calculateNextStartDate(selectedSetting);

    if (!nextStartDate) {
      return res.status(400).json({
        message: "Please change the schedule date",
      });
    }

    const updateData = {
      enabled: true,
      isExecuted: false,
    };

    if (selectedSetting.recurrence === "repeat") {
      updateData.nextExecutionDate = nextStartDate;
      updateData.lastExecutionDate = selectedSetting.isExecuted
        ? selectedSetting.nextStartDate
        : "";
    }

    const updated = await LeaveAutoAddSetting.updateOne(
      {
        _id: leaveSettingId,
        workspace: workspaceId,
        enabled: false,
      },
      {
        $set: updateData,
      }
    );

    if (!updated.matchedCount) {
      return res.status(400).json({ message: "Setting not found" });
    }
    if (!updated.modifiedCount) {
      return res.status(400).json({ message: "Setting already enabled." });
    }

    worker.createJob({
      jobId: `addLeaveBalanceToUsers-${workspaceId}-${leaveSettingId}`,
      data: {
        workspaceId,
        leaveSettingId,
        frequency: selectedSetting.frequency,
      },
      name: "addLeaveBalanceToUsers",
      time: nextStartDate,
    });

    return res.json({
      updatedSetting: { _id: leaveSettingId, enabled: true },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to enable the setting, Internal Server error" });
  }
}

async function disableLeaveAutoPilotSetting(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { leaveSettingId } = req.params;

  try {
    const existingLeaveSetting = await LeaveAutoAddSetting.findOne({
      _id: leaveSettingId,
      workspace: workspaceId,
      enabled: false,
    })
      .select("_id")
      .lean();

    if (existingLeaveSetting) {
      return res.status(400).json({ message: "Setting already disabled" });
    }

    const updated = await LeaveAutoAddSetting.updateOne(
      {
        _id: leaveSettingId,
        workspace: workspaceId,
        enabled: true,
      },
      {
        $set: {
          enabled: false,
        },
      }
    );

    if (!updated.matchedCount) {
      return res.status(400).json({ message: "Setting not found" });
    }

    if (!updated.modifiedCount) {
      return res.status(400).json({ message: "Setting already enabled." });
    }

    worker.removeJob(`addLeaveBalanceToUsers-${workspaceId}-${leaveSettingId}`);

    return res.json({
      updatedSetting: { _id: leaveSettingId, enabled: false },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to enable the setting, Internal Server error",
    });
  }
}

async function updateLeaveAutoPilotSetting(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { leaveSettingId } = req.params;

  const {
    type,
    frequency,
    date,
    numberOfLeaves,
    recurrence,
    nextExecutionDate,
  } = req.body;

  if (
    !type &&
    !frequency &&
    !date &&
    !numberOfLeaves &&
    !recurrence &&
    !nextExecutionDate
  ) {
    return res.status(400).json({
      message: "Nothing to update",
    });
  }

  try {
    const existingLeaveSetting = await LeaveAutoAddSetting.findOne({
      _id: leaveSettingId,
      workspace: workspaceId,
    })
      .select("_id")
      .lean();

    if (!existingLeaveSetting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    const updateData = {};

    if (type) {
      updateData.type = type;
    }
    if (frequency) {
      updateData.frequency = frequency;
    }
    if (date) {
      updateData.date = date;
    }
    if (numberOfLeaves) {
      updateData.numberOfLeaves = numberOfLeaves;
    }

    if (recurrence) {
      updateData.recurrence = recurrence;
    }

    if (nextExecutionDate) {
      updateData.nextExecutionDate = nextExecutionDate;
    } else {
      updateData.nextExecutionDate = null;
    }

    const updatedSetting = await LeaveAutoAddSetting.findOneAndUpdate(
      {
        _id: leaveSettingId,
        workspace: workspaceId,
      },
      {
        $set: updateData,
      },
      { new: true }
    ).lean();

    return res.json({ updatedSetting });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update the setting, Internal Server error",
    });
  }
}

async function deleteLeaveAutoPilotSetting(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { leaveSettingId } = req.params;

  if (!leaveSettingId) {
    return res.status(400).json({
      message: "Provide setting to delete",
    });
  }

  try {
    const deletedInfo = await LeaveAutoAddSetting.deleteOne({
      _id: leaveSettingId,
      workspace: workspaceId,
    });

    if (!deletedInfo.deletedCount) {
      return res.status(404).json({ message: "Setting not found" });
    }

    return res.json({ deletedSettingId: leaveSettingId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to delete the setting, Internal Server error",
    });
  }
}
async function getAllLeaveAutoPilotSetting(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  try {
    const leaveSettings = await LeaveAutoAddSetting.find({
      workspace: workspaceId,
    }).lean();

    return res.json({ leaveSettings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve the settings, Internal Server error",
    });
  }
}
async function getByIdLeaveAutoPilotSetting(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { leaveSettingId } = req.params;

  if (!leaveSettingId) {
    return res.status(400).json({ message: "Missing setting id" });
  }
  try {
    const leaveSetting = await LeaveAutoAddSetting.findOne({
      _id: leaveSettingId,
      workspace: workspaceId,
    });

    if (!leaveSetting) {
      return res.status(400).json({ message: "No setting found" });
    }

    return res.json({ leaveSetting });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve the setting, Internal Server error",
    });
  }
}

module.exports = {
  createNewLeaveAutoPilotSetting,
  enableLeaveAutoPilotSetting,
  updateLeaveAutoPilotSetting,
  disableLeaveAutoPilotSetting,
  deleteLeaveAutoPilotSetting,
  getAllLeaveAutoPilotSetting,
  getByIdLeaveAutoPilotSetting,
};
