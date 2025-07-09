const mongoose = require("mongoose");

const leaveEncashmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    leaves: [
      {
        leaveType: {
          type: String,
          required: true,
        },
        available: {
          type: Number,
          required: true,
        },
        encashed: {
          type: Number,
          required: true,
        },
        remaining: {
          type: Number,
          required: true,
        },
      },
    ],
    deductionDetail: [
      {
        leaveType: {
          type: String,
          required: true,
        },
        deducted: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAvailable: {
      type: Number,
      required: true,
    },
    totalEncashable: {
      type: Number,
      required: true,
    },
    totalRemaining: {
      type: Number,
      required: true,
    },
    encashedAt: {
      type: Date,
      default: Date.now,
    },
    encashedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strictQuery: false,
  }
);

// Useful indexes for queries
leaveEncashmentSchema.index({ workspace: 1 });
leaveEncashmentSchema.index({ user: 1, workspace: 1 });

module.exports = mongoose.model(
  "LeaveEncashmentHistory",
  leaveEncashmentSchema
);
