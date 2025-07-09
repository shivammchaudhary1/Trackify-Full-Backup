const mongoose = require("mongoose");
const { loadUserProfile } = require("./auth.controller.js");
const { USER_STATUS, USER_ROLE } = require("../config/utility/user.utility.js");
const { timeZoneAlias } = require("../config/utility/utility.js");

const Clients = mongoose.model("Client");
const Holiday = mongoose.model("Holiday");
const LeaveBalance = mongoose.model("LeaveBalance");
const MonthlyReport = mongoose.model("MonthlyReport");
const Project = mongoose.model("Project");
const Rule = mongoose.model("Rule");
const Timer = mongoose.model("Timer");
const User = mongoose.model("User");
const Entry = mongoose.model("Entry");
const Workspace = mongoose.model("Workspace");
const Leave = mongoose.model("Leave");

/*
 * Create new workspace
 */
async function createWorkspace(req, res) {
  const { name, userId, themeId, timeZone } = req.body;

  try {
    const user = await User.findOne({
      _id: userId,
    }).lean();

    if (!user) {
      return res.status(404).json("User not found!");
    }

    // Set default time zone if not provided
    const workspaceTimeZone =
      timeZoneAlias[timeZone] || timeZone || "Asia/Kolkata";

    const workspace = new Workspace({
      name: `${name}'s workspace`,
      timeZone: workspaceTimeZone,
    });

    const newRule = new Rule();
    newRule.workspace = workspace._id;

    workspace.rules.push(newRule);
    workspace.users.push({ user: userId, isAdmin: true });

    const leaveTypes = workspace.leaveTypes;
    const leaveBalance = leaveTypes.map((type) => ({
      type: type.leaveType,
      value: 0,
      title: type.title,
    }));

    const leave = new LeaveBalance({
      user: user._id,
      workspace: workspace._id,
      leaveBalance: leaveBalance,
    });

    await Promise.all([
      User.updateOne(
        { _id: userId },
        {
          $set: {
            [`workspaceThemes.${workspace._id}`]: themeId,
            [`roles.${workspace._id}`]: [USER_ROLE.ADMIN, USER_ROLE.USER],
            [`statuses.${workspace._id}`]: USER_STATUS.ACTIVE,
          },
          $push: {
            workspaces: workspace._id,
            leaveBalance: leave._id,
          },
        }
      ),
      workspace.save(),
      leave.save(),
      newRule.save(),
    ]);

    const newWorkspace = await Workspace.findById(workspace._id).select(
      "name status isEditable settings timeZone"
    );

    return res.json(newWorkspace);
  } catch (error) {
    return res
      .status(500)
      .json(`Failed to create a new workspace: ${error.message}.`);
  }
}

/*
 * Update workspace
 */
async function updateWorkspace(req, res) {
  const { workspaceId } = req.params;
  const { name, settings, timeZone } = req.body;

  if (!name && !settings && !timeZone) {
    return res
      .status(400)
      .json("Invalid request, name, time zone, or settings is required.");
  }

  const updatesData = {};

  if (name) {
    updatesData.name = name;
  }
  if (settings) {
    updatesData.settings = settings;
  }

  if (timeZone) {
    updatesData.timeZone = timeZone;
  }

  try {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $set: updatesData },
      {
        new: true,
      }
    )
      .select("name status isEditable settings timeZone")
      .lean();

    if (!workspace) {
      return res.status(404).json("Workspace not found.");
    }

    return res.status(200).json({ updatedWorkspace: workspace });
  } catch (error) {
    return res.status(500).json(`Failed to update Workspace: ${error.message}`);
  }
}

/*
 * Switch workspace
 */
async function switchWorkspace(req, res) {
  const userId = req.user._id;
  const { workspaceId: newWorkspaceId } = req.params;
  const { changeDate } = req.body;

  try {
    const [timer, workspace] = await Promise.all([
      Timer.findOne({
        user: userId,
        isRunning: true,
      }).lean(),
      Workspace.findOne({
        _id: newWorkspaceId,
      })
        .select("name status isEditable settings timeZone")
        .lean(),
    ]);

    if (timer) {
      return res
        .status(400)
        .send({ message: "Please stop the timer to switch the workspace" });
    }

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        // Allow switching to workspace only if user is active on that workspace
        [`statuses.${workspace._id.toString()}`]: USER_STATUS.ACTIVE,
      },
      {
        $set: {
          currentWorkspace: workspace._id,
        },
      },
      { new: true }
    ).lean();

    if (!user) {
      return res.status(400).json({ message: "Your account is not active on this workspace. Please Contact admin" });
    }

    const { projects, entries, lastEntryDate } = await loadUserProfile(
      user,
      changeDate
    );

    return res.status(200).json({
      workspace,
      projects,
      entries,
      lastEntryDate,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal server error`, error: error.message });
  }
}

/*
 * Toggle Workspace timer edit option
 */
async function editTimer(req, res) {
  try {
    const { isEditable } = req.body;
    const updatedWorkspace = await Workspace.findOneAndUpdate(
      {
        _id: req.user.currentWorkspace,
        users: { $elemMatch: { user: req.user._id, isAdmin: true } },
      },
      { isEditable },
      { new: true }
    )
      .select("name status isEditable")
      .lean();

    return res.status(200).send({ updatedWorkspace });
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/*
 * Delete workspace
 */
async function deleteWorkspaceById(req, res) {
  const { workspaceId } = req.params;
  const userId = req.user._id;

  try {
    const [currentUser, workspace, workspaceUsers] = await Promise.all([
      User.findOne({
        _id: userId,
      }).lean(),
      Workspace.findOne({ _id: workspaceId }).lean(),
      User.find({ workspaces: { $in: workspaceId } }).lean(),
    ]);

    if (!currentUser|| !currentUser.roles[workspaceId].includes(
      USER_ROLE.ADMIN
  )) {
      return res
        .status(400)
        .json("Only admin can delete the workspace.");
    }

    if (!workspace) {
      return res.status(404).json("Workspace not found.");
    }

    if (currentUser.currentWorkspace.toString() === workspaceId) {
      return res
        .status(400)
        .json(
          "Current workspace cannot be deleted, Please switch workspace first."
        );
    }

    if (currentUser.currentWorkspace.length === 1) {
      return res.status(400).json("Please switch workspace first.");
    }

    const usersIdsToDelete = workspaceUsers
      .filter(
        (user) =>
          !user.workspaces.length === 1 && user.workspaces[0] === workspaceId
      )
      .map((user) => user._id);

    await Promise.all([
      Clients.deleteMany({ workspace: workspaceId }),
      Entry.deleteMany({ workspace: workspaceId }),
      Holiday.deleteMany({ workspace: workspaceId }),
      LeaveBalance.deleteMany({ workspace: workspaceId }),
      Leave.deleteMany({ workspace: workspaceId }),
      MonthlyReport.deleteMany({ workspace: workspaceId }),
      Project.deleteMany({ workspace: workspaceId }),
      Rule.deleteOne({ workspace: workspaceId }),
      User.deleteMany({ _id: { $in: usersIdsToDelete } }),
      Timer.deleteMany({ user: { $in: usersIdsToDelete } }),
      User.updateMany(
        { workspaces: { $in: workspaceId }, _id: { $nin: usersIdsToDelete } },
        { $pull: { workspaces: workspaceId } }
      ),
      Workspace.deleteOne({ _id: workspaceId }),
    ]);

    return res
      .status(200)
      .json({ message: "Workspace deleted successfully.", workspaceDeleted:{_id:workspaceId} });
  } catch (error) {
    return res.status(500).json(`Failed to delete Workspace: ${error.message}`);
  }
}

module.exports = {
  createWorkspace,
  switchWorkspace,
  deleteWorkspaceById,
  updateWorkspace,
  editTimer,
};
