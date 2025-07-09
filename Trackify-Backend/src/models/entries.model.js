const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    startTime: { type: Date },
    endTime: { type: Date },
    title: {
      type: String,
    },
    durationInSeconds: {
      type: Number,
    },
    isBillable: {
      type: Boolean,
      default: false,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

entrySchema.index({ workspace: 1 });
entrySchema.index({ user: 1, startTime: 1 });
entrySchema.index({ user: 1, startTime: 1, endTime: 1 });
entrySchema.index({ _id: 1, workspace: 1, user: 1 });
entrySchema.index({ _id: 1, startTime: 1 });
entrySchema.index({ workspace: 1, user: 1, createdAt: 1 });

module.exports = mongoose.model("Entry", entrySchema);
