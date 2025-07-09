const mongoose = require("mongoose");
const { sendEmail } = require("../config/lib/nodemailer.js");
const { config } = require("../config/env/default.js");
const {
  checkPasswordIdValid,
  checkEmailIsValid,
} = require("../config/utility/validation.js");
const { signJwt, jwtVerify } = require("../config/lib/jwt.js");
const {
  encryptPassword,
  comparePassword,
} = require("../config/lib/bcryptjs.js");
const { USER_STATUS } = require("../config/utility/user.utility.js");
const {
  forgotPasswordEmailTemplate,
} = require("../config/utility/htmlTemplate.js");

const User = mongoose.model("User");
const sessionCollection = mongoose.connection.collection("sessions");

// user documment upload ----

const fs = require("fs");

// Unified update profile handler (handles all profile fields and files, and legacy minimal update)
async function updateProfile(req, res) {
  try {
    const { _id: userId, name: userName, dateOfBirth } = req.user;
    // Accept both minimal and extended update payloads
    const {
      name,
      dob,
      mobileNumber,
      address,
      panNumber,
      aadharNumber,
      permanentAddress,
      profilePic,
      panDocument,
      aadharDocument,
      resume
    } = req.body;

    console.log(permanentAddress)
    // If only minimal update (name, dob) and no files, handle legacy logic
    if (
      !mobileNumber &&
      !address &&
      !permanentAddress &&
      !panNumber &&
      !aadharNumber &&
      !profilePic && 
      !panDocument &&
      !aadharDocument &&
      !resume 
    ) {
      
      if (name === userName && dob === dateOfBirth) {
        return res.status(400).json("No changes were made.");
      }
      const updateData = {};
      if (name) updateData.name = name;
      if (dob && !isNaN(new Date(dob).getTime())) {
        updateData.dateOfBirth = dob;
      }

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          [`statuses.${req.user.currentWorkspace}`]: USER_STATUS.ACTIVE,
        },
        { $set: updateData },
        { new: true }
      ).select("-password");
      return res.status(201).json({ updatedUser });
    }


    const existingUser = await User.findOne({_id: userId}).lean()

    if(!existingUser){
      return res.status(404).json("User Not Found.");
    }

    // Extended update logic (all fields and files)
    const updateData = {};
    if (name) updateData.name = name;
    if (dob) updateData.dateOfBirth = new Date(dob);
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (address) updateData.address = address;
    if (permanentAddress) updateData.permanentAddress = permanentAddress;
    if (panNumber) {
      updateData.panDetails = existingUser.panDetails || {};
      updateData.panDetails.number = panNumber;
    }
    if (aadharNumber) {
      updateData.aadharDetails = existingUser.aadharDetails || {};
      updateData.aadharDetails.number = aadharNumber;
    }
    if (profilePic) {
      updateData.profilePic = profilePic;
    }
    if (panDocument) {
      updateData.panDetails = existingUser.panDetails || {};
      updateData.panDetails.documentUrl = panDocument.path;
    }
    if (aadharDocument) {
      updateData.aadharDetails = existingUser.aadharDetails || {};
      updateData.aadharDetails.documentUrl = aadharDocument.path;
    }

    if (resume) {
      updateData.resume = resume.path
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true }
    ).select(
      "name email dateOfBirth mobileNumber address permanentAddress panDetails aadharDetails resume profilePic"
    );
    return res.status(200).json({
      user: updatedUser,
      updatedFields: updateData,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: error.message });
  }
}

// Download resume
async function downloadResume(req, res) {
  try {
    const user = await User.findById(req.user._id).select("resume");

    if (!user.resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!fs.existsSync(user.resume.path)) {
      return res.status(404).json({ message: "Resume file not found" });
    }

    res.download(user.resume.path, user.resume.filename);
  } catch (error) {
    console.error("Resume download error:", error);
    return res
      .status(500)
      .json({ message: `Failed to download resume: ${error.message}` });
  }
}

/// ----------



