const cron = require("cron");
const logger = require("../config/lib/logger.js");
const addLeaveBalanceToUsers = require("./jobHandlers/addLeaveBalanceToUsers.js");
const mayBeStartTaskToAddLeaveBalanceToUsers = require("./jobHandlers/mayBeStartTaskToAddLeaveBalanceToUsers.js");
const mayBeSendBirthdayEmail = require("./jobHandlers/mayBeSendBirthdayEmail.js");
const checkNotificationSettings = require("./jobHandlers/checkNotificationSettings.js");


const cronJobs = {};

function createJob({ data, jobId, name, time, cronTime }) {
   /**
   We use a separate `cronTime` parameter so we can 
   easily change the schedule without modifying the source code.
   */
  try {
    if (cronJobs[jobId]) {
      cronJobs[jobId].stop();
      delete cronJobs[jobId];
    }

    let schedule;

    if (cronTime) {
      schedule = cronTime; // Use custom cron expression
    } else {
      let executionDate = new Date(time);
      if (executionDate < new Date()) {
        executionDate = new Date(Date.now() + 5000); // 5s buffer
      }

      const month = executionDate.getMonth();
      const day = executionDate.getDate();

      //  # ┌────────────── second (optional) (0-59)
      //  # │ ┌──────────── minute (0-59)
      //  # │ │ ┌────────── hour (0-23)
      //  # │ │ │ ┌──────── day of month (1-31)
      //  # │ │ │ │ ┌────── month (1-12)
      //  # │ │ │ │ │ ┌──── day of week (1-7)
      //  # │ │ │ │ │ │
      //  # │ │ │ │ │ │
      //  # * * * * * *
      schedule = `${executionDate.getSeconds()} ${executionDate.getMinutes()} ${executionDate.getHours()} ${day} ${month + 1} *`;
    }
    const job = new cron.CronJob(schedule, () => {
      processJobs({ data, id: jobId, name });
    });

    cronJobs[jobId] = job;
    job.start();
    logger.info(`createJob:: Job created: ${name} - ${jobId}`);
  } catch (error) {
    logger.error(`createJob:: Error: ${error.message}`);
  }
}


function removeJob(jobId) {
  if (cronJobs[jobId]) {
    cronJobs[jobId]?.stop();
    delete cronJobs[jobId];
  }
  logger.info(`removeJob:: Job Removed: ${jobId}`);
}

async function processJobs(job) {
  switch (job.name) {
    case "addLeaveBalanceToUsers":
      await addLeaveBalanceToUsers(job);
      return;
    case "mayBeStartTaskToAddLeaveBalanceToUsers":
      await mayBeStartTaskToAddLeaveBalanceToUsers(job);
      return;
    case "mayBeSendBirthdayEmail":
      await mayBeSendBirthdayEmail(job);
      return;
    case "checkNotificationSettings":
      await checkNotificationSettings(job);
      return;
    default:
      logger.error(
        `processJobs:: Unhandled task worker job: ${job.name} - ${job.id}`
      );
  }
}

async function initiateInitialJobs() {
  const startTime = new Date();

  createJob({
    data: {},
    jobId: "mayBeStartTaskToAddLeaveBalanceToUsers",
    name: "mayBeStartTaskToAddLeaveBalanceToUsers",
    time: startTime.setSeconds(startTime.getSeconds() + 1),
  });

  createJob({
    data: {},
    jobId: "checkNotificationSettings",
    name: "checkNotificationSettings",
    cronTime: "0 0 * * *",
    // cronTime: "* * * * *",
  });
}

exports.processJobs = cronJobs;
exports.createJob = createJob;
exports.removeJob = removeJob;
exports.initiateInitialJobs = initiateInitialJobs;