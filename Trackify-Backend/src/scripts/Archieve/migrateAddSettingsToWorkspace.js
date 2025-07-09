const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateAddSettingsToWorkspace]";

async function migrateAddSettingsToWorkspace() {
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
      // Add the update operation to the bulkWrites array
      bulkWrites.push({
        updateOne: {
          filter: { _id: workspace._id },
          update: {
            $set: {
              "settings.notification.admin.birthday": {
                system: true,
                email: false,
              },
              "settings.notification.user.birthday": {
                system: true,
                email: false,
              },
            },
          },
        },
      });
    }

    // Perform the bulk update if there are any operations to apply
    if (bulkWrites.length) {
      const { modifiedCount } = await mongoose.connection
        .collection("workspaces")
        .bulkWrite(bulkWrites);

      console.log(
        `${logPrefix}: Updated ${modifiedCount} workspaces successfully`
      );
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateAddSettingsToWorkspace;
