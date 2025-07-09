const mongoose = require("mongoose");

const userWorkspaceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isAdmin: { type: Boolean, default: false, required: true },
  _id: false,
});

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users: [userWorkspaceSchema],
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
      required: true,
    },
    isEditable: {
      type: Boolean,
      default: false,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: [],
      },
    ],
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        default: [],
      },
    ],
    theme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme",
    },
    holidays: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Holiday",
        default: [],
      },
    ],
    leaveTypes: {
      type: [
        {
          title: { type: String },
          leaveType: {
            type: String,
          },
          paid: {
            type: Boolean,
            default: true,
          },
          isActive: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [
        { title: "Casual", leaveType: "casual", paid: true, isActive: true },
        { title: "Sick", leaveType: "sick", paid: true, isActive: true },
        {
          title: "Restricted",
          leaveType: "restricted",
          paid: true,
          isActive: true,
        },
        {
          title: "Overtime",
          leaveType: "overtime",
          paid: true,
          isActive: true,
        },
        {
          title: "Leave Without Pay",
          leaveType: "leaveWithoutPay",
          paid: false,
          isActive: true,
        },
      ],
    },
    settings: {
      notification: {
        admin: {
          birthday: {
            system: { type: Boolean, default: true },
            email: { type: Boolean, default: false },
          },
        },
        user: {
          birthday: {
            system: { type: Boolean, default: false },
            email: { type: Boolean, default: false },
          },
        },
      },
    },
    rules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rule",
      },
    ],
    timeZone: {
      type: String,
      default: "Asia/Kolkata",
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

workspaceSchema.index({ _id: 1, "users.user": 1 });

module.exports = mongoose.model("Workspace", workspaceSchema);
