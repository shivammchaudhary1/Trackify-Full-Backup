// const mongoose = require("mongoose");
// const Entry = mongoose.model("Entry");

// const logPrefix = "[Migrate migrateConvertStartTimeToSingleStartTime]";

// async function migrateConvertStartTimeToSingleStartTime() {
//   console.log(`${logPrefix}: Executing...`);

//   try {
//     // Retrieve all Entry documents with startTime array
//     const entries = await mongoose.connection
//       .collection("entries")
//       .find({ startTime: { $type: "array" } })
//       .toArray();

//     // Initialize the bulkWrites array to hold all update operations
//     const bulkWrites = [];

//     // Iterate through each Entry document
//     for (let entry of entries) {
//       const { _id, startTime, endTime, ...rest } = entry;

//       if (Array.isArray(startTime) && startTime.length > 0) {
//         startTime.forEach((singleStartTime, index) => {
//           let newEntry = {
//             ...rest,
//             _id: new mongoose.Types.ObjectId(),
//             startTime: new Date(singleStartTime),
//           };

//           if (Array.isArray(endTime) && endTime[index]) {
//             newEntry.endTime = new Date(endTime[index]);
//           } else if (Array.isArray(endTime)) {
//             newEntry.endTime = endTime[0];
//           }

//           bulkWrites.push({
//             insertOne: {
//               document: newEntry,
//             },
//           });
//         });

//         // Add delete operation to remove old entry after creating new entries
//         bulkWrites.push({
//           deleteOne: {
//             filter: { _id },
//           },
//         });
//       }
//     }

//     // Perform the bulk write if there are any operations to apply
//     if (bulkWrites.length) {
//       const result = await mongoose.connection
//         .collection("entries")
//         .bulkWrite(bulkWrites);

//       console.log(
//         `${logPrefix}: Modified ${result.nInserted} new entries and deleted old ones successfully`
//       );
//     }
//   } catch (error) {
//     console.error("Error occurred during migration:", error);
//   }
//   console.log(`${logPrefix}: Completed`);
// }

// // Run the migration
// module.exports = migrateConvertStartTimeToSingleStartTime;

const mongoose = require("mongoose");
const Entry = mongoose.model("Entry");

const logPrefix = "[Migrate migrateConvertStartTimeToSingleStartTime]";

async function migrateConvertStartTimeToSingleStartTime() {
  console.log(`${logPrefix}: Executing...`);

  try {
    // Retrieve all Entry documents with startTime array
    const entries = await mongoose.connection
      .collection("entries")
      .find({ startTime: { $type: "array" } })
      .toArray();

    // Initialize the bulkWrites array to hold all update operations
    const bulkWrites = [];

    // Iterate through each Entry document
    for (let entry of entries) {
      const { _id, startTime, endTime, ...rest } = entry;

      if (Array.isArray(startTime) && startTime.length > 0) {
        startTime.forEach((singleStartTime, index) => {
          const newEntry = {
            ...rest,
            _id: new mongoose.Types.ObjectId(),
            startTime: new Date(singleStartTime),
          };

          let duration = 0;
          // Ensure endTime handling is robust
          if (Array.isArray(endTime) && endTime[index]) {
            newEntry.endTime = new Date(endTime[index]);
            duration =
              (new Date(endTime[index]) - new Date(singleStartTime)) / 1000;
          } else if (Array.isArray(endTime) && endTime.length > 0) {
            newEntry.endTime = new Date(endTime[0]);
            // Calculate duration in seconds
            duration =
              (new Date(endTime[0]) - new Date(singleStartTime)) / 1000;
          }

          newEntry.durationInSeconds = Math.round(duration);

          bulkWrites.push({
            insertOne: {
              document: newEntry,
            },
          });
        });

        // Add delete operation to remove old entry after creating new entries
        bulkWrites.push({
          deleteOne: {
            filter: { _id },
          },
        });
      }
    }

    // Perform the bulk write if there are any operations to apply
    if (bulkWrites.length) {
      const result = await mongoose.connection
        .collection("entries")
        .bulkWrite(bulkWrites);

      console.log(
        `${logPrefix}: Inserted ${result.insertedCount} new entries and deleted ${result.deletedCount} old entries successfully`
      );
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateConvertStartTimeToSingleStartTime;
