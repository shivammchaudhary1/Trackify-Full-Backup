const mongoose = require("mongoose");
const { comparePassword } = require("../config/lib/bcryptjs.js");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      selected: false,
    },
    timer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timer",
    },
    roles: { type: Map, of: [String], default: {} },
    isDemoDone: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      min: "1900-01-01",
      max: () => Date.now(),
    },
    profilePic: {
      type: String,
      default: null,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    permanentAddress:{
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    panDetails: {
      number: {
        type: String,
        uppercase: true,
        trim: true,
      },
      documentUrl: String,
    },
    aadharDetails: {
      number: {
        type: String,
        trim: true,
      },
      documentUrl: String,
    },
    resume: {
      type: String,
    },
    leaveBalance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LeaveBalance",
      },
    ],
    // status: {
    //   type: String,
    //   enum: ["active", "inactive", "deleted"],
    //   default: "active",
    //   required: true,
    // },
    statuses: {
      type: Map,
      of: {
        type: String,
        enum: ["deleted", "active", "inactive"],
      },
      default: {},
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        default: [],
      },
    ],
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
    leaves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Leave",
        default: [],
      },
    ],
    workspaceThemes: { type: Map, of: String, default: {} },


    assets: {
      primaryAsset: {
        name: String,
        serialNumber: String,
      },
      secondaryAssets: [
        {
          name: String,
          serialNumber: String,
          assignedDate: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },

  {
    timestamps: true,
    versionKey: false,
    strictQuery: false,
  }
);

userSchema.index({ email: 1, status: 1 });
userSchema.index({ email: 1, status: 1, currentWorkspace: 1 });
userSchema.index({ email: 1, status: 1, workspaces: 1 });

userSchema.methods.authenticate = async function authenticate(password) {
  return comparePassword(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
