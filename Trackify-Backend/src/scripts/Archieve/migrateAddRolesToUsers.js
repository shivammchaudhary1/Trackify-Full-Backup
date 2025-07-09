const mongoose = require("mongoose");
const User = mongoose.model("User");
const Workspace = mongoose.model("Workspace");

const logPrefix = "[Migrate migrateAddRolesToUsers]";

async function migrateAddRolesToUsers() {
  console.log(`${logPrefix}: Executing...`);
  try {
    const workspaces = await Workspace.find().lean();

    for (const workspace of workspaces) {
      const usersToUpdate = workspace.users.map(async (workspaceUser) => {
        const roles = [];
        if (workspaceUser.isAdmin) {
          roles.push("admin");
        }
        roles.push("user");

        await User.collection.updateOne(
          { _id: workspaceUser.user },
          {
            $unset: { role: 1 },
            $addToSet: {
              [`roles.${workspace._id}`]: { $each: [...new Set(roles)] },
            },
          }
        );
      });
      await Promise.all(usersToUpdate);
    }
  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
  console.log(`${logPrefix}: Completed`);
}

// Run the migration
module.exports = migrateAddRolesToUsers;
