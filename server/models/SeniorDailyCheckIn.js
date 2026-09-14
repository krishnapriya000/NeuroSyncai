const mongoose = require("mongoose");

const seniorDailyCheckInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feeling: {
      type: String,
      required: true,
      trim: true,
    },
    sleepQuality: {
      type: String,
      required: true,
      trim: true,
    },
    activityLevel: {
      type: String,
      required: true,
      trim: true,
    },
    energyLevel: {
      type: String,
      required: true,
      trim: true,
    },
    routineCompleted: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
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

module.exports = mongoose.model("SeniorDailyCheckIn", seniorDailyCheckInSchema);
