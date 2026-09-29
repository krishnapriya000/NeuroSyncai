const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral", "Positive", "Negative", "Neutral"],
      default: "neutral",
    },
    moodScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    stressLevel: {
      type: String,
      default: "low",
    },
    energyLevel: {
      type: String,
      default: "medium",
    },
    emotions: {
      happy: { type: Number, default: 0 },
      calm: { type: Number, default: 0 },
      tired: { type: Number, default: 0 },
      stressed: { type: Number, default: 0 },
    },
    summary: {
      type: String,
      default: "",
    },
    keyThemes: {
      type: [String],
      default: [],
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Journal title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Journal content is required"],
      trim: true,
    },
    mood: {
      type: String,
      default: "",
    },
    analysis: {
      type: analysisSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index to efficiently query entries by userId sorted by creation date
journalSchema.index({ userId: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", journalSchema, "journals");

module.exports = Journal;

