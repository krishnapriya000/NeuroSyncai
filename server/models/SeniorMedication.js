const mongoose = require("mongoose");

const seniorMedicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      default: "1 Tablet",
      trim: true,
    },
    time: {
      type: String,
      required: true, // e.g. "08:00 AM"
      trim: true,
    },
    frequency: {
      type: String,
      default: "Daily",
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    logs: [
      {
        date: { type: String, required: true }, // YYYY-MM-DD
        time: { type: String },
        status: { type: String, enum: ["taken", "missed"], required: true },
        loggedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SeniorMedication", seniorMedicationSchema);
