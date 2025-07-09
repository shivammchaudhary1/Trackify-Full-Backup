const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateStartTimeToDateType]";

async function migrateStartTimeToDateType() {
  console.log(`${logPrefix}: Executing...`);
  try {
    // Fetch all entries where startTime contains string values
    const entries = await mongoose.connection
      .collection("entries")
      .find({
        startTime: { $exists: true, $type: "array" },
      })
      .toArray();

    // Prepare bulk update operations
    const bulkWrites = [];

    for (const entry of entries) {
      const updatedStartTimes = entry.startTime.map((time) => {
        return typeof time === "string" ? new Date(time) : time;
      });

      bulkWrites.push({
        updateOne: {
          filter: { _id: entry._id, workspace: entry.workspace },
          update: { $set: { startTime: updatedStartTimes } },
        },
      });
    }

    // Execute bulk updates
    if (bulkWrites.length) {
      const { modifiedCount } = await mongoose.connection
        .collection("entries")
        .bulkWrite(bulkWrites);

      console.log(
        `${logPrefix}: Updated ${modifiedCount} entries successfully`
      );
    } else {
      console.log(`${logPrefix}: No entries required updating.`);
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Export the migration function
module.exports = migrateStartTimeToDateType;
