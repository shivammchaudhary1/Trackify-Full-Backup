const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateLeaveTypeToAddIsActiveKey]";

async function migrateLeaveTypeToAddIsActiveKey() {
  console.log(`${logPrefix}: Executing...`);
  try {
    await Promise.all([
      // Update all elements in the "leaveTypes" array in the "workspaces" collection
      mongoose.connection.collection("workspaces").updateMany(
        {},
        {
          $set: {
            "leaveTypes.$[].isActive": true,
          },
        }
      ),
      // Update all elements in the "leaveBalance" array in the "leavebalances" collection
      mongoose.connection.collection("leavebalances").updateMany(
        {},
        {
          $set: {
            "leaveBalance.$[].isActive": true,
          },
        }
      ),
    ]);
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateLeaveTypeToAddIsActiveKey;
