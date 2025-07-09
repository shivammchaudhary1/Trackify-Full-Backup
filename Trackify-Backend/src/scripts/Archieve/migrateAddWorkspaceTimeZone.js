const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateAddWorkspaceTimeZone]";

async function migrateAddWorkspaceTimeZone() {
  console.log(`${logPrefix}: Executing...`);
  try {
    // Retrieve all Workspace documents
    const workspaces = await mongoose.connection
      .collection("workspaces")
      .find({})
      .toArray();

    // Initialize the bulkWrites array to hold all update operations
    const bulkWrites = [];

    // Iterate through each Workspace document
    for (let workspace of workspaces) {
      const { _id } = workspace;

      // Check if 'timeZone' field already exists
      if (!workspace.timeZone) {
        // Add the update operation to the bulkWrites array
        bulkWrites.push({
          updateOne: {
            filter: { _id: _id },
            update: {
              $set: { timeZone: "Asia/Kolkata" },
            },
          },
        });
      }
    }

    // Perform the bulk update if there are any operations to apply
    if (bulkWrites.length) {
      const { modifiedCount } = await mongoose.connection
        .collection("workspaces")
        .bulkWrite(bulkWrites);

      console.log(
        `${logPrefix}: Updated ${modifiedCount} workspaces successfully`
      );
    } else {
      console.log(`${logPrefix}: No workspaces needed updating.`);
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateAddWorkspaceTimeZone;
