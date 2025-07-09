const mongoose = require("mongoose");
const User = mongoose.model("User");

const logPrefix = "[Migrate migrateSetIsDemoDoneForExistingUsers]";

async function migrateSetIsDemoDoneForExistingUsers() {
  console.log(`${logPrefix}: Executing...`);

  try {
    const result = await User.updateMany(
      { 
        $or: [
          { isDemoDone: { $exists: false } },
          { isDemoDone: false }
        ]
      },
      { $set: { isDemoDone: true } }
    );

    console.log(
      `${logPrefix}: Updated ${result.modifiedCount} users to set isDemoDone=true`
    );
  } catch (error) {
    console.error(`${logPrefix}: Error occurred during migration:`, error);
    throw error;
  }

  console.log(`${logPrefix}: Completed`);
}

module.exports = migrateSetIsDemoDoneForExistingUsers;