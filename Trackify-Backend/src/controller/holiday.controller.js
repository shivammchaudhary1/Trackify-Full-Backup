const mongoose = require("mongoose");
const { USER_STATUS } = require("../config/utility/user.utility");

const Holiday = mongoose.model("Holiday");
const Workspace = mongoose.model("Workspace");
const User = mongoose.model("User");
const Leave = mongoose.model("Leave");
const LeaveBalance = mongoose.model("LeaveBalance");
const LeaveHistory = mongoose.model("LeaveHistory");

/*
 * Create a new holiday
 */
async function createHoliday(req, res) {
  const { _id: userId, currentWorkspace: workspaceId } = req.user;
  const { title, date, description, type } = req.body;

  try {
    if (!title || !date || !type) {
      return res
        .status(400)
        .json(
          "Missing required one of the following required field, title, date or leave type."
        );
    }

    const newHoliday = new Holiday({
      title,
      date,
      description,
      workspace: workspaceId,
      type,
      user: userId,
    });

    await newHoliday.save();

    await Workspace.updateOne(
      { _id: workspaceId },
      { $push: { holidays: newHoliday._id } }
    );

    return res.status(201).json({ newHoliday });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(`Failed to create Holiday: ${error.message}`);
  }
}

/*
 * Retrieve user's applied leaves and all the holidays in a workspace
 */
async function getHolidayDetails(req, res) {
  const { _id: userId, currentWorkspace: workspaceId } = req.user;

  try {
    const [leaves, holidays] = await Promise.all([
      Leave.find({
        user: userId,
        workspace: workspaceId,
      }).lean(),
      Holiday.find({
        workspace: workspaceId,
      }).lean(),
    ]);

    return res.status(200).json({
      workspaceHoliday: holidays,
      userHoliday: leaves,
    });
  } catch (error) {
    return res
      .status(500)
      .json(`Failed to get holiday details: ${error.message}`);
  }
}

/*
 * Update a holiday
 */
async function updateHolidayDetails(req, res) {
  const workspaceId = req.user.currentWorkspace;
  const { holidayId, title, date, description, type } = req.body;

  try {
    const updatedHoliday = await Holiday.findOneAndUpdate(
      { _id: holidayId, workspace: workspaceId },
      { $set: { title, date, description, type } },
      { new: true }
    );

    if (!updatedHoliday) {
      return res.status(404).json("Holiday details not found");
    }

    res.json({ status: "success", holiday: updatedHoliday });
  } catch (error) {
    return res
      .status(500)
      .json(`Failed to update holiday details: ${error.message}`);
  }
}

/*
 * Delete holiday
 */
async function deleteHolidayDetails(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { holidayId } = req.body;

  try {
    await Promise.all([
      Holiday.deleteOne({ _id: holidayId, workspace: workspaceId }),
      Workspace.updateOne(
        { _id: workspaceId },
        { $pull: { holidays: holidayId } }
      ),
    ]);

    return res
      .status(200)
      .json({ message: "Holiday Details Deleted successfully", holidayId });
  } catch (error) {
    return res
      .status(500)
      .json(`Failed to delete Holiday Details: ${error.message}`);
  }
}

/*
 * Add a new leave type
 */
