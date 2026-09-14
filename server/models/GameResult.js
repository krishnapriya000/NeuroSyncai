const mongoose = require("mongoose");

const gameResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameType: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["cognitive", "memory"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: 0, // in seconds
    },
    pointsEarned: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("GameResult", gameResultSchema);
