const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { config } = require("../env/default.js");
const logger = require("../lib/logger.js");

const connect = async () => {
  try {
    // https://mongoosejs.com/docs/guide.html#strictQuery
    // mongoose.set("strict", true);
    //mongoosejs.com/docs/guide.html#indexes
    // mongoose.set("autoIndex", false);
    return mongoose.connect(config.db_url);
  } catch (error) {
    console.error("Could not connect to MongoDB!");
    console.error(error);
  }
};

async function disconnect() {
  await mongoose.connection.close();
}

async function loadModels() {
  const modelsPath = path.resolve("src/models");
  const models = fs
    .readdirSync(modelsPath)
    .filter((f) => f.endsWith(".model.js"));

  models.forEach((model) => {
    try {
      // Load the model
      require(path.join(modelsPath, model));
    } catch (error) {
      logger.error(
        `loadModels:: Error loading model ${model}:${error.toString()}`
      );
    }
  });
}

module.exports = {
  connect,
  disconnect,
  loadModels,
};
