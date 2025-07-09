const { USER_STATUS, USER_ROLE } = require("../config/utility/user.utility.js");

const mongoose = require("mongoose");
const Project = mongoose.model("Project");
const Workspace = mongoose.model("Workspace");
const Entry = mongoose.model("Entry");
const Client = mongoose.model("Client");
const User = mongoose.model("User");

// Create new project
async function createProject(req, res) {
  const data = req.body;
  const userId = req.user._id;
  const workSpaceId = req.user.currentWorkspace;

  try {
    const [user, workspace, client] = await Promise.all([
      User.findOne({
        _id: userId,
        [`statuses.${workSpaceId}`]: USER_STATUS.ACTIVE,
        currentWorkspace: workSpaceId,
      }),
      Workspace.findById(data.workspace),
      Client.findById(data.client),
    ]);

    if (!user) {
      return res.status(400).json("User not found.");
    }

    if (!workspace) {
      return res.status(400).json("Workspace not found.");
    }

    if (!client) {
      return res.status(400).json("Client not found.");
    }

    const teamMembersNotInArray = data.team.filter(
      (member) => !data.user.includes(member)
    );

    const newProject = new Project(data);

    await Promise.all([
      User.updateOne(
        {
          _id: user._id,
          currentWorkspace: workSpaceId,
          status: USER_STATUS.ACTIVE,
        },
        { $push: { projects: newProject._id } }
      ),
      Workspace.updateOne(
        { _id: workSpaceId },
        { $push: { projects: newProject._id } }
      ),
      Client.updateOne(
        { _id: client._id, workspace: workSpaceId },
        { $push: { projects: newProject._id } }
      ),
      ...teamMembersNotInArray.map(async (memberId) => {
        const memberUser = await User.findById(memberId);
        const memberWorkspace = await Workspace.findById(
          memberUser.currentWorkspace
        );

        if (memberUser && memberWorkspace) {
          await Promise.all([
            memberUser.updateOne({ $push: { projects: newProject._id } }),
            memberWorkspace.updateOne({ $push: { projects: newProject._id } }),
          ]);
        }
      }),
    ]);

    const savedProject = await newProject.save();
    savedProject.timeSpend = 0;

    res.status(201).json({ project: savedProject });
  } catch (error) {
    return res.status(500).json(`Failed to create project: ${error.message}`);
  }
}

const getProjectListForUser = async (req, res) => {
  try {
    const user = req.user;

    const isWorkspaceAdmin = user.roles
      .get(req.user.currentWorkspace)
      .includes(USER_ROLE.ADMIN);

    const matchStage = {
      workspace: user.currentWorkspace,
    };

    // Add user condition only if the user is not an admin
    if (!isWorkspaceAdmin) {
      matchStage.team = {
        $in: [req.user._id],
      };
    }

    // const entries = await Entry.aggregate([
    //   { $match: matchStage },
    //   {
    //     $lookup: {
    //       from: "projects",
    //       localField: "project",
    //       foreignField: "_id",
    //       as: "projectDetails",
    //     },
    //   },
    //   { $unwind: "$projectDetails" },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "user",
    //       foreignField: "_id",
    //       as: "userDetails",
    //     },
    //   },
    //   { $unwind: "$userDetails" },
    //   {
    //     $group: {
    //       _id: "$projectDetails._id",
    //       name: { $first: "$projectDetails.name" },
    //       description: { $first: "$projectDetails.description" },
    //       estimatedHours: { $first: "$projectDetails.estimatedHours" },
    //       isCompleted: { $first: "$projectDetails.isCompleted" },
    //       createdDate: { $first: "$projectDetails.createdAt" },
    //       client: { $first: "$projectDetails.client" },
    //       timeSpend: { $sum: "$durationInSeconds" },
    //       developers: {
    //         $push: {
    //           userId: "$userDetails._id",
    //           name: "$userDetails.name",
    //           timeSpent: "$durationInSeconds",
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "clients",
    //       localField: "client",
    //       foreignField: "_id",
    //       as: "clientDetails",
    //     },
    //   },
    //   { $unwind: "$clientDetails" },
    //   {
    //     $project: {
    //       name: 1,
    //       description: 1,
    //       estimatedHours: 1,
    //       isCompleted: 1,
    //       createdDate: 1,
    //       timeSpend: 1,
    //       client: "$clientDetails.name",
    //       developers: 1,
    //     },
    //   },
    // ]);

    const projects = await Project.aggregate([
      // Match projects in the current workspace
      { $match: matchStage },
      {
        // Lookup Entries related to each project
        $lookup: {
          from: "entries",
          localField: "_id",
          foreignField: "project",
          as: "entries",
        },
      },
      {
        // Unwind entries if any, else use zero values
        $unwind: { path: "$entries", preserveNullAndEmptyArrays: true },
      },
      {
        // Lookup User details related to each entry
        $lookup: {
          from: "users",
          localField: "entries.user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        // Unwind user details if any, else use empty array
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
      },
      {
        // Group by project details
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          estimatedHours: { $first: "$estimatedHours" },
          isCompleted: { $first: "$isCompleted" },
          createdDate: { $first: "$createdAt" },
          client: { $first: "$client" },
          timeSpend: { $sum: { $ifNull: ["$entries.durationInSeconds", 0] } },
          team: {
            $addToSet: {
              $cond: {
                if: "$userDetails._id",
                then: "$userDetails._id",
                // then: {
                //   userId: "$userDetails._id",
                //   name: "$userDetails.name",
                //   timeSpent: { $ifNull: ["$entries.durationInSeconds", 0] },
                // },
                else: null,
              },
            },
          },
        },
      },
      {
        // Filter out null developers
        $project: {
          name: 1,
          description: 1,
          estimatedHours: 1,
          isCompleted: 1,
          createdDate: 1,
          timeSpend: 1,
          client: 1,
          team: {
            $filter: {
              input: "$team",
              as: "developer",
              cond: { $ne: ["$$developer", null] },
            },
          },
        },
      },
      {
        // Lookup Client details related to each project
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "clientDetails",
        },
      },
      { $unwind: "$clientDetails" },
      {
        // Final project formatting
        $project: {
          name: 1,
          description: 1,
          estimatedHours: 1,
          isCompleted: 1,
          createdDate: 1,
          timeSpend: 1,
          client: "$clientDetails._id",
          team: 1,
        },
      },
    ]);

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json(`Failed to get Projects: ${error.message}`);
  }
};

const getProjectListForWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await Project.find({
      workspace: id,
    });
    // const projects = workspace.projects;

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json(`Failed to get Projects: ${error.message}`);
  }
};

const getProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json("Project not found");
    }

    res.json({ project });
  } catch (error) {
    return res.status(500).json(`Failed to get project: ${error.message}`);
  }
};

const updateProject = async (req, res) => {
  const { currentWorkspace: workspaceId } = req.user;
  const { id } = req.params;
  const {
    name,
    description,
    estimatedHours,
    toggleIsComplete,
    clientId,
    selectedUsers,
    isProjectCompleted,
    timeSpend,
  } = req.body;

  try {
    const projectUpdate = {};

    if (toggleIsComplete) {
      projectUpdate.isCompleted = isProjectCompleted;
    }

    if (name) {
      projectUpdate.name = name;
    }

    if (description) {
      projectUpdate.description = description;
    }

    if (estimatedHours) {
      projectUpdate.estimatedHours = estimatedHours;
    }

    if (clientId) {
      projectUpdate.client = clientId;
    }

    if (timeSpend) {
      projectUpdate.timeSpend = timeSpend;
    }

    if (selectedUsers && selectedUsers.length > 0) {
      // Filter out invalid ObjectIDs
      const validUserIds = selectedUsers.filter((userId) =>
        mongoose.isValidObjectId(userId)
      );

      if (validUserIds.length !== selectedUsers.length) {
        // Handle the case where some user IDs are invalid
        return res.status(400).json("Invalid user IDs provided.");
      }

      // Proceed with updating users
      const userPromises = validUserIds.map(async (userId) => {
        User.updateOne({ _id: userId }, { $push: { projects: id } });
      });

      await Promise.all(userPromises);

      projectUpdate.team = validUserIds;
    }

    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, workspace: workspaceId },
      { $set: projectUpdate },
      { new: true }
    );

    return res.status(200).json({ project: updatedProject });
  } catch (error) {
    return res.status(500).json(`Failed to update project: ${error.message}`);
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProject = await Project.findById(id);

    if (!deletedProject) {
      return res.status(404).json("Project not found.");
    }
    const [userUpdate, workspaceUpdate, clientUpdate] = await Promise.all([
      User.updateMany({}, { $pull: { projects: id } }),
      Workspace.updateMany({}, { $pull: { projects: id } }),
      Client.updateMany({}, { $pull: { projects: id } }),
      Entry.deleteMany({ project: id }),
      Project.findByIdAndDelete(id),
    ]);

    if (
      userUpdate.nModified === 0 ||
      workspaceUpdate.nModified === 0 ||
      clientUpdate.nModified === 0
    ) {
      return res
        .status(500)
        .json("Failed to update references in user, workspace, or client.");
    }

    res.json("Project deleted successfully");
  } catch (error) {
    return res.status(500).json(`Failed to delete project: ${error.message}`);
  }
};

const getTeamMembersForProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate({
      path: "team",
      select: "name email",
    });

    if (!project) {
      return res
        .status(404)
        .json({ status: "error", message: "Project not found" });
    }

    const teamMembers = project.team;

    return res.status(200).json({ users: teamMembers });
  } catch (error) {
    return res.status(500).json(`Failed to get team members: ${error.message}`);
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const [project, user] = await Promise.all([
      Project.findById(id),
      User.findById(userId),
    ]);

    if (!project) {
      return res.status(404).json("Project not found");
    }

    const index = project.team.indexOf(userId);

    if (index === -1) {
      return res.status(404).json("User is not a team member of the project");
    }

    project.team.splice(index, 1);
    user.projects.pull(id);
    user.workspaces.pull(project.workspace);

    await Promise.all([project.save(), user.save()]);

    return res.status(200).json("Team member removed successfully");
  } catch (error) {
    return res
      .status(500)
      .json(`Failed to remove team member: ${error.message}`);
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const [project, user] = await Promise.all([
      Project.findById(id),
      User.findById(userId),
    ]);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const workspace = await Workspace.findById(project.workspace);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const isUserExistInWorkspace = workspace.users.some((userEntry) =>
      userEntry.user._id.equals(userId)
    );

    if (!isUserExistInWorkspace) {
      return res.status(400).json({
        error: "User is not a member of the workspace. Try to invite first.",
      });
    }

    if (project.team.includes(userId)) {
      return res.status(400).json({
        error: "User is already a team member of this project.",
      });
    }

    project.team.push(userId);
    user.projects.push(project._id);

    await Promise.all([project.save(), user.save()]);

    return res.status(200).json({ message: "Team member added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Failed to add team member: ${error.message}` });
  }
};

module.exports = {
  addTeamMember,
  createProject,
  deleteProject,
  getProjectListForUser,
  getProjectListForWorkspace,
  getProject,
  getTeamMembersForProject,
  removeTeamMember,
  updateProject,
};
