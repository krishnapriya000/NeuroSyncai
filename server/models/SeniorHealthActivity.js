const mongoose = require("mongoose");

const seniorHealthActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    steps: {
      type: Number,
      default: 0,
    },
    sleepHours: {
      type: Number,
      default: 0,
    },
    waterGlasses: {
      type: Number,
      default: 0,
    },
    energyLevel: {
      type: String,
      enum: ["Low", "Moderate", "Good"],
      default: "Good",
    },
    vitals: {
      bpSystolic: { type: Number, default: null },
      bpDiastolic: { type: Number, default: null },
      heartRate: { type: Number, default: null },
      bloodSugar: { type: Number, default: null },
    },
    notes: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SeniorHealthActivity", seniorHealthActivitySchema);
