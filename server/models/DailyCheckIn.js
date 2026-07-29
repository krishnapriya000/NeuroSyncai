const mongoose = require("mongoose");

const dailyCheckInSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: true,
    },
    feeling: {
      type: String,
      required: true,
    },
    sleepHours: {
      type: String,
      required: true,
    },
    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    motivationLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    biggestChallenge: {
      type: String,
      required: true,
    },
    energyLevel: {
      type: String,
      required: true,
    },
    mainGoal: {
      type: String,
      required: true,
    },
    talkToAI: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure fast querying by studentId and date
dailyCheckInSchema.index({ studentId: 1, date: 1 });

const DailyCheckIn = mongoose.model("DailyCheckIn", dailyCheckInSchema);

module.exports = DailyCheckIn;
