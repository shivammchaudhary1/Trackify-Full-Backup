const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateWorkspaceThemesToMap]";

async function migrateWorkspaceThemesToMap() {
  console.log(`${logPrefix}: Executing...`);
  try {
    // Retrieve all User documents
    const users = await mongoose.connection
      .collection("users")
      .find({})
      .toArray();

    // Initialize the bulkWrites array to hold all update operations
    const bulkWrites = [];

    // Iterate through each User document
    for (let user of users) {
      const { _id, workspaceThemes } = user;

      // Transform workspaceThemes array to a Map
      const workspaceThemesMap = {};
      if (workspaceThemes && workspaceThemes.length) {
        workspaceThemes.forEach((item) => {
          if (item.workspaceId && item.theme) {
            workspaceThemesMap[item.workspaceId.toString()] = item.theme;
          }
        });

        // Add the update operation to the bulkWrites array
        bulkWrites.push({
          updateOne: {
            filter: { _id: _id },
            update: {
              $set: { workspaceThemes: workspaceThemesMap },
            },
          },
        });
      }

      if (!workspaceThemes && user.email) {
        // Add the update operation to the bulkWrites array
        bulkWrites.push({
          updateOne: {
            filter: { _id: _id },
            update: {
              $set: {
                workspaceThemes: {
                  [user.currentWorkspace.toString()]: "trackify-ui-theme-1",
                },
              },
            },
          },
        });
      }
    }

    // Perform the bulk update if there are any operations to apply
    if (bulkWrites.length) {
      const { modifiedCount } = await mongoose.connection
        .collection("users")
        .bulkWrite(bulkWrites);

      console.log(`${logPrefix}: Updated ${modifiedCount} users successfully`);
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateWorkspaceThemesToMap;
