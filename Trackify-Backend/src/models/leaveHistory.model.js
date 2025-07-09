const mongoose = require("mongoose");

const leaveHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "approved",
        "rejected",
        "applied",
        "deleted",
        "addedByAdmin",
        "updatedByAdmin",
        "reduced",
      ],
    },
    additionalInfo: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    leaveType: {
      type: String,
    },
    leaveChangesCount: {
      type: Number,
    },
    previousLeaveCount: {
      type: Number,
    },
    newLeaveCount: {
      type: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
  },
  {
    timestamps: true,
  }
);

const LeaveHistory = mongoose.model("LeaveHistory", leaveHistorySchema);

module.exports = LeaveHistory;
