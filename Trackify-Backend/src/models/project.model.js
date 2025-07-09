const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
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
    estimatedHours: {
      type: String,
    },
    timeSpend: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

projectSchema.index({ _id: 1, workspace: 1 });
projectSchema.index({ workspace: 1, client: 1 });
projectSchema.index({ workspace: 1, team: 1 });
module.exports = mongoose.model("Project", projectSchema);
