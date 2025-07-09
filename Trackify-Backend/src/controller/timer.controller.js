const mongoose = require("mongoose");
const { calculateDuration } = require("../config/lib/timeCalculator.js");
const dayjs = require("dayjs");

const Entry = mongoose.model("Entry");
const Timer = mongoose.model("Timer");
const User = mongoose.model("User");
const Workspace = mongoose.model("Workspace");
const Project = mongoose.model("Project");

/**
 * Starts a new timer for the user in the current workspace.
 *
 * @param {Object} req - Express request object containing user and timer details.
 * @param {Object} res - Express response object for sending responses.
 *
 * @description This function checks if a timer is already running for the user.
 * If not, it creates a new entry with the current time as the start time, associates it with the
 * specified project and workspace, and updates the timer status to running.
 *
 */
async function startTimer(req, res) {
  const { projectId, title } = req.body;

  const workspaceId = req.user.currentWorkspace;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(projectId)) {
    return res.status(400).json({ message: "Please select project" });
  }

  try {
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspaceId,
    })
      .select("team isCompleted")
      .lean();

    if (!project) {
      return res
        .status(400)
        .json({ message: "Something went wrong. Please refresh the page." });
    }
    if (project.isCompleted) {
      return res
        .status(400)
        .json({ message: "This project is completed. You cannot work on it." });
    }

    if (!project.team.map((id) => id.toString()).includes(userId.toString())) {
      return res
        .status(400)
        .json({ message: "You are not assigned to this project team" });
    }

    const existingTimer = await Timer.findOne({
      user: userId,
      isRunning: true,
    })
      .select("_id")
      .lean();
    if (existingTimer) {
      return res.status(400).json({ message: "Timer is already running." });
    }
    const newEntry = new Entry({
      startTime: new Date().toISOString(),
      workspace: workspaceId,
      project: projectId,
      title: title,
      user: userId,
    });

    await newEntry.save();

    await Promise.all([
      Timer.updateOne(
        { user: userId, isRunning: false },
        {
          $set: {
            isRunning: true,
            currentLog: newEntry._id,
          },
        }
      ),
    ]);

    const entryForUI = await Entry.findOne({
      _id: newEntry._id,
      user: userId,
      workspace: workspaceId,
    })
      .populate({
        path: "project",
        select: "name, description",
      })
      .lean();

    res.status(201).json({
      isRunning: true,
      newEntry: entryForUI,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Failed to start timer: ${error.message}` });
  }
}

/**
 * Stops the running timer and saves the entry in the database.
 */
async function stopTimer(req, res) {
  const { projectId, title } = req.body;
  const { _id: userId, currentWorkspace: workspaceId } = req.user;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  } else if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Please select project" });
  }

  try {
    const runningTimer = await Timer.findOne({
      user: userId,
      isRunning: true,
    })
      .populate({
        path: "currentLog",
        select: "startTime endTime durationInSeconds",
      })
      .lean();

    if (!runningTimer) {
      return res.status(400).json({ message: "Timer is not running" });
    }

    const stopTime = new Date().toISOString();
    const entryUpdates = {
      title: title,
      durationInSeconds: calculateDuration(
        runningTimer.currentLog.startTime,
        stopTime
      ),
      endTime: stopTime,
    };

    const timerUpdate = {
      isRunning: false,
      currentLog: null,
    };

    const [updatedTimer, updatedEntry] = await Promise.all([
      Timer.findOneAndUpdate(
        { _id: runningTimer._id, user: userId, isRunning: true },
        timerUpdate,
        {
          new: true,
        }
      )
        .select("isRunning currentLog")
        .lean(),
      Entry.findOneAndUpdate(
        {
          _id: runningTimer.currentLog._id,
          user: userId,
          workspace: workspaceId,
        },
        entryUpdates,
        {
          new: true,
        }
      )
        .populate({
          path: "project",
          select: "name description",
        })
        .lean(),
    ]);

    return res.json({ updatedTimer, updatedEntry });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to stop timerId: ${error.message}` });
  }
}

/**
 * Resumes an existing timer
 */
async function resumeTimer(req, res) {
  try {
    const userId = req.user._id;
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).send({ message: "Entry id is required" });
    }
    // const { timer } = await User.findOne({ _id: userId });
    const usersTimer = await Timer.findOne({
      user: userId,
      isRunning: false,
    });

    if (!usersTimer) {
      return res.status(400).json({ message: "Timer is already running." });
    }

    const [updatedEntry, _] = await Promise.all([
      Entry.findOneAndUpdate(
        { _id: entryId },
        {
          $set: { startTime: new Date().toISOString() },
        },
        { new: true }
      )
        .populate({
          path: "project",
          select: "name, description",
        })
        .lean(),
      Timer.updateOne(
        { _id: usersTimer._id, user: userId, isRunning: false },
        {
          isRunning: true,
          currentLog: entryId,
        },
        { new: true }
      ),
    ]);

    return res.status(200).send({ updatedEntry });
  } catch (error) {
    return res.status(500).send("Failed to resume timer: " + error.message);
  }
}

const pauseTimer = async (req, res) => {
  const userId = req.user._id;

  try {
    const { timer } = await User.findOne({ _id: userId });
    const runningTimer = await Timer.findOne({ _id: timer, isRunning: true });

    if (!runningTimer) {
      return res.status(400).send("No running timer found.");
    }

    const { currentLog } = runningTimer;
    const previousEntry = await Entry.findOne({ _id: currentLog });

    const startTime = new Date(previousEntry.startTime);
    const pauseTime = new Date();

    const timeDifferenceMillis = pauseTime - startTime;
    const timeDifferenceInSeconds = Math.floor(timeDifferenceMillis / 1000);

    let currentDuration = previousEntry.durationInSeconds || 0;
    const newDurationInSeconds = currentDuration + timeDifferenceInSeconds;

    const entryUpdatePromise = Entry.findOneAndUpdate(
      { _id: currentLog },
      { durationInSeconds: parseInt(newDurationInSeconds) },
      { new: true }
    );

    const timerUpdatePromise = Timer.findOneAndUpdate(
      { _id: timer },
      {
        isRunning: false,
      },
      { new: true }
    );

    await Promise.all([entryUpdatePromise, timerUpdatePromise]);

    res.status(200).json({ message: "Pause Successfully" });
  } catch (error) {
    console.error("Error pausing timer:", error);
    return res.status(500).send("Failed to pause timer.");
  }
};

// manual entry
const newManualEntry = async (req, res) => {
  try {
    const { newEntry } = req.body;

    if (!newEntry) {
      return res.status(400).json({ error: "New entry data is missing." });
    }

    const startDateTime = new Date(newEntry.startTime);
    const endDateTime = new Date(newEntry.endTime);

    if (
      isNaN(startDateTime) ||
      isNaN(endDateTime) ||
      endDateTime <= startDateTime
    ) {
      return res
        .status(400)
        .json({ error: "Invalid date format in startTime or endTime." });
    }

    const overlappingEntry = await Entry.findOne({
      // Same user
      user: req.user._id,
      $and: [
        // Overlapping time range
        {
          startTime: { $lte: new Date(newEntry.endTime) },
          endTime: { $gte: new Date(newEntry.startTime) },
        },
      ],
    }).lean();

    if (overlappingEntry) {
      return res.status(400).json({
        message:
          "Entry cannot be updated as it overlaps with another entry's time range, " +
          "Overlapping entry: " +
          overlappingEntry.title,
      });
    }

    const durationInSeconds = Math.floor((endDateTime - startDateTime) / 1000);
    if (durationInSeconds < 0) {
      return res
        .status(400)
        .json({ error: "Negative durationInSeconds not allowed." });
    }

    const newManualEntry = new Entry({
      startTime: newEntry.startTime,
      endTime: newEntry.endTime,
      workspace: req.user.currentWorkspace,
      project: newEntry.projectId,
      title: newEntry.title,
      user: newEntry.userId,
      durationInSeconds,
    });

    await newManualEntry.save();

    const entry = await Entry.findOne({
      _id: newManualEntry._id,
      user: req.user._id,
    }).populate("project");

    return res
      .status(200)
      .json({ message: "Entry created successfully", entry: entry });
  } catch (error) {
    return res.status(500).json({
      error: `An error occurred while creating the entry: ${error.message}`,
    });
  }
};

async function fetchEntries(req, res) {
  const { lastFetchedDate } = req.params;
  const user = req.user;

  const todayISO = new Date(lastFetchedDate);
  const date2 = new Date(lastFetchedDate);
  date2.setDate(date2.getDate() - 7);

  try {
    const entries = await Entry.find({
      user: user._id,
      workspace: user.currentWorkspace,
      startTime: { $gte: date2, $lte: todayISO },
    })
      .populate({ path: "project", select: "name description" })
      .lean();

    return res.json({
      entries,
      lastFetchedDate: date2.toISOString(),
      reFetchRequired: entries.length ? true : false,
    });
  } catch (error) {
    return res.status(500).json({
      error: `An error occurred while creating the entry: ${error.message}`,
    });
  }
}

async function markEntryAsBillableNonBillable(req, res) {
  const { entryId } = req.params;

  if (!mongoose.isValidObjectId(entryId)) {
    return res.status(400).json({ message: "Invalid Request" });
  }

  const { isBillable } = req.body;
  const user = req.user;

  if (!entryId) {
    return res.status(400).json({ message: "Entry ID is required" });
  }

  try {
    const updatedEntry = await Entry.findOneAndUpdate(
      { _id: entryId, user: user._id, workspace: user.currentWorkspace },
      { isBillable: isBillable },
      { new: true }
    )
      .populate({ path: "project", select: "name description" })
      .lean();
    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    return res.status(200).json({
      message: "Entry updated successfully",
      entry: updatedEntry,
    });
  } catch (error) {
    return res.status(500).json({
      error: `An error occurred while updating the entry: ${error.message}`,
    });
  }
}

async function markEntryAsBulkIsBillableNonBillable(req, res) {
  try {
    const { markAsBillable, markAsNonBillable, workspaceId } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const workspace = await Workspace.findById(workspaceId).select("timeZone");
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const timeZone = workspace.timeZone;

    // Calculate start and end of day in workspace's timezone
    const startOfDay = dayjs().tz(timeZone).startOf("day").toDate();
    const endOfDay = dayjs().tz(timeZone).endOf("day").toDate();

    // Build query dynamically
    const query = {
      user: userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      workspace: workspaceId,
    };

    let isBillable;

    if (markAsBillable) {
      isBillable = true;
    } else if (markAsNonBillable) {
      isBillable = false;
    } else {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Perform update
    await Entry.updateMany(query, {
      $set: { isBillable },
    });

    // Fetch all updated entries
    const updatedEntries = await Entry.find(query).sort({ startTime: 1 });

    res.status(200).json({
      updatedEntries,
    });
  } catch (error) {
    return res.status(500).json({
      error: `An error occurred while updating the entry: ${error.message}`,
    });
  }
}

module.exports = {
  fetchEntries,
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
  newManualEntry,
  markEntryAsBillableNonBillable,
  markEntryAsBulkIsBillableNonBillable,
};
