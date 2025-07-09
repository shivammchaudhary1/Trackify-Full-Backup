const mongoose = require("mongoose");
const { comparePassword } = require("../config/lib/bcryptjs.js");
const {
  checkPasswordIdValid,
  checkEmailIsValid,
} = require("../config/utility/validation.js");
const {
  decodeSession,
  createSession,
} = require("../config/utility/utility.js");
const { config } = require("../config/env/default.js");
const { USER_STATUS, USER_ROLE } = require("../config/utility/user.utility.js");
const passport = require("passport");
const logger = require("../config/lib/logger.js");

const User = mongoose.model("User");
const Workspace = mongoose.model("Workspace");
const Project = mongoose.model("Project");
const Entry = mongoose.model("Entry");

/**
 * Handles user login by verifying credentials and creating a session.
 * @param {Object} req - The request object containing user credentials.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with authentication status or error message.
 */

async function login(req, res, next) {
  const { credentials } = req.body;

  if (!credentials) {
    return res.status(400).json({ message: "Credentials are required" });
  }

  try {
    // Decode base64 encoded credentials
    const decodedCredentials = Buffer.from(credentials, "base64").toString();
    if (!decodedCredentials.includes(":")) {
      return res.status(400).json({ message: "Invalid credentials format" });
    }

    const [email, password] = decodedCredentials.split(":");

    // Attach decoded credentials to req.body for passport to use
    req.body.email = email;
    req.body.password = password;

    // Passport authentication with session management
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        // Session created here (connect.sid cookie sent)
        return res.json({
          message: "Logged in successfully",
          isAuthenticated: true,
        });
      });
    })(req, res, next);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to login, please try again later" });
  }
}

/**
 * Clears the user's session by removing the sessionId cookie
 */
async function logout(req, res) {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
}

/**
 * Verifies the user's session and returns the user's profile
 */
async function isAuthenticated(req, res) {
  const { loginDate } = req.body;
  try {
    const user = await User.findOne({ _id: req.user._id })
      .select(
        "name email dateOfBirth statuses currentWorkspace workspaceThemes timer roles profilePic mobileNumber address permanentAddress panDetails aadharDetails resume"
      )
      .populate({
        path: "timer",
        select: "isRunning currentLog",
        populate: { path: "currentLog" },
      })
      .populate({
        path: "workspaces",
        select: "name status isEditable settings timeZone",
      })
      .lean();
    const userProfile = await loadUserProfile(user, loginDate);

    if (req.isAuthenticated()) {
      return res.json({ isAuthenticated: true, user, ...userProfile });
    } else {
      return res.status(401).json({ isAuthenticated: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to load user profile" });
  }
}
/**
 * This function will load the user profile when the user logs in.
 * @param {Object} user The user object, which is retrieved from the session.
 * @param {Date} loginDate The date when the user logs in.
 * @returns {Object} An object which contains the user's projects, entries,
 * workspaces, and lastEntryDate.
 */
async function loadUserProfile(user, loginDate) {
  const todayISO = new Date(loginDate);

  const isAdminUser = user.roles[user.currentWorkspace].includes(
    USER_ROLE.ADMIN
  );

  try {
    const [
      // workspaces,
      projects,
      entries,
    ] = await Promise.all([
      // Workspace.find({
      //   users: { $elemMatch: { user: user._id } },
      // })
      //   .select("name status isEditable settings")
      //   .lean()
      //   .exec(),
      Project.find({
        ...(isAdminUser
          ? { workspace: user.currentWorkspace }
          : { team: { $in: [user._id] }, workspace: user.currentWorkspace }),
      })
        .select("name description estimatedHours isCompleted")
        .lean()
        .exec(),
      Entry.find({
        workspace: user.currentWorkspace,
        user: user._id,
        startTime: { $gte: todayISO },
      })
        .populate({
          path: "project",
          select: "name description",
        })
        .lean()
        .exec(),
    ]);

    return {
      projects,
      entries,
      // workspaces,
      lastEntryDate: todayISO,
    };
  } catch (error) {
    logger.error(error);
  }
}

module.exports = { login, logout, isAuthenticated, loadUserProfile };
