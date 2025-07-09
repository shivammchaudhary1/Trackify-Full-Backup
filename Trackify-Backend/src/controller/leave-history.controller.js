const mongoose = require("mongoose");

const LeaveHistory = mongoose.model("LeaveHistory");

async function getAllLeaveRequests(req, res) {
  const { currentWorkspace } = req.user;

  try {
    const LeaveHistories = await LeaveHistory.find({
      workspace: currentWorkspace,
    })
      .populate({ path: "author", select: "name email" })
      .populate({ path: "user", select: "name email" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ LeaveHistories });
  } catch (error) {
    res.status(500).json({ error: "Failed to get leave history" });
  }
}

module.exports = { getAllLeaveRequests };
