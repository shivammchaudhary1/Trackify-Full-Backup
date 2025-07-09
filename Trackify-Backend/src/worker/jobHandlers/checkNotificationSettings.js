const logger = require("../../config/lib/logger.js");
const worker = require("../worker.js");
const Workspace = require("../../models/workspace.model.js");

async function checkNotificationSettings() {
  try {
    
    const workspaces = await Workspace.find({
      "settings.notification.user.birthday.email": true,
    }).select("_id").lean();
  
   

    let startTime = Date.now();
    let delay = 5000;
    // console.log(workspaces, 'workspaces', startTime.setSeconds(startTime.getSeconds() + delay));
    if (workspaces.length > 0) {
      for (const workspace of workspaces) {
        startTime = startTime + delay;
        worker.createJob({
          data: {
            workspaceId: workspace._id,
          },
          jobId: `mayBeSendBirthdayEmail-${workspace._id}`,
          name: "mayBeSendBirthdayEmail",
          time: startTime,
        });
      }
    }
    
    } catch (error) {
      logger.error(`checkNotificationSettings:: ${error.message}`);
    }
}
module.exports = checkNotificationSettings;