const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "default",
    },
    workingHours: {
      type: Number,
      required: true,
      default: 8,
      min: 1,
    },
    workingDays: {
      type: Number,
      required: true,
      default: 5,
    },
    weekDays: {
      type: [String],
      required: true,
      default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    isOvertime: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

RuleSchema.index({ workspace: 1 });

module.exports = mongoose.model("Rule", RuleSchema);
