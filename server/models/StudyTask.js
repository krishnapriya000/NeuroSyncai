const mongoose = require("mongoose");

const studyTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: [true, "Task date is required"],
    },
    startTime: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    category: {
      type: String,
      enum: ["Study", "Assignment", "Revision", "Exam Preparation", "Project", "Other"],
      default: "Study",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
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

// Compound index for querying user's tasks by date
studyTaskSchema.index({ userId: 1, date: 1 });

const StudyTask = mongoose.model("StudyTask", studyTaskSchema, "studyTasks");

module.exports = StudyTask;
