const logger = require("../../config/lib/logger.js");
const User = require("../../models/user.model.js");
const Workspace = require("../../models/workspace.model.js"); 
const worker = require("../worker.js");
const {sendEmail} = require("../../config/lib/nodemailer.js"); 
const { mayBeSendBirthdayEmailTemplate, userBirthdaySummaryToAdminEmailTemplate } = require("../../config/utility/htmlTemplate.js");
const { USER_STATUS, USER_ROLE } = require("../../config/utility/user.utility.js");
const moment = require("moment-timezone");

async function mayBeSendBirthdayEmail(job) {
  try {
    const { workspaceId } = job.data;
    const [users, workspace] = await Promise.all([
        User.find({[`statuses.${workspaceId}`]: USER_STATUS.ACTIVE})
                      .select("name email roles dateOfBirth")
                      .lean(),
        Workspace.findById(workspaceId).select("name timeZone"),
    ]);
    // List 1: Users whose birthday is today (in their timezone)
      const birthdayUsers = users.filter(user => {
        if (user.dateOfBirth && workspace.timeZone) {
          const today = moment().tz(workspace.timeZone);
          const birthday = moment(user.dateOfBirth).tz(workspace.timeZone);
          return (
            today.date() === birthday.date() &&
            today.month() === birthday.month()
          );
        }
        return false;
      });

      // List 2: Admins of this workspace
      const adminUsers = users.filter(user =>
        user.roles &&
        user.roles[workspace._id] &&
        user.roles[workspace._id].includes(USER_ROLE.ADMIN)
      );

    if(birthdayUsers?.length > 0) {
      for (const user of birthdayUsers) {
        const birthdayHtml = mayBeSendBirthdayEmailTemplate(user.name);
        await sendEmail(
          user.email,
          "🎉 Happy Birthday!",
          birthdayHtml,
        );
      }
      logger.info(`mayBeSendBirthdayEmail:: Sent birthday emails to ${birthdayUsers.length} users.`);
    }

 if (adminUsers?.length > 0) {
  for (const admin of adminUsers) {

    //remove admin from birthday users (if any)
    const birthdayUsersExcludingAdmin = birthdayUsers.filter(
      user => String(user._id) !== String(admin._id)
    );

    if (birthdayUsersExcludingAdmin.length > 0) {
      const html = userBirthdaySummaryToAdminEmailTemplate({
        users: birthdayUsersExcludingAdmin,
        workspaceName: workspace.name
      });

      await sendEmail(admin.email, "Birthday Notification", html);
    }
  }

  logger.info(
    `mayBeSendBirthdayEmail:: Sent birthday notification emails to ${adminUsers.length} workspace admins.`
  );
}
  } catch (error) {
    logger.error(`mayBeSendBirthdayEmail:: ${error.message}`);
  }finally {
    worker.removeJob(job.id);
  }
}

module.exports = mayBeSendBirthdayEmail;
