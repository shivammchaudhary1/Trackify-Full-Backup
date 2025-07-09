const mongoose = require("mongoose");

const monthlyReportDataSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userIdealWorkingHours: {
    hours: Number,
    minutes: Number,
    seconds: Number,
  },
  userWorkingHour: {
    hours: Number,
    minutes: Number,
    seconds: Number,
  },
  overtime: {
    hours: Number,
    minutes: Number,
    seconds: Number,
  },
  undertime: {
    hours: Number,
    minutes: Number,
    seconds: Number,
  },
  undertimeDeductionDetails: [
    {
      leaveType: { type: String, required: true }, 
      deductedHours: { type: Number, required: true },
      deductedMinutes: { type: Number, required: true },
      deductedSeconds: { type: Number, required: true },
    },
  ],
  datesUserWorked: [Number],
  totalLeaves: Number,
  paidLeaves: Number,
  unpaidLeaves: Number,
  // leaveSummary: {
  //   totalLeaves: Number,
  //   paidLeaves: Number,
  //   unpaidLeaves: Number,
  // },
});

const monthlyReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    idealMonthlyHours: {
      totalRequiredWorkingHours: Number,
      totalRequiredWorkingDays: Number,
    },
    isOvertimeBalanceAdded: {
      type: Boolean,
    },
    report: {
      type: [monthlyReportDataSchema],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
monthlyReportSchema.index({ workspace: 1 });
monthlyReportSchema.index({ workspace: 1, month: 1, year: 1 });
// Define the model
const MonthlyReport = mongoose.model("MonthlyReport", monthlyReportSchema);

module.exports = MonthlyReport;
