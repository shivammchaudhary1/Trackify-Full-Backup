const mongoose = require("mongoose");
const { config } = require("../config/env/default.js");
const {
  convertDateToTimestamps,
  calculateDuration,
} = require("../config/lib/timeCalculator.js");
const {
  generateRandomPassword,
} = require("../config/utility/generateRandomPassword.js");
const { encryptPassword } = require("../config/lib/bcryptjs.js");
const { signJwt, jwtVerify } = require("../config/lib/jwt.js");
const {
  checkPasswordIdValid,
  checkEmailIsValid,
} = require("../config/utility/validation.js");
const { sendEmail } = require("../config/lib/nodemailer.js");
const {
  createSession,
  timeZoneAlias,
} = require("../config/utility/utility.js");
const {
  generateInviteHtmlTemplate,
  invitationConfirmationHTMLTemplate,
} = require("../config/utility/htmlTemplate.js");
const { USER_ROLE, USER_STATUS } = require("../config/utility/user.utility.js");

const User = mongoose.model("User");
const Entry = mongoose.model("Entry");
const Workspace = mongoose.model("Workspace");
const Timer = mongoose.model("Timer");
const Project = mongoose.model("Project");
const LeaveBalance = mongoose.model("LeaveBalance");
const Leave = mongoose.model("Leave");
const MonthlyReport = mongoose.model("MonthlyReport");
const Rule = mongoose.model("Rule");

async function signup(req, res) {
  const { name, email, password, themeId, timeZone } = req.body;

  try {
    if (!checkEmailIsValid(email)) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    if (!checkPasswordIdValid(password)) {
      return res.status(400).json({
        message:
          "Password must include at least one number, both lower and uppercase letters, and at least one special character, such as '@,#,$,%,-'. Password length should be between 6 and 12 characters.",
      });
    }

    const isUserAlreadyExist = await User.findOne({ email }).lean();
    if (isUserAlreadyExist) {
      return res.status(409).json({
        status: "failed",
        message: "Email already present, Try Sign in.",
      });
    }

    const encryptedPassword = await encryptPassword(password);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = new User({
        name,
        email: email.toLowerCase(),
        password: encryptedPassword,
      });

      // Set default time zone if not provided
      const workspaceTimeZone =
        timeZoneAlias[timeZone] || timeZone || "Asia/Kolkata";

      const workspace = new Workspace({
        name: `${user.name}'s workspace`,
        timeZone: workspaceTimeZone,
      });

      const newTimer = new Timer({ user: user._id });

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

      const newRule = new Rule({ workspace: workspace._id });

      const userWorkspace = {
        user: user._id,
        isAdmin: true,
      };

      workspace.users.push(userWorkspace);
      workspace.rules.push(newRule._id);

      user.workspaces.push(workspace._id);
      user.currentWorkspace = workspace._id;
      user.timer = newTimer._id;
      user.leaveBalance.push(leave._id);
      user.workspaceThemes.set(workspace._id, themeId);
      user.roles.set(workspace._id, [USER_ROLE.ADMIN, USER_ROLE.USER]);
      user.statuses.set(workspace._id, USER_STATUS.ACTIVE);

      await Promise.all([
        newTimer.save(),
        user.save(),
        workspace.save(),
        leave.save(),
        newRule.save(),
      ]);

      await session.commitTransaction();
      session.endSession();

      const cookieData = createSession(user._id, req.headers["user-agent"]);
      res.cookie("sessionId", cookieData.sessionId, {
        httpOnly: config.isProduction,
        secure: config.isProduction,
        sameSite: config.isProduction ? "none" : "lax",
        maxAge: cookieData.maxAge,
      });

      return res.json({
        isAuthenticated: true,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      message: `User Registration Failed, please try again later.`,
    });
  }
}

