const mongoose = require("mongoose");

const parentChildSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Null if this is an un-registered dependent profile
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // True if created directly by parent as a dependent profile (no NeuroSync login account)
    isDependentOnly: {
      type: Boolean,
      default: false,
    },
    // Stores details for un-registered dependent profiles
    dependentInfo: {
      fullName: {
        type: String,
        trim: true,
        default: "",
      },
      dob: {
        type: String,
        default: "",
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Other",
      },
      grade: {
        type: String,
        trim: true,
        default: "",
      },
    },
    relationship: {
      type: String,
      enum: ["Mother", "Father", "Guardian", "Other"],
      default: "Guardian",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "accepted",
    },
    grade: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active relationships between parent and childId (when childId exists)
parentChildSchema.index(
  { parentId: 1, childId: 1 },
  { unique: true, partialFilterExpression: { childId: { $ne: null } } }
);

// Index on parentId for quick lookups
parentChildSchema.index({ parentId: 1 });

const ParentChild = mongoose.model("ParentChild", parentChildSchema);

module.exports = ParentChild;
