const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema(
  {
    isRunning: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entry",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

timerSchema.index({ user: 1 });
timerSchema.index({ _id: 1, user: 1, isRunning: 1 });
timerSchema.index({ user: 1, isRunning: 1 }); 

module.exports = mongoose.model("Timer", timerSchema);