async function addLeaveType(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { leaveType, title } = req.body;

  if (!leaveType) {
    return res
      .status(400)
      .json({ success: false, error: "Leave type is required" });
  }

  try {
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "leaveTypes.leaveType": { $regex: new RegExp(`^${leaveType}$`, "i") },
    })
      .select("_id")
      .lean();

    if (workspace) {
      return res
        .status(409)
        .json({ success: false, error: "Leave type already exists." });
    }

    // Proceed to add the new leave type
    await Promise.all([
      Workspace.updateOne(
        { _id: workspaceId },
        {
          $push: {
            leaveTypes: { leaveType, title, paid: true, isActive: true },
          },
        }
      ),
      LeaveBalance.updateMany(
        {
          workspace: workspaceId,
        },
        {
          $push: {
            leaveBalance: { type: leaveType, title, value: 0, isActive: true },
          },
        }
      ),
    ]);

    const updatedWorkspace = await Workspace.findOne({
      _id: workspaceId,
    }).lean();

    res.status(200).json({ success: true, user: updatedWorkspace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

/*
 * Delete a leave type
 */
async function deleteLeaveType(req, res) {
  const { currentWorkspace: workspaceId } = req.user;
  const { leaveType } = req.body;

  if (!leaveType) {
    return res.status(400).json({
      success: false,
      error: "Failed to delete leave type, invalid leave type",
    });
  }

  try {
    await Promise.all([
      Workspace.updateOne(
        { _id: workspaceId },
        { $pull: { leaveTypes: { leaveType } } }
      ),
      LeaveBalance.updateMany(
        {
          workspace: workspaceId,
        },
        {
          $pull: {
            leaveBalance: {
              type: leaveType,
            },
          },
        }
      ),
    ]);

    const currentWorkspace = await Workspace.findOne({
      _id: workspaceId,
    }).lean();

    res.status(200).json({ success: true, user: currentWorkspace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

/*
 * Update a leave type name
 */
const updateLeaveTypeName = async (req, res) => {
  const { _id: userId, currentWorkspace: workspaceId } = req.user;

  try {
    const {
      oldLeaveType,
      newLeaveType,
      paid,
      isActive = false,
      title,
    } = req.body;

    if (!oldLeaveType || !newLeaveType || !title) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const currentWorkspace = await Workspace.findOne({ _id: workspaceId });

    if (!currentWorkspace) {
      return res
        .status(404)
        .json({ success: false, error: "Current workspace not found" });
    }

    // Check if the old leave type exists in the leaveTypes array
    const oldLeaveTypeIndex = currentWorkspace.leaveTypes.findIndex(
      (type) => type.leaveType === oldLeaveType
    );

    if (oldLeaveTypeIndex === -1) {
      return res
        .status(400)
        .json({ success: false, error: "Old leave type not found" });
    }

    // Update name of leave type in the workspace

    currentWorkspace.leaveTypes[oldLeaveTypeIndex].leaveType = newLeaveType;
    currentWorkspace.leaveTypes[oldLeaveTypeIndex].paid = paid;
    currentWorkspace.leaveTypes[oldLeaveTypeIndex].isActive = isActive;
    currentWorkspace.leaveTypes[oldLeaveTypeIndex].title = title;

    await LeaveBalance.updateMany(
      {
        workspace: workspaceId,
        "leaveBalance.type": oldLeaveType,
      },
      {
        $set: {
          "leaveBalance.$.type": newLeaveType,
          "leaveBalance.$.isActive": isActive,
          "leaveBalance.$.paid": paid,
          "leaveBalance.$.title": title,
        },
      }
    );

    // Save the updated workspace
    const updatedWorkspace = await currentWorkspace.save();

    res.status(200).json({ success: true, data: { user: updatedWorkspace } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/*
 * Get leave types, for current workspace
 */
async function getLeaveTypes(req, res) {
  const { _id: userId } = req.user;
  const workspaceId = req.user.currentWorkspace;

  try {
    const currentWorkspace = await Workspace.findOne({
      _id: workspaceId,
    })
      .select("leaveTypes")
      .lean();

    if (!currentWorkspace) {
      return res
        .status(404)
        .json({ success: false, error: "Current workspace not found" });
    }

    // Ensure leaveTypes is an array, handle the case where it's undefined or null
    const leaveTypes = currentWorkspace.leaveTypes || [];

    res.status(200).json({ success: true, leaveTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

/*
 * Get leave balances for all the users in a workspace
 */
async function getLeaveBalances(req, res) {
  const { currentWorkspace: workspaceId } = req.user;

  try {
    const leaveBalances = await LeaveBalance.find({
      workspace: workspaceId,
    })
      .populate({
        path: "user",
        select: "_id name",
        match: { [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE },
      })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      // User will be null for inactive users, so filter those leave balances
      leaveBalances: leaveBalances.filter((leave) => leave.user),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

/*
 * Update leave balance manually
 */
async function updateLeaveBalanceManually(req, res) {
  const { _id: adminId, currentWorkspace: workspaceId } = req.user;

  const { userId, leaveType, amount } = req.body;
  try {
    if (!userId || !leaveType) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const userLeaveBalance = await LeaveBalance.findOne({
      user: userId,
      workspace: workspaceId,
      // Match the specific leave type
      "leaveBalance.type": leaveType,
    });

    if (!userLeaveBalance) {
      return res
        .status(404)
        .json({ success: false, error: "User Leave Balance not found" });
    }

    const updatedLeaveBalance = await LeaveBalance.findOneAndUpdate(
      {
        user: userId,
        workspace: workspaceId,
        // Match the specific leave type
        "leaveBalance.type": leaveType,
      },
      {
        $set: {
          // Update the value for the matched leave type
          "leaveBalance.$.value": parseFloat(parseFloat(amount).toFixed(2)),
        },
      },
      { new: true }
    );

    const leaveBalanceData = userLeaveBalance.leaveBalance.find(
      (leave) => leave.type === leaveType
    );

    LeaveHistory.create({
      action: "updatedByAdmin",
      additionalInfo: "Leave balance updated manually",
      author: adminId,
      leaveType: leaveType,
      leaveChangesCount: parseFloat(amount).toFixed(2),
      previousLeaveCount: leaveBalanceData.value,
      newLeaveCount: parseFloat(amount).toFixed(2),
      user: userId,
      workspace: workspaceId,
    });

    return res.status(200).json({
      success: true,
      leaveBalance: updatedLeaveBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

/*
 * Update leave balance manually to all users
 */
async function updateLeaveBalanceManuallyToAllUsers(req, res) {
  try {
    const { _id: adminId, currentWorkspace: workspaceId } = req.user;
    const { leaveType, amount } = req.body;

    // Retrieve the updated leave balances to create history entries
    // const leaveBalances = await LeaveBalance.find({
    //   workspace: workspaceId,
    //   "leaveBalance.type": leaveType,
    // }).populate({
    //   path: "user",
    //   select: "_id name",
    //   match: { status: "active" },
    // });

    // await LeaveBalance.updateMany(
    //   { workspace: workspaceId, "leaveBalance.type": leaveType },
    //   { $inc: { "leaveBalance.$.value": amount } }
    // );

    // Retrieve the current leave balances for all users in the workspace
    const leaveBalances = await LeaveBalance.find({
      workspace: workspaceId,
      "leaveBalance.type": leaveType,
    }).populate({
      path: "user",
      select: "_id name",
      match: { [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE },
    });

    // Prepare bulk operations to update leave balances and create leave history entries
    const bulkOperations = [];
    const leaveHistories = [];

    leaveBalances.forEach((leaveBalance) => {
      if (leaveBalance.user) {
        const leaveBalanceData = leaveBalance.leaveBalance.find(
          (leave) => leave.type === leaveType
        );
        const previousLeaveCount = leaveBalanceData.value;
        const newLeaveCount = Number(previousLeaveCount) + Number(amount);

        // Update leave balance operation
        bulkOperations.push({
          updateOne: {
            filter: { _id: leaveBalance._id, "leaveBalance.type": leaveType },
            update: { $set: { "leaveBalance.$.value": newLeaveCount } },
          },
        });

        // Create leave history entry
        leaveHistories.push({
          action: "updatedByAdmin",
          additionalInfo: "Leave balance added using bulk action",
          author: adminId,
          leaveType,
          previousLeaveCount: previousLeaveCount,
          newLeaveCount: newLeaveCount,
          user: leaveBalance.user._id,
          workspace: workspaceId,
        });
      }
    });

    // Execute bulk update operations
    await LeaveBalance.bulkWrite(bulkOperations);

    // Insert leave history entries
    await LeaveHistory.insertMany(leaveHistories);

    const updatedLeaveBalances = await LeaveBalance.find({
      workspace: workspaceId,
    })
      .populate({
        path: "user",
        select: "_id name",
        match: { [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE },
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      leaveBalances: updatedLeaveBalances.filter((leave) => leave.user),
    });
  } catch (error) {
    console.error("Error updating leave balances:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update leave balances" });
  }
}

module.exports = {
  getHolidayDetails,
  createHoliday,
  updateHolidayDetails,
  deleteHolidayDetails,
  addLeaveType,
  deleteLeaveType,
  updateLeaveTypeName,
  getLeaveTypes,
  updateLeaveBalanceManually,
  updateLeaveBalanceManuallyToAllUsers,
  getLeaveBalances,
};
