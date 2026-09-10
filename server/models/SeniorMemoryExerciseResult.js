const mongoose = require("mongoose");

const seniorMemoryExerciseResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    exerciseType: {
      type: String,
      required: [true, "Exercise type is required"],
      enum: ["Remember the Sequence", "Picture Recall", "Word Recall"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
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
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index to efficiently query memory exercises by userId sorted by completedAt date
seniorMemoryExerciseResultSchema.index({ userId: 1, completedAt: -1 });

const SeniorMemoryExerciseResult = mongoose.model(
  "SeniorMemoryExerciseResult",
  seniorMemoryExerciseResultSchema,
  "seniormemoryexerciseresults"
);

module.exports = SeniorMemoryExerciseResult;