const getUser = async (req, res) => {
  const { currentWorkspace: workSpaceId } = req.user;

  try {
    const { userId } = req.params;
    const user = await User.findOne({
      _id: userId,
      [`statuses.${workSpaceId}`]: USER_STATUS.ACTIVE,
    })
      .select(
        "name email dateOfBirth statuses currentWorkspace workspaceThemes timer roles address permanentAddress assets"
      )
      .populate("assets.primaryAsset")
      .populate("assets.secondaryAssets")
      .lean();
    if (!user) {
      return res.status(404).send("user not found");
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json(`Error getting users associated with workspace: ${error.message}`);
  }
};

/**
 * @function changeRole
 * @description API to change the role of a user in a workspace
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @property {boolean} role - Should the user become an admin or not
 * @property {string} userId - The MongoDB _id of the user
 * @returns {Promise<Object>} - JSON response with the updated user's role, workspaceId, and userId
 */
async function changeRole(req, res) {
  const { role: isAdmin, userId } = req.body;

  const newRoles = isAdmin
    ? [USER_ROLE.ADMIN, USER_ROLE.USER]
    : [USER_ROLE.USER];

  try {
    // Ensure the user is not trying to change their own role
    // TODO:: Ask Samay
    if (req.user._id.toString() === userId) {
      return res.status(400).json("Please select another user.");
    }

    const user = await User.findOne({
      _id: userId,
      workspaces: { $in: [req.user.currentWorkspace] },
    }).lean();

    if (!user) {
      return res.status(404).json("User not found.");
    }

    const adminCount = await User.countDocuments({
      workspaces: { $in: [user.currentWorkspace] },
      [`roles.${req.user.currentWorkspace}`]: { $in: [USER_ROLE.ADMIN] },
    });

    if (adminCount <= 1 && !newRoles.includes(USER_ROLE.ADMIN)) {
      return res
        .status(400)
        .json("At least one admin is required in the workspace.");
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        workspaces: { $in: [req.user.currentWorkspace] },
      },
      { $set: { [`roles.${req.user.currentWorkspace}`]: newRoles } },
      { new: true }
    ).select("roles");

    return res
      .status(200)
      .json({ userId: updatedUser._id, roles: updatedUser.roles });
  } catch (error) {
    return res.status(500).json(`Failed to switch admin: ${error.message} `);
  }
}

async function changeUserStatus(req, res) {
  const { currentWorkspace: workSpaceId } = req.user;
  const { userId, status } = req.body;

  if (userId.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json("Please select another user to change the status.");
  }

  try {
    const user = await User.findOne({
      _id: userId,
      [`statuses.${workSpaceId}`]: { $ne: status },
    }).lean();

    if (!user) {
      return res.status(400).json("Status already changed.");
    }

    const updateData = {
      [`statuses.${workSpaceId}`]: status,
    };

    if (status === USER_STATUS.INACTIVE && user.workspaces.length > 1) {
      const changedCurrentWorkspaceId = user.workspaces.find(
        (ifOfWorkspace) => ifOfWorkspace.toString() !== workSpaceId.toString()
      );

      updateData.currentWorkspace = changedCurrentWorkspaceId;
    }

    if (
      status === USER_STATUS.INACTIVE &&
      user.currentWorkspace.toString() !== workSpaceId.toString() &&
      user.workspaces.length > 1 &&
      user.statuses[user.currentWorkspace] === USER_STATUS.INACTIVE
    ) {
      updateData.currentWorkspace = workSpaceId;
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      { $set: updateData },
      { new: true }
    )
      .select("statuses")
      .lean();

    return res.status(200).json({ userId, statuses: updatedUser.statuses });
  } catch (error) {
    return res.status(500).json(`Failed to switch admin: ${error.message} `);
  }
}

// Send workspace invitation email to the user
const invite = async (req, res) => {
  try {
    const { email, themeId } = req.body;

    if (!email) {
      return res.status(400).json("Email is required.");
    }

    const workspaceId = req.user.currentWorkspace;

    const [userInCurrentWorkspace, user] = await Promise.all([
      User.findOne({ workspaces: { $in: workspaceId }, email }),
      User.findOne({ email }),
    ]);

    if (userInCurrentWorkspace) {
      return res.status(409).json("User already added to workspace.");
    }

    const token = signJwt({ email, workspaceId, themeId }, "24h", "access");
    const link = `${config.frontend_domain}/invite-new?token=${token}`;
    const html = generateInviteHtmlTemplate(config.frontend_domain, link);

    await sendEmail(email, "Workspace Invitation", html);

    return res.json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(`Failed to invite user, ${error.message}`);
  }
};

