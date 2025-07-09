const mongoose = require("mongoose");
const { sendEmail } = require("../config/lib/nodemailer.js");
const { USER_STATUS } = require("../config/utility/user.utility.js");
const {
  leaveNotificationEmailTemplate,
  leaveApplicationConfirmationEMailTemplate,
} = require("../config/utility/htmlTemplate.js");
const { handleLeave } = require("../config/utility/utility.js");
const { config } = require("../config/env/default.js");

const Leave = mongoose.model("Leave");
const LeaveBalance = mongoose.model("LeaveBalance");
const User = mongoose.model("User");
const Workspace = mongoose.model("Workspace");
const Holiday = mongoose.model("Holiday");
const LeaveHistory = mongoose.model("LeaveHistory");

/*
 * Create a leave request
 */
async function createLeaveRequest(req, res) {
  const { _id: userId, currentWorkspace: workspaceId } = req.user;
  const {
    title,
    type,
    startDate,
    endDate,
    dailyDetails,
    numberOfDays,
    description,
  } = req.body;

  // Check if required fields are present
  if (!title || !type || !startDate || !endDate || !numberOfDays) {
    return res.status(400).json({
      message:
        "Missing one of the required fields, title, type, startDate, endDate, numberOfDays",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await Workspace.findOne({
      _id: workspaceId,
    })
      .select("users")
      .lean();

    const adminUserIds = workspace.users
      .filter((userObj) => userObj.isAdmin)
      .map((user) => user.user);

    const [existingLeave, usersLeaveBalance, adminUsers, user, holidays] =
      await Promise.all([
        Leave.findOne({
          user: userId,
          $or: [{ status: "pending" }, { status: "approved" }],
          startDate: { $lte: end },
          endDate: { $gte: start },
        }).lean(),
        LeaveBalance.findOne({
          user: userId,
          workspace: workspaceId,
        }).lean(),
        User.find({
          _id: { $in: adminUserIds },
          workspaces: { $in: [workspaceId] },
          [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE,
        })
          .select("name email")
          .lean(),
        User.findOne({
          _id: userId,
          currentWorkspace: workspaceId,
          [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE,
        })
          .select("name email")
          .lean(),
        Holiday.find({
          workspace: workspaceId,
          date: { $gte: start, $lte: end },
        }).lean(),
      ]);

    if (existingLeave) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Leave already applied for the same date" });
    }

    const possibleLeaveBalance = handleLeave({
      leaveBalance: usersLeaveBalance.leaveBalance,
      appliedLeaveType: type,
      noOfDays: numberOfDays,
      holidays,
      startDate: start,
      endDate: end,
    });

    if (!possibleLeaveBalance.canApply) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: possibleLeaveBalance.message });
    }

    const newLeave = new Leave({
      title,
      type,
      startDate: start,
      endDate: end,
      numberOfDays,
      dailyDetails,
      pendingData:
        possibleLeaveBalance.type === "mixed"
          ? {
              [possibleLeaveBalance.leaveToReduce[0].type]:
                possibleLeaveBalance.leaveToReduce[0].value,
              [possibleLeaveBalance.leaveToReduce[1].type]:
                possibleLeaveBalance.leaveToReduce[1].value,
            }
          : {
              [possibleLeaveBalance.type]: possibleLeaveBalance.leaveToReduce,
            },
      user: userId,
      description,
      workspace: workspaceId,
      leaveBalance: usersLeaveBalance._id,
    });

    await newLeave.save();

    const leavePromises = [
      User.updateOne(
        {
          _id: userId,
          currentWorkspace: workspaceId,
        },
        {
          $push: {
            leaves: newLeave._id,
          },
        }
      ),
    ];

    if (possibleLeaveBalance.type === type) {
      const leaveTypeData = usersLeaveBalance.leaveBalance.find(
        (leave) => leave.type === type
      );

      leavePromises.push(
        LeaveBalance.updateOne(
          { _id: usersLeaveBalance._id, "leaveBalance.type": type },
          {
            $inc: {
              "leaveBalance.$.value": -numberOfDays,
              "leaveBalance.$.consumed": numberOfDays,
            },
          }
        ),
        LeaveHistory.create({
          action: "applied",
          startDate: start,
          endDate: end,
          leaveType: type,
          leaveChangesCount: numberOfDays,
          previousLeaveCount: leaveTypeData.value,
          newLeaveCount: leaveTypeData.value - numberOfDays,
          user: userId,
          workspace: workspaceId,
        })
      );
    }

    if (possibleLeaveBalance.type === "mixed") {
      const existingLeaveBalances = usersLeaveBalance.leaveBalance;
      leavePromises.push(
        ...possibleLeaveBalance.leaveToReduce.map((leaveType) => {
          return LeaveBalance.updateOne(
            {
              _id: usersLeaveBalance._id,
              "leaveBalance.type": leaveType.type,
            },
            {
              $inc: {
                "leaveBalance.$.value": -leaveType.value,
                "leaveBalance.$.consumed": leaveType.value,
              },
            }
          );
        })
      );
      possibleLeaveBalance.leaveToReduce.forEach((leaveType) => {
        const leaveTypeData = existingLeaveBalances.find(
          (leave) => leave.type === leaveType.type
        );

        leavePromises.push(
          LeaveHistory.create({
            action: "applied",
            startDate: start,
            endDate: end,
            leaveType: leaveType.type,
            leaveChangesCount: leaveType.value,
            previousLeaveCount: leaveTypeData.value,
            newLeaveCount: leaveTypeData.value - leaveType.value,
            user: userId,
            workspace: workspaceId,
          })
        );
      });
    }

    await Promise.all(leavePromises);
    await session.commitTransaction();
    session.endSession();

    // here im Sending emails in background without waiting for response
    adminUsers.forEach((admin) => {
      const html = leaveNotificationEmailTemplate({
        adminName: admin.name,
        userName: user.name,
        leaveType: type,
        startDate,
        endDate,
        title,
        domain: config.frontend_domain,
      });
      sendEmail(admin.email, "Request Leave", html).catch((err) => {
        console.error("Failed to send email to admin:", err);
      });
    });

    res.status(200).json({ status: "Leave applied successfully", newLeave });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in createLeaveRequest:", error);
    return res.status(500).json(`Failed to apply leave: ${error.message}`);
  }
}

