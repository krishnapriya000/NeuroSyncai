const mongoose = require("mongoose");

const moodTrackerSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      required: [true, "Mood is required"],
      enum: [
        "Very Happy",
        "Happy",
        "Neutral",
        "Sad",
        "Stressed",
        "Angry",
        "Tired",
        "Anxious",
      ],
    },
    intensity: {
      type: Number,
      required: [true, "Mood intensity is required"],
      min: 1,
      max: 10,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      enum: [
        "Studies",
        "Exams",
        "Assignments",
        "Friends",
        "Family",
        "Health",
        "Financial",
        "Relationship",
        "Other",
      ],
    },
    notes: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to query mood entries by studentId and date efficiently
moodTrackerSchema.index({ studentId: 1, createdAt: -1 });

const MoodTracker = mongoose.model("MoodTracker", moodTrackerSchema, "moodtracker");

module.exports = MoodTracker;
