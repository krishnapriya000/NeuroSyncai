const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guardianEmail: {
      type: String,
      required: true,
      trim: true,
    },
    riskLevel: {
      type: String,
      enum: ["LOW_RISK", "MODERATE_RISK", "HIGH_RISK"],
      required: true,
    },
    triggerReason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SENT", "FAILED", "COOLDOWN_SKIPPED", "ALERTS_DISABLED"],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index to query alerts by userId and timestamp efficiently
emergencyAlertSchema.index({ userId: 1, createdAt: -1 });

const EmergencyAlert = mongoose.model("EmergencyAlert", emergencyAlertSchema, "emergencyalerts");

module.exports = EmergencyAlert;
