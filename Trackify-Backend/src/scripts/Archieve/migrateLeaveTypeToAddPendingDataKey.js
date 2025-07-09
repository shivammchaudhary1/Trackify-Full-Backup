const mongoose = require("mongoose");
const { handleLeave } = require("../../config/utility/utility");

const logPrefix = "[Migrate migrateLeaveTypeToAddPendingDataKey]";

async function migrateLeaveTypeToAddPendingDataKey() {
  console.log(`${logPrefix}: Executing...`);
  try {
    // Retrieve all Leave documents
    const leaves = await mongoose.connection
      .collection("leaves")
      .find({ status: "pending" })
      .toArray();

    // Initialize the bulkWrites array to hold all update operations
    const bulkWrites = [];

    // Iterate through each Leave document
    for (let leave of leaves) {
      const {
        _id,
        leaveBalance: leaveBalanceId,
        type,
        startDate,
        endDate,
        numberOfDays,
        workspace: workspaceId,
      } = leave;

      // Retrieve the associated leave balance for the user
      const [usersLeaveBalance, holidays] = await Promise.all([
        mongoose.connection
          .collection("leavebalances")
          .findOne({ _id: leaveBalanceId, workspace: workspaceId }),
        mongoose.connection
          .collection("holidays")
          .find({
            workspace: workspaceId,
            date: { $gte: startDate, $lte: endDate },
          })
          .toArray(),
      ]);

      if (!usersLeaveBalance) {
        console.log(`No leave balance found for leave ID: ${_id}`);
        continue;
      }

      // Initialize the pendingData object
      let pendingData = {};

      // Assuming `handleLeave` logic is available here to get the leaveType
      const possibleLeaveBalance = handleLeave({
        leaveBalance: usersLeaveBalance.leaveBalance,
        appliedLeaveType: type,
        noOfDays: numberOfDays,
        holidays,
        startDate,
        endDate,
      });

      // Only proceed if the leave can be applied
      if (possibleLeaveBalance.canApply) {
        if (possibleLeaveBalance.type === "mixed") {
          // For mixed leave, add both leave types to pendingData
          pendingData = {
            [possibleLeaveBalance.leaveToReduce[0].type]:
              possibleLeaveBalance.leaveToReduce[0].value,
            [possibleLeaveBalance.leaveToReduce[1].type]:
              possibleLeaveBalance.leaveToReduce[1].value,
          };
        } else {
          // For single leave type, add the leave type and its value to pendingData
          pendingData = {
            [possibleLeaveBalance.type]: possibleLeaveBalance.leaveToReduce,
          };
        }

        // Add the update operation to the bulkWrites array
        bulkWrites.push({
          updateOne: {
            filter: { _id: _id, workspace: workspaceId },
            update: {
              $set: { pendingData: pendingData },
            },
          },
        });
      }
    }

    // Perform the bulk update if there are any operations to apply
    if (bulkWrites.length) {
      const { modifiedCount } = await mongoose.connection
        .collection("leaves")
        .bulkWrite(bulkWrites);

      console.log(`${logPrefix}: Updated ${modifiedCount} leaves successfully`);
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateLeaveTypeToAddPendingDataKey;
