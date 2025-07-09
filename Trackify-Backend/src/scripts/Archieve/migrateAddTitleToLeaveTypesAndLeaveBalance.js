const mongoose = require("mongoose");

const logPrefix = "[Migrate migrateAddTitleToLeaveTypesAndLeaveBalance]";

async function migrateAddTitleToLeaveTypesAndLeaveBalance() {
  console.log(`${logPrefix}: Executing...`);
  try {
    // Retrieve all Workspace documents
    // Retrieve all LeaveBalance documents
    const [workspaces, leaveBalances] = await Promise.all([
      mongoose.connection.collection("workspaces").find({}).toArray(),
      mongoose.connection.collection("leavebalances").find({}).toArray(),
    ]);

    // Initialize the bulkWrites array to hold all update operations for workspaces
    const workspaceBulkWrites = [];

    // Initialize the bulkWrites array to hold all update operations for leaveBalances
    const leaveBalanceBulkWrites = [];

    // Iterate through each Workspace document
    for (let workspace of workspaces) {
      // Add title key with the same value as leaveType in the leaveTypes array
      const updatedLeaveTypes = workspace.leaveTypes.map((leaveType) => ({
        ...leaveType,
        title: leaveType.leaveType,
      }));

      // Add the update operation to the workspaceBulkWrites array
      workspaceBulkWrites.push({
        updateOne: {
          filter: { _id: workspace._id },
          update: {
            $set: {
              leaveTypes: updatedLeaveTypes,
            },
          },
        },
      });
    }

    // Iterate through each LeaveBalance document
    for (let leaveBalance of leaveBalances) {
      // Add title key with the same value as type in the leaveBalance array
      const updatedLeaveBalance = leaveBalance.leaveBalance.map((leave) => ({
        ...leave,
        title: leave.type,
      }));

      // Add the update operation to the leaveBalanceBulkWrites array
      leaveBalanceBulkWrites.push({
        updateOne: {
          filter: { _id: leaveBalance._id },
          update: {
            $set: {
              leaveBalance: updatedLeaveBalance,
            },
          },
        },
      });
    }

    // Perform the bulk update for workspaces if there are any operations to apply
    if (workspaceBulkWrites.length) {
      const { modifiedCount } = await mongoose.connection
        .collection("workspaces")
        .bulkWrite(workspaceBulkWrites);

      console.log(
        `${logPrefix}: Updated ${modifiedCount} workspaces successfully`
      );
    }

    // Perform the bulk update for leaveBalances if there are any operations to apply
    if (leaveBalanceBulkWrites.length) {
      const { modifiedCount } = await mongoose.connection
        .collection("leavebalances")
        .bulkWrite(leaveBalanceBulkWrites);

      console.log(
        `${logPrefix}: Updated ${modifiedCount} leave balances successfully`
      );
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateAddTitleToLeaveTypesAndLeaveBalance;