// Handle workspace invitation accept request for a new user
const acceptWorkspaceInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, workspaceId, themeId, error } = jwtVerify(token, "access");

    if (error) {
      return res
        .status(400)
        .json({ message: "Invalid token", code: "JwtExpired" });
    }

    const [existingUser, workspace] = await Promise.all([
      User.findOne({ email }).lean(),
      Workspace.findOne({ _id: workspaceId }),
    ]);

    if (
      existingUser?.workspaces.find(
        (existingWorkspaceId) => existingWorkspaceId.toString() === workspaceId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid request, invitation already accepted, Please sign in.",
      });
    }

    let user;
    let timer;
    let password = generateRandomPassword(7);

    if (!existingUser) {
      const encryptedPassword = await encryptPassword(password);

      user = new User({
        name: email.split("@")[0],
        email: email.toLowerCase(),
        password: encryptedPassword,
      });

      timer = new Timer({
        user: user._id,
      });

      user.currentWorkspace = workspaceId;
      user.timer = timer._id;
    }

    const defaultLeaveBalance = workspace.leaveTypes.map((type) => ({
      type: type.leaveType,
      value: 0,
      title: type.title,
    }));

    // Check if leave balance for this user + workspace already exists
    const leave = await LeaveBalance.findOne({
      user: existingUser ? existingUser._id : user._id,
      workspace: workspaceId,
    });

    // If not found — create and save new one
    let leaveBalanceDoc;
    if (!leave) {
      leaveBalanceDoc = new LeaveBalance({
        user: existingUser ? existingUser._id : user._id,
        workspace: workspaceId,
        leaveBalance: defaultLeaveBalance,
      });
      await leaveBalanceDoc.save();
    } else {
      leaveBalanceDoc = leave;
    }

    if (existingUser) {
      let currentWorkspaceId = existingUser.currentWorkspace;
      // If the existing user has inactive in a workspace, update the current workspace
      if (
        existingUser.statuses[existingUser.currentWorkspace] ===
        USER_STATUS.INACTIVE
      ) {
        currentWorkspaceId = workspaceId;
      }

      await User.updateOne(
        {
          _id: existingUser._id,
          email,
        },
        {
          $set: {
            [`workspaceThemes.${workspaceId}`]: themeId,
            [`roles.${workspaceId}`]: [USER_ROLE.USER],
            [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE,
            currentWorkspace: currentWorkspaceId,
          },
          $addToSet: {
            workspaces: workspaceId,
            leaveBalance: leaveBalanceDoc._id,
          },
        }
      );
    } else {
      user.workspaces.push(workspaceId);
      user.leaveBalance.push(leaveBalanceDoc._id);
      user.workspaceThemes.set(workspaceId, themeId);
      user.roles.set(workspaceId, [USER_ROLE.USER]);
      user.statuses.set(workspaceId, USER_STATUS.ACTIVE);
      await Promise.all([user.save(), timer.save()]);
    }

    const link = `${config.frontend_domain}/signin`;
    const html = invitationConfirmationHTMLTemplate(
      config.frontend_domain,
      link,
      email,
      password,
      existingUser ? false : true
    );

    await sendEmail(email, "Workspace Invitation", html);
    res.status(201).json("Registration successful");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `Failed to add new user to invited workspace, ${error.message}`,
    });
  }
};

const entries = async (req, res) => {
  try {
    const { date } = req.query;
    const { startTimestamp, endTimestamp } = convertDateToTimestamps(date);
    const userId = req.user._id;
    const workspace = req.user.currentWorkspace;
    const entries = await Entry.find({
      user: userId,
      workspace,
      endTime: { $ne: [] },
      startTimer: {
        $gte: new Date(startTimestamp), // Start of the day
        $lt: new Date(endTimestamp), // End of the day
      },
    }).populate("project");
    res.status(200).json({ entries });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const { entryId } = req.query;
    if (!entryId) {
      return res.status(400).send({ message: "Entry Id is required" });
    }

    const deletedEntry = await Entry.findByIdAndDelete(entryId);
    return res.status(200).json({ entryId: deletedEntry._id });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

/**
 * @function deleteUserFromWorkspace
 * @description API to delete a user from a workspace
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @property {string} workspaceId - The MongoDB _id of the workspace
 * @property {string} userId - The MongoDB _id of the user
 * @returns {Promise<Object>} - JSON response with a message indicating if the user was successfully removed from the workspace
 */
const deleteUserFromWorkspace = async (req, res) => {
  const workspaceId = req.user.currentWorkspace;
  const userId = req.body.userId;

  if (userId.toString() === req.user.toString()) {
    return res.status(400).json({ message: "You cannot remove yourself" });
  }

  try {
    const user = await User.findOne({
      _id: userId,
      workspaces: { $in: [workspaceId] },
    }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found in workspace" });
    }

    // Delete the user and timer if workspace is the last workspace, otherwise
    // only remove the user references from the workspace.
    const shouldDeleteUserAndTimer = user.workspaces.length === 1;

    // Remove the user from the workspace's users array
    await Promise.all([
      Workspace.updateOne(
        { _id: workspaceId },
        {
          $pull: { users: { user: userId } },
        }
      ),
      Project.updateMany(
        { workspace: workspaceId },
        {
          $pull: { team: userId },
        }
      ),
      Entry.deleteMany({ user: userId, workspace: workspaceId }),
      LeaveBalance.deleteOne({ user: user._id, workspace: workspaceId }),
      Leave.deleteMany({ user: userId, workspace: workspaceId }),
      MonthlyReport.updateMany(
        { workspace: workspaceId },
        {
          $pull: { report: { userId: userId } },
        }
      ),
      ...(shouldDeleteUserAndTimer
        ? [User.deleteOne({ _id: userId }), Timer.deleteOne({ user: userId })]
        : [
            User.updateOne(
              { _id: userId },
              {
                $pull: {
                  workspaces: workspaceId,
                },
                $set: {
                  currentWorkspace: user.workspaces.find(
                    (w) => w !== workspaceId
                  ),
                },
                $unset: {
                  [`roles.${workspaceId}`]: "",
                  [`workspaceThemes.${workspaceId}`]: "",
                  [`statuses.${workspaceId}`]: "",
                },
              }
            ),
          ]),
    ]);

    res.status(200).json({ message: "User removed from workspace" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

async function editEntry(req, res) {
  const { entryId } = req.params;
  const { title, projectId, startTime, endTime } = req.body.entry;

  try {
    if (!title || !projectId || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [{ isEditable }, overlappingEntry] = await Promise.all([
      Workspace.findOne({
        _id: req.user.currentWorkspace,
      }).select("isEditable"),
      Entry.findOne({
        // Exclude the entry being updated
        _id: { $ne: entryId },
        // Same user
        user: req.user._id,
        $and: [
          // Overlapping time range
          {
            startTime: { $lte: new Date(endTime) },
            endTime: { $gte: new Date(startTime) },
          },
        ],
      }).lean(),
    ]);

    if (!isEditable) {
      return res.status(400).json({
        message: "Timer edit is disabled, please contact admin.",
      });
    }

    if (overlappingEntry) {
      return res.status(400).json({
        message:
          "Overlapping entry found with " +
          "Title: " +
          overlappingEntry.title +
          ", Date: " +
          new Date(overlappingEntry.startTime).toDateString(),
      });
    }

    const newStartTime = new Date(startTime).toISOString();
    const newEndTime = new Date(endTime).toISOString();

    const updateData = {
      title: title,
      project: projectId,
      startTime: newStartTime,
      endTime: newEndTime,
      durationInSeconds: calculateDuration(startTime, endTime),
    };

    const updatedEntry = await Entry.findOneAndUpdate(
      {
        _id: entryId,
      },
      { $set: updateData },
      { new: true }
    )
      .populate({ path: "project", select: "name description" })
      .lean();

    return res
      .status(200)
      .send({ message: "Entry Time updated successfully", updatedEntry });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const editEntryTitle = async (req, res) => {
  try {
    const { entry } = req.body;
    const updatedEntry = await Entry.findOneAndUpdate(
      {
        _id: entry._id,
      },
      { title: entry.title },
      { new: true }
    )
      .populate("project")
      .lean();

    res
      .status(200)
      .send({ message: "Title updated successfully", updatedEntry });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @function getAllUsersFromSelectedWorkspace
 * @description API to get all users from the user's current selected workspace
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} - JSON response with the list of users
 */
const getAllUsersFromSelectedWorkspace = async (req, res) => {
  try {
    const users = await User.find({
      // status: USER_STATUS.ACTIVE,
      workspaces: { $in: req.user.currentWorkspace },
    })
      .select(
        `
  name email dateOfBirth profilePic mobileNumber address permanentAddress
  panDetails aadharDetails resume roles statuses currentWorkspace
  workspaceThemes timer projects clients leaveBalance leaves assets
`
      )
      .populate("assets.primaryAsset") // Populate primary asset
      .populate("assets.secondaryAssets") // Populate secondary assets
      .lean();

    return res.status(200).json({ users });
  } catch (error) {
    throw new Error(error);
  }
};

async function addAsset(req, res) {
  const { name, serialNumber, isPrimary, userId } = req.body;
  const workspaceId = req.user.currentWorkspace;
  try {
    const user = await User.findOne({
      _id: userId,
      workspaces: { $in: [workspaceId] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasValidPrimaryAsset =
      user.assets?.primaryAsset?.name &&
      user.assets?.primaryAsset?.serialNumber;

    if (isPrimary && hasValidPrimaryAsset) {
      return res
        .status(400)
        .json({ message: "User already has a primary asset" });
    }

    // Create update object
    const update = {};

    if (isPrimary) {
      update.$set = {
        "assets.primaryAsset": {
          name,
          serialNumber,
          assignedDate: new Date(),
        },
      };
    } else {
      update.$push = {
        "assets.secondaryAssets": {
          name,
          serialNumber,
          assignedDate: new Date(),
        },
      };
    }

    // Update user document without modifying roles
    await User.updateOne({ _id: userId }, update);

    // Return consistent asset structure
    return res.status(201).json({
      name,
      serialNumber,
      isPrimary,
      userId: user._id,
      userName: user.name,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function getAssets(req, res) {
  const workspaceId = req.query.workspaceId;

  try {
    const users = await User.find({
      workspaces: { $in: [workspaceId] },
      $or: [
        { "assets.primaryAsset": { $exists: true } },
        { "assets.secondaryAssets": { $exists: true, $ne: [] } },
      ],
    }).select("name assets");

    const assets = users.flatMap((user) => {
      const userAssets = [];

      if (user.assets?.primaryAsset) {
        userAssets.push({
          _id: "primary", // Special ID for primary asset
          name: user.assets.primaryAsset.name,
          serialNumber: user.assets.primaryAsset.serialNumber,
          isPrimary: true,
          userId: user._id,
          userName: user.name,
        });
      }

      if (user.assets?.secondaryAssets) {
        user.assets.secondaryAssets.forEach((asset) => {
          userAssets.push({
            _id: asset._id.toString(), // Ensure ID is included
            name: asset.name,
            serialNumber: asset.serialNumber,
            isPrimary: false,
            userId: user._id,
            userName: user.name,
          });
        });
      }

      return userAssets;
    });

    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateAsset(req, res) {
  const { userId, assetId, name, serialNumber, isPrimary } = req.body;
  const workspaceId = req.user.currentWorkspace;

  try {
    const user = await User.findOne({
      _id: userId,
      workspaces: { $in: [workspaceId] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let update;
    if (isPrimary) {
      update = {
        $set: {
          "assets.primaryAsset": {
            name,
            serialNumber,
            assignedDate: new Date(),
          },
        },
      };
    } else {
      update = {
        $set: {
          "assets.secondaryAssets.$[elem].name": name,
          "assets.secondaryAssets.$[elem].serialNumber": serialNumber,
        },
      };
    }

    const options = {
      arrayFilters: isPrimary ? [] : [{ "elem._id": assetId }],
      new: true,
    };

    await User.updateOne({ _id: userId }, update, options);

    return res.status(200).json({
      message: "Asset updated successfully",
      asset: { name, serialNumber, isPrimary },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function deleteAsset(req, res) {
  const { userId, assetId, isPrimary } = req.body;
  const workspaceId = req.user.currentWorkspace;

  if (!assetId) {
    return res.status(400).json({ message: "Asset ID is required" });
  }

  try {
    const user = await User.findOne({
      _id: userId,
      workspaces: { $in: [workspaceId] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let update;
    if (isPrimary) {
      update = {
        $unset: {
          "assets.primaryAsset": "",
        },
      };
    } else {
      update = {
        $pull: {
          "assets.secondaryAssets": {
            _id: new mongoose.Types.ObjectId(assetId),
          },
        },
      };
    }

    await User.updateOne({ _id: userId }, update);

    return res.status(200).json({
      message: "Asset deleted successfully",
      assetId,
      isPrimary,
      userId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  changeRole,
  changeUserStatus,
  deleteEntry,
  deleteUserFromWorkspace,
  editEntry,
  editEntryTitle,
  entries,
  getAllUsersFromSelectedWorkspace,
  getUser,
  invite,
  acceptWorkspaceInvitation,
  signup,
  addAsset,
  getAssets,
  updateAsset,
  deleteAsset,
};
