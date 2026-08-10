const mongoose = require("mongoose");

const professionalCheckInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    energyLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    sleepHours: {
      type: String,
      required: true,
    },
    focusLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    workingHours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    breaksTaken: {
      type: String,
      required: true,
    },
    workLifeBalance: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    workPressure: {
      type: String,
      required: true,
    },
    workPressureScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    journal: {
      type: String,
      default: "",
    },
    // Reserved fields for future facial emotion analysis integration
    facialEmotion: {
      type: String,
      default: null,
    },
    facialEmotionConfidence: {
      type: Number,
      default: null,
    },
    facialAnalysisTimestamp: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one check-in per user per date
professionalCheckInSchema.index({ userId: 1, date: 1 }, { unique: true });

const ProfessionalCheckIn = mongoose.model(
  "ProfessionalCheckIn",
  professionalCheckInSchema,
  "professionalcheckins"
);

module.exports = ProfessionalCheckIn;
