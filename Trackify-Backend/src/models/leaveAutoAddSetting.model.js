const mongoose = require("mongoose");

// function isValidDate(value) {
//   const regex = /^\d{4}-\d{2}-\d{2}$/;
//   if (!regex.test(value)) return false;

//   return true;
// }

const leaveAutoAddSettingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  isExecuted: {
    type: Boolean,
    default: false,
  },
  numberOfLeaves: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  frequency: {
    type: String,
    enum: ["month", "quarter", "halfYear", "year"],
  },
  lastExecutionDate: {
    type: Date,
  },
  nextExecutionDate: {
    type: Date,
  },
  recurrence: {
    type: String,
    default: "once",
    enum: ["once", "repeat"],
  },
  executionHistory: {
    type: [Date],
    default: [],
  },
  date: {
    type: Number,
    // validate: {
    //   validator: isValidDate,
    //   message:
    //     "Please enter a valid date in the format YYYY-MM-DD, between 1900-01-01 and today.",
    // },
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const LeaveAutoAddSetting =
  mongoose.models.LeaveAutoAddSetting ||
  mongoose.model("LeaveAutoAddSetting", leaveAutoAddSettingSchema);

module.exports = LeaveAutoAddSetting;
