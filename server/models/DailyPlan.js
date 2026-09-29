const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  startTime: {
    type: String, // Format "HH:MM" e.g. "09:00"
    default: "",
  },
  endTime: {
    type: String, // Format "HH:MM" e.g. "10:00"
    default: "",
  },
  duration: {
    type: Number, // Duration in minutes
    default: 30,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  type: {
    type: String,
    enum: ["study", "work", "break", "exercise", "personal", "meal", "other"],
    default: "other",
  },
  reason: {
    type: String,
    default: "",
  },
  breakAfter: {
    type: Boolean,
    default: false,
  },
  reminderOption: {
    type: String,
    enum: ["at_start", "5_min_before", "15_min_before", "ai_smart", "none"],
    default: "ai_smart",
  },
  reminderTime: {
    type: String,
    default: "",
  },
  reminderMessage: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "rescheduled"],
    default: "pending",
  },
  completedAt: {
    type: Date,
    default: null,
  },
  rescheduledFrom: {
    type: String,
    default: "",
  },
  postponedCount: {
    type: Number,
    default: 0,
  },
  aiGenerated: {
    type: Boolean,
    default: true,
  },
  userModified: {
    type: Boolean,
    default: false,
  },
});

const fixedCommitmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const dailyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: true,
      index: true,
    },
    wakeUpTime: {
      type: String,
      default: "07:00",
    },
    sleepTime: {
      type: String,
      default: "23:00",
    },
    energyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    fixedCommitments: [fixedCommitmentSchema],
    tasks: [taskSchema],
    daySummary: {
      type: String,
      default: "",
    },
    aiGuidance: {
      type: String,
      default: "",
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    reflection: {
      userNotes: { type: String, default: "" },
      whatWentWell: { type: String, default: "" },
      whatCouldBeImproved: { type: String, default: "" },
      tomorrowSuggestion: { type: String, default: "" },
      reflectedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique plan per user per date
dailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyPlan = mongoose.model("DailyPlan", dailyPlanSchema, "dailyPlans");

module.exports = DailyPlan;
