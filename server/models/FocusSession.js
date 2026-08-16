const mongoose = require("mongoose");

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 25,
      required: true,
    },
    taskName: {
      type: String,
      default: "General Study & Revision",
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

focusSessionSchema.index({ userId: 1, date: 1 });

const FocusSession = mongoose.model("FocusSession", focusSessionSchema, "focusSessions");

module.exports = FocusSession;