async function changePassword(req, res) {
  try {
    const { id } = req.params;
    const { oldPassword, password } = req.body;

    if (oldPassword === password) {
      return res.status(400).json("Old and new password are same.");
    }

    const user = await User.findOne({
      _id: id,
      [`statuses.${req.user.currentWorkspace}`]: USER_STATUS.ACTIVE,
    }).select("password");

    if (!user) {
      return res.status(400).json("User not found.");
    }

    if (!checkPasswordIdValid(password)) {
      return res
        .status(400)
        .json(
          "Password must include at least one number, both lower and uppercase letters and at least one special character, such as '@,#,$,?'"
        );
    }

    // Compare old password
    const isOldPasswordValid = await comparePassword(
      oldPassword,
      user.password
    );

    if (!isOldPasswordValid) {
      return res.status(400).json("Current password is incorrect.");
    }

    // Encrypt the new password
    const newEncryptedPassword = await encryptPassword(password);

    // Update the user's password
    user.password = newEncryptedPassword;
    await user.save();
    await deleteAllUserSessions({ userId: user._id });
    return res.status(200).json("Password reset successfully");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json("Password Reset Failed: An internal server error occurred.");
  }
}

async function sendForgetLinkToMail(req, res) {
  try {
    const { email } = req.body;

    if (!checkEmailIsValid(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await User.findOne({
      email,
    })
      .select("email statuses currentWorkspace")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (user.statuses[user.currentWorkspace] === USER_STATUS.INACTIVE) {
      return res
        .status(400)
        .json({ message: "User is inactive, please contact admin" });
    }

    const token = signJwt({ email: user.email, id: user._id }, "20m", "access");
    const link = `${config.frontend_domain}/profile/forgetpassword/${user._id}/${token}`;

    const html = forgotPasswordEmailTemplate(config.frontend_domain, link);

    await sendEmail(email, "Reset Password", html);

    res.status(201).json({ message: "Reset link sent to your e-mail" });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to send reset password link.: ${error.message}`,
    });
  }
}

async function verifyEmailLinkAndUpdate(req, res) {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    const { email, error } = jwtVerify(token, "access");

    if (error) {
      return res
        .status(401)
        .json({ message: "Invalid Token", errorCode: "JwtExpired" });
    }

    if (
      !checkPasswordIdValid(confirmPassword) ||
      !checkPasswordIdValid(password) ||
      confirmPassword !== password
    ) {
      return res.status(400).json("Please enter a valid password.");
    }

    const user = await User.findOne({
      email: email,
    }).select("password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Encrypt the new password
    const newEncryptedPassword = await encryptPassword(password);

    // Update the user's password
    user.password = newEncryptedPassword;
    await user.save();
    await deleteAllUserSessions({ userId: user._id });
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to reset password` });
  }
}

async function changeTheme(req, res) {
  const user = req.user;
  try {
    const { themeId } = req.body;
    if (!themeId) {
      return res.status(400).json("Theme id is required");
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { [`workspaceThemes.${user.currentWorkspace}`]: themeId } },
      { new: true }
    )
      .select("workspaceThemes")
      .lean();

    return res.status(200).json({
      _id: updatedUser._id,
      workspaceThemes: updatedUser.workspaceThemes,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Update the demo state for a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function updateDemoState(req, res) {
  try {
    const userId = req.user._id;
    const { isDemoDone } = req.body;

    if (typeof isDemoDone !== "boolean") {
      return res
        .status(400)
        .json({ message: "isDemoDone must be a boolean value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isDemoDone } },
      { new: true, runValidators: true }
    ).select("isDemoDone roles");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Demo state updated successfully",
      isDemoDone: updatedUser.isDemoDone,
      isAdmin: updatedUser.roles.get("workspace")?.includes("admin") || false,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get the demo state for a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function getDemoState(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("isDemoDone roles");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = user.roles.get("workspace")?.includes("admin") || false;
    const response = {
      isDemoDone: user.isDemoDone ?? false,
      isAdmin,
    };

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteAllUserSessions({ userId }) {
  try {
    const sessions = await sessionCollection.find({}).toArray();

    const userSessions = sessions.filter((sess) => {
      try {
        const sessionData = sess.session;
        console.log(sessionData, "sessionData", sessionData.passport.user);
        return (
          sessionData.passport &&
          sessionData.passport.user?.toString() === userId?.toString()
        );
      } catch {
        return false;
      }
    });

    const sessionIds = userSessions.map((sess) => sess._id);

    if (sessionIds.length) {
      await sessionCollection.deleteMany({ _id: { $in: sessionIds } });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  updateProfile,
  changePassword,
  sendForgetLinkToMail,
  verifyEmailLinkAndUpdate,
  changeTheme,
  updateDemoState,
  getDemoState,
  downloadResume,
};
