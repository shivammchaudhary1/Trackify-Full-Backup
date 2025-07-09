const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateRemoveEntryLogs]";

async function migrateRemoveEntryLogs() {
  console.log(`${logPrefix}: Executing...`);

  try {
    const collections = ["workspaces", "users", "projects", "timers"];

    for (const collectionName of collections) {
      console.log(`${logPrefix}: Processing ${collectionName} collection...`);

      // Perform bulk update to remove the 'entryLogs' field
      const result = await mongoose.connection
        .collection(collectionName)
        .updateMany({}, { $unset: { entryLogs: "" } });

      console.log(
        `${logPrefix}: Removed 'entryLogs' from ${result.modifiedCount} documents in ${collectionName}`
      );
    }
  } catch (error) {
    console.error(`${logPrefix}: Error occurred during migration:`, error);
  }

  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateRemoveEntryLogs;
