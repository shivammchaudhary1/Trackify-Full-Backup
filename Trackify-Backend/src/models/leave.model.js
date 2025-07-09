const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    dailyDetails: [
      {
        _id: false,
        day: {
          type: Date,
          required: true,
        },
        duration: {
          type: String,
          enum: ["halfday", "fullday"],
          default: "fullday",
        },
      },
    ],
    // TODO: Remove this logic once we have history to track
    pendingData: {
      type: Object,
      default: {},
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    leaveBalance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveBalance",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

leaveSchema.index({ user: 1 });
leaveSchema.index({ user: 1, workspace: 1 });
leaveSchema.index({ dailyDetails: 1, status: 1, user: 1, workspace: 1 });
leaveSchema.index({
  endDate: 1,
  status: 1,
  startDate: 1,
  user: 1,
  workspace: 1,
});

leaveSchema.index({ workspace: 1 });
leaveSchema.index({ workspace: 1, status: 1 });
leaveSchema.index({ workspace: 1, createdAt: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
