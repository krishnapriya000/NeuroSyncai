const mongoose = require("mongoose");

const seniorCognitiveGameResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameType: {
      type: String,
      required: [true, "Game type is required"],
      enum: ["Memory Match", "Attention Challenge", "Number Sequence"],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: 0,
      max: 100,
    },
    accuracy: {
      type: Number,
      required: [true, "Accuracy percentage is required"],
      min: 0,
      max: 100,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    incorrectAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    timeTaken: {
      type: String,
      required: [true, "Time taken is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index to efficiently query games by userId sorted by playedAt date
seniorCognitiveGameResultSchema.index({ userId: 1, playedAt: -1 });

const SeniorCognitiveGameResult = mongoose.model(
  "SeniorCognitiveGameResult",
  seniorCognitiveGameResultSchema,
  "seniorcognitivegameresults"
);

module.exports = SeniorCognitiveGameResult;
