const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateUserStatus]";

async function migrateUserStatus() {
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
        const userId = user._id;
      const userStatus = user.status || "active"; 

      // Get the user's workspaces
      // Assuming user.workspaces is an array of workspace IDs
      const userWorkspaces = user.workspaces || [];

      // Build the statuses map
      const status = {};

      userWorkspaces.forEach((workspaceId) => {
        status[workspaceId.toString()] = userStatus;
      });

      // Add the update operation to the bulkWrites array
      bulkWrites.push({
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
               statuses: status,
            },
            $unset: { status: "" },
          },
        },
      });
    }

    // Perform the bulk update if there are any operations to apply
    if (bulkWrites.length) {
      const result = await mongoose.connection
        .collection("users")
        .bulkWrite(bulkWrites);

      console.log(
        `${logPrefix}: Updated ${result.modifiedCount} users successfully`
      );
    } else {
      console.log(`${logPrefix}: No users to update.`);
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateUserStatus;
