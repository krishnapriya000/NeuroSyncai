const mongoose = require("mongoose");

const journalAnalysisSchema = new mongoose.Schema(
  {
    journalEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    emotion: {
      type: String,
      required: [true, "Emotion is required"],
      trim: true,
    },
    sentiment: {
      type: String,
      required: [true, "Sentiment is required"],
      trim: true,
    },
    themes: {
      type: [String],
      default: [],
    },
    reflection: {
      type: String,
      required: [true, "Reflection is required"],
      trim: true,
    },
    suggestion: {
      type: String,
      required: [true, "Suggestion is required"],
      trim: true,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user analyses ordered by analysis date
journalAnalysisSchema.index({ userId: 1, analyzedAt: -1 });

const JournalAnalysis = mongoose.model(
  "JournalAnalysis",
  journalAnalysisSchema,
  "journalanalyses"
);

module.exports = JournalAnalysis;
