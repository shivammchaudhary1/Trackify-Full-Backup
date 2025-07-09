const mongoose = require("mongoose");

const logPrefix = "[Migrate removeAccessTokenAndRefreshToken]";

async function removeAccessTokenAndRefreshToken() {
  console.log(`${logPrefix}: Executing...`);
  try {
    // Directly update all User documents to remove accessToken and refreshToken
    const result = await mongoose.connection.collection("users").updateMany(
      {
        $or: [
          { accessToken: { $exists: true } },
          { refreshToken: { $exists: true } },
        ],
      },
      {
        $unset: { accessToken: "", refreshToken: "" },
      }
    );

    console.log(
      `${logPrefix}: Updated ${result.modifiedCount} users successfully`
    );
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = removeAccessTokenAndRefreshToken;
