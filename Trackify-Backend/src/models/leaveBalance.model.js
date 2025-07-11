const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
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
    leaveBalance: [
      {
        title: { type: String, required: true },
        type: {
          type: String,
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
        consumed: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    strictQuery: false,
  }
);

leaveBalanceSchema.index({ workspace: 1 });
leaveBalanceSchema.index({ user: 1, workspace: 1 });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
