const mongoose = require("mongoose");

const logPrefix = "[Migrate updateLeaveTypes]";

async function updateLeaveTypes() {
  console.log(`${logPrefix}: Executing...`);
  try {
    // Retrieve all Leave documents with type "casual"
    const leaves = await mongoose.connection
      .collection("leaves")
      .find({ type: "casual" })
      .toArray();

    // Initialize the bulkWrites array to hold all update operations
    const bulkWrites = [];

    // Iterate through each Leave document
    for (let leave of leaves) {
      // Add the update operation to the bulkWrites array
      bulkWrites.push({
        updateOne: {
          filter: { _id: leave._id },
          update: {
            $set: {
              type: "casual / Sick",
              // type: "casual",
            },
          },
        },
      });
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
module.exports = updateLeaveTypes;
