const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Academic",
        "Project",
        "Skill Development",
        "Personal",
        "Health & Wellness",
        "Career",
        "Other",
      ],
      required: [true, "Category is required"],
      default: "Academic",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Priority is required"],
      default: "Medium",
    },
    startDate: {
      type: String, // Format: "YYYY-MM-DD"
      required: [true, "Start date is required"],
    },
    targetDate: {
      type: String, // Format: "YYYY-MM-DD"
      required: [true, "Target date is required"],
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's goals by target date
goalSchema.index({ userId: 1, targetDate: 1 });

const Goal = mongoose.model("Goal", goalSchema, "goals");

module.exports = Goal;
