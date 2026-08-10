const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    guardianName: {
      type: String,
      required: [true, "Guardian name is required"],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, "Relationship is required"],
      trim: true,
    },
    guardianEmail: {
      type: String,
      required: [true, "Guardian email is required"],
      lowercase: true,
      trim: true,
    },
    guardianPhone: {
      type: String,
      default: "",
      trim: true,
    },
    emergencyAlertsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to query by userId quickly
emergencyContactSchema.index({ userId: 1 });

const EmergencyContact = mongoose.model("EmergencyContact", emergencyContactSchema, "emergencycontacts");

module.exports = EmergencyContact;
