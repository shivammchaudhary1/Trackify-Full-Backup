const mongoose = require("mongoose");
const { USER_STATUS, USER_ROLE } = require("../config/utility/user.utility.js");

const Client = mongoose.model("Client");
const User = mongoose.model("User");
const Workspace = mongoose.model("Workspace");
const Project = mongoose.model("Project");
const Entry = mongoose.model("Entry");
const Timer = mongoose.model("Timer");

async function createClient(req, res) {
  const { clientName } = req.body;
  const { _id: userId, currentWorkspace: workspaceId } = req.user;

  if (!clientName || !userId || !workspaceId) {
    return res
      .status(400)
      .json(
        `Missing required fields to create a client. please provide client name and user.`
      );
  }

  try {
    // Create a new client
    const newClient = await Client.create({
      name: clientName,
      user: userId,
      workspace: workspaceId,
    });

    // Update the user and workspace with the new client
    await Promise.all([
      User.updateOne(
        {
          _id: userId,
          [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE,
          currentWorkspace: workspaceId,
        },
        { $push: { clients: newClient._id } }
      ),
      Workspace.updateOne(
        { _id: workspaceId },
        { $push: { clients: newClient._id } }
      ),
    ]);

    return res.status(201).json({
      client: {
        _id: newClient._id,
        name: newClient.name,
        createdAt: newClient.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json(`Failed to Create a Client: ${error.message}`);
  }
}

/**
 * Get all the clients belongs to the workspace
 */
async function getWorkspaceClients(req, res) {
  const userRoles = req.user.roles.get(req.user.currentWorkspace);
  if (!userRoles.includes(USER_ROLE.ADMIN)) {
    return res.status(403).json("Unauthorized");
  }

  try {
    const clients = await Client.find({
      workspace: req.user.currentWorkspace,
    })
      .select("name createdAt")
      .lean();

    // Return the list of clients
    return res.status(200).json({ clients });
  } catch (error) {
    // Return the error message
    return res.status(400).json(`Failed to Get All Clients: ${error.message}`);
  }
}

/*
 * Update client
 */
async function updateClient(req, res) {
  const { clientId } = req.params;
  const { name } = req.body;

  if (!name || !clientId) {
    return res.status(400).json("new client name and client is required.");
  }

  try {
    const updatedClient = await Client.findOneAndUpdate(
      { _id: clientId, workspace: req.user.currentWorkspace },
      {
        $set: { name, updatedAt: new Date() },
      },
      { new: true }
    )
      .select("name createdAt")
      .lean();

    return res.status(200).json({ client: updatedClient });
  } catch (error) {
    return res.status(500).json(`Error updating Client: ${error.message}`);
  }
}

// Delete client
async function deleteClient(req, res) {
  const { clientId } = req.params;
  const workspaceId = req.user.currentWorkspace;

  try {
    const [client, projects] = await Promise.all([
      Client.findOne({
        _id: clientId,
        workspace: workspaceId,
      })
        .select("_id")
        .lean(),
      Project.find({
        workspace: workspaceId,
        client: clientId,
      })
        .select("_id team")
        .lean(),
    ]);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const projectIds = projects.map((project) => project._id);
    const teamUserIds = projects.flatMap((project) => project.team || []);

    const entriesToDelete = await Entry.find({
      project: { $in: projectIds },
      workspace: workspaceId,
    })
      .select("_id")
      .lean();

    const entryIds = entriesToDelete.map((entry) => entry._id);


    if (teamUserIds.length > 0 && entryIds.length > 0) {
        await Timer.updateMany(
        {
          user: { $in: teamUserIds },
          currentLog: { $in: entryIds },
          isRunning: true,
        },
        {
          $set: { isRunning: false },
        }
      );
    }

    // Perform all deletions and updates
    await Promise.all([
      // 1. Delete related entry logs
      Entry.deleteMany({
        project: { $in: projectIds },
        workspace: workspaceId,
      }),
      // 2. Delete related projects
      Project.deleteMany({ _id: { $in: projectIds }, workspace: workspaceId }),
      // 3. Update all users in the workspace to remove client, projects, and entry logs
      User.updateMany(
        { workspaces: workspaceId },
        {
          $pull: {
            clients: clientId,
            projects: { $in: projectIds },
          },
        }
      ),
      // 4. Update workspace to remove client and project references
      Workspace.updateOne(
        { _id: workspaceId },
        { $pull: { clients: clientId, projects: { $in: projectIds } } }
      ),
      // 5. Delete the client
      Client.deleteOne({ _id: clientId, workspace: workspaceId }),
    ]);

    res.status(200).json({ message: "Client deleted successfully", clientId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete client", error: error.message });
  }
}

module.exports = {
  createClient,
  getWorkspaceClients,
  updateClient,
  deleteClient,
};
