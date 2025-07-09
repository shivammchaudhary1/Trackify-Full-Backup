const express = require("./express.js");
const mongooseLib = require("./mongoose.js");
const { config } = require("../env/default.js");
const chalk = require("chalk");
const logger = require("../lib/logger.js");
const { runMigration } = require("../../scripts/runMigration.js");
const worker = require("../../worker/worker.js");

async function init() {
  try {
    // Connect to mongodb database
    await mongooseLib.connect();

    // Load models
    await mongooseLib.loadModels();

    // Run data Migration that may need running on startup
    await runMigration();

    // Initialize express
    const app = await express.init();

    return app;
  } catch (error) {
    logger.error(`init:: ${error.message}`);
    process.exit(1);
  }
}

async function start() {
  // `app` is initially undefined, but is assigned later when the Express app
  // initializes.
  let app;

  try {
    app = await init();
    app.listen(config.port, () => {
      logger.info(`start:: Server is running at port: ${config.port}`);
    });

    registerShutdownHandlers();

    await worker.initiateInitialJobs();
  } catch (error) {
    logger.error(`[start]:${error.toString()}`);
    process.exit(1);
  }
}

function registerShutdownHandlers() {
  let shuttingDown = false;

  const stopServer = async () => {
    // It's possible that the process receives multiple shut down signals
    // In which case we want to shut down just once
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    try {
      console.log(chalk.yellow("Closing HTTP server"));
      await mongooseLib.disconnect();
      console.log(chalk.yellow("HTTP server closed"));
      process.exit();
    } catch (error) {
      console.log(error)
      logger.error(`stopServer:: ${error.message}`);
    }
  };

  // When the process is interrupted (e.g. ctrl+c)
  process.on("SIGINT", stopServer);
  // When the process is terminated (e.g. kill)
  process.on("SIGTERM", stopServer);
  process.on("uncaughtException", function (error) {
     console.log(error)
    logger.error(`stopServer:: ${error.message}`);
  });
}

module.exports = { start };