/*
 * Approve or Reject a leave request.
 */
async function updateStatusOfLeave(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, leaveId, rejectionReason = null, workspaceId } = req.body;

    const leaveDetails = await Leave.findOne({
      _id: leaveId,
      workspace: workspaceId,
      status: "pending",
    })
      .populate("user", "name email")
      .populate("leaveBalance", "leaveBalance")
      .session(session);

    if (!leaveDetails) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json("Leave Data not found");
    }

    const leaveBalance = leaveDetails.leaveBalance;

    if (status === leaveDetails.status) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({
        message: "No changes were made to the leave request. Please try again.",
      });
    }

    const { pendingData } = leaveDetails;

    if (status === "rejected") {
      await Leave.updateOne(
        { _id: leaveId },
        {
          $set: {
            status: status,
            rejectionReason: rejectionReason,
            pendingData: {},
          },
        },
        { session }
      );

      await Promise.all(
        Object.keys(pendingData).map((leaveType) => {
          return LeaveBalance.updateOne(
            {
              _id: leaveDetails.leaveBalance._id,
              "leaveBalance.type": leaveType,
            },
            {
              $inc: {
                "leaveBalance.$.value": pendingData[leaveType],
                "leaveBalance.$.consumed": -pendingData[leaveType],
              },
            },
            { session }
          );
        })
      );
    }

    if (status === "approved") {
      await Leave.updateOne(
        { _id: leaveId },
        { $set: { status: status, pendingData: {} } },
        { session }
      );
    }

    const isLeaveApprove = status === "approved";

    await Promise.all(
      Object.keys(pendingData).map((leaveType) => {
        const leaveTypeData = leaveBalance.leaveBalance.find(
          (leave) => leave.type === leaveType
        );

        return LeaveHistory.create(
          [
            {
              action: isLeaveApprove ? "approved" : "rejected",
              startDate: leaveDetails.startDate,
              endDate: leaveDetails.endDate,
              leaveType: leaveType,
              additionalInfo: isLeaveApprove ? "" : rejectionReason,
              leaveChangesCount: isLeaveApprove ? 0 : pendingData[leaveType],
              previousLeaveCount: leaveTypeData.value,
              newLeaveCount: isLeaveApprove
                ? leaveTypeData.value
                : leaveTypeData.value + pendingData[leaveType],
              user: leaveDetails.user._id,
              workspace: workspaceId,
            },
          ],
          { session }
        );
      })
    );

    await session.commitTransaction();
    session.endSession();

    const updatedLeave = await Leave.findOne({
      _id: leaveId,
      workspace: workspaceId,
      status: status,
    })
      .populate("user", "name email")
      .lean();

    // Sending email in background without waiting for response
    const emailTemplate = leaveApplicationConfirmationEMailTemplate(
      updatedLeave,
      rejectionReason,
      formatDate
    );

    sendEmail(
      leaveDetails.user.email,
      "Leave Application Confirmation",
      emailTemplate
    ).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    return res.status(200).json({ leaveDetails: updatedLeave });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in updateStatusOfLeave:", error);
    return res.status(500).json(`Failed to update status: ${error.message}`);
  }
}

const getRequestedLeaveByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const allLeaves = await Leave.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("leaveBalance")
      .lean();
    // Use sort({ createdAt: -1 }) to retrieve the data in descending order based on createdAt

    return res.status(200).json({ success: true, userLeaveData: allLeaves });
  } catch (error) {
    console.error(`Failed to send leave's data: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateLeaveRequest = async (req, res) => {
  try {
    const {
      leaveId,
      title,
      type,
      startDate,
      endDate,
      dailyDetails,
      numberOfDays,
      userId,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json("User not found");
    }
    const workspaceId = user.currentWorkspace;

    const [existingLeave, usersLeaveBalance, holidays] = await Promise.all([
      Leave.findById(leaveId),
      LeaveBalance.findOne({
        user: userId,
        workspace: workspaceId,
      }).lean(),
      Holiday.find({
        workspace: workspaceId,
        date: { $gte: startDate, $lte: endDate },
      }).lean(),
    ]);

    if (!existingLeave) {
      return res.status(404).json("Leave not found");
    }

    // Check if the user is the owner of the leave request
    if (existingLeave.user.toString() !== user._id.toString()) {
      return res
        .status(401)
        .json("Unauthorized: You are not the owner of this leave request");
    }

    // Update leave details
    existingLeave.title = title;
    existingLeave.type = type;
    existingLeave.startDate = startDate;
    existingLeave.endDate = endDate;
    existingLeave.dailyDetails = dailyDetails;
    existingLeave.numberOfDays = numberOfDays;

    const possibleLeaveBalance = handleLeave({
      leaveBalance: usersLeaveBalance.leaveBalance,
      appliedLeaveType: type,
      noOfDays: numberOfDays,
      holidays,
      startDate: start,
      endDate: end,
    });

    if (!possibleLeaveBalance.canApply) {
      return res.status(400).json(possibleLeaveBalance.message);
    }

    const { pendingData } = existingLeave;

    await Promise.all(
      Object.keys(pendingData).map((leaveType) => {
        return LeaveBalance.updateOne(
          {
            _id: existingLeave.leaveBalance._id,
            workspace: user.currentWorkspace,
            "leaveBalance.type": leaveType,
          },
          {
            $inc: {
              "leaveBalance.$.value": pendingData[leaveType],
              "leaveBalance.$.consumed": -pendingData[leaveType],
            },
          }
        );
      })
    );

    if (possibleLeaveBalance.type === type) {
      leavePromises.push(
        LeaveBalance.updateOne(
          { _id: usersLeaveBalance._id, "leaveBalance.type": type },
          {
            $inc: {
              "leaveBalance.$.value": -numberOfDays,
              "leaveBalance.$.consumed": numberOfDays,
            },
          }
        )
      );
    }

    if (possibleLeaveBalance.type === "mixed") {
      leavePromises.push(
        ...possibleLeaveBalance.leaveToReduce.map((leaveType) => {
          return LeaveBalance.updateOne(
            { _id: usersLeaveBalance._id, "leaveBalance.type": leaveType.type },
            {
              $inc: {
                "leaveBalance.$.value": -leaveType.value,
                "leaveBalance.$.consumed": leaveType.value,
              },
            }
          );
        })
      );
    }

    await existingLeave.save();

    return res.status(200).json({
      status: "Leave updated successfully",
      updatedLeave: existingLeave,
    });
  } catch (error) {
    return res.status(500).json(`Failed to update leave: ${error.message}`);
  }
};

/*
 * Delete a leave request
 */
async function deleteLeaveRequest(req, res) {
  try {
    const { leaveId } = req.body;
    const { _id: userId, currentWorkspace: workspaceId } = req.user;

    // Check if the leave request exists
    const existingLeave = await Leave.findOne({
      _id: leaveId,
      user: userId,
      workspace: workspaceId,
    })
      .populate("leaveBalance")
      .lean();

    if (!existingLeave) {
      return res.status(404).json("Leave not found");
    }

    if (!(existingLeave.status === "pending")) {
      return res
        .status(401)
        .json("Unauthorized: You cannot delete approved leave request");
    }

    // Check if the user is the owner of the leave request
    if (existingLeave.user.toString() !== userId.toString()) {
      return res
        .status(401)
        .json("Unauthorized: You are not the owner of this leave request");
    }

    const { pendingData, leaveBalance } = existingLeave;

    const leavePromises = [];

    await Promise.all(
      Object.keys(pendingData).map((leaveType) => {
        const leaveTypeData = leaveBalance.leaveBalance.find(
          (leave) => leave.type === leaveType
        );
        leavePromises.push(
          LeaveHistory.create({
            action: "deleted",
            startDate: existingLeave.startDate,
            endDate: existingLeave.endDate,
            leaveType: leaveType,
            leaveChangesCount: pendingData[leaveType],
            previousLeaveCount: leaveTypeData.value,
            newLeaveCount: leaveTypeData.value + pendingData[leaveType],
            user: userId,
            workspace: workspaceId,
          })
        );

        return LeaveBalance.updateOne(
          {
            _id: existingLeave.leaveBalance._id,
            "leaveBalance.type": leaveType,
          },
          {
            $inc: {
              "leaveBalance.$.value": pendingData[leaveType],
              "leaveBalance.$.consumed": -pendingData[leaveType],
            },
          }
        );
      })
    );

    leavePromises.push(
      User.updateOne(
        {
          _id: userId,
          status: USER_STATUS.ACTIVE,
          currentWorkspace: workspaceId,
        },
        { $pull: { leaves: leaveId } }
      ),
      Leave.deleteOne({
        _id: leaveId,
        workspace: workspaceId,
        user: userId,
      })
    );

    await Promise.all(leavePromises);
    return res.status(200).json({ status: "Leave deleted successfully" });
  } catch (error) {
    return res.status(500).json(`Failed to delete leave: ${error.message}`);
  }
}

const getUserLeaveBalance = async (req, res) => {
  const { userId, workspaceId } = req.params;

  if (!userId || !workspaceId) {
    return res.status(400).json({
      error: "Bad Request",
      message: "User ID or workspace ID not provided",
    });
  }

  try {
    const leaveBalance = await LeaveBalance.findOne({
      user: userId,
      workspace: workspaceId,
    });

    if (!leaveBalance) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Leave balance not found" });
    }

    return res.status(200).json({ leaveBalance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing the request",
    });
  }
};

// Accessible only for admin

const getAllLeaves = async (req, res) => {
  const { currentWorkspace: workspaceId } = req.user;
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      _id: userId,
      [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE,
      currentWorkspace: workspaceId,
    });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const { monthsBack } = req.query;

    const monthsToGoBack = parseInt(monthsBack) || 2;

    const currentDate = new Date();
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - monthsToGoBack);

    const leaves = await Leave.find({
      createdAt: { $gte: targetDate, $lt: currentDate },
      workspace: req.user.currentWorkspace,
    })
      .sort({ createdAt: -1 })
      .populate("user")
      .lean();

    return res.status(200).json({ leaves });
  } catch (error) {
    return res
      .status(500)
      .json(`Failed to get leave requests: ${error.message}`);
  }
};

function formatDate(dateString) {
  return new Date(dateString)
    .toISOString()
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");
}

module.exports = {
  createLeaveRequest,
  getRequestedLeaveByUser,
  updateLeaveRequest,
  deleteLeaveRequest,
  getAllLeaves,
  updateStatusOfLeave,
  getUserLeaveBalance,
};
