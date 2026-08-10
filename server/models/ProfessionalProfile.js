const mongoose = require("mongoose");

const professionalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Section 1: Personal Info
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    dob: {
      type: String,
      default: "",
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },
    // Section 2: Professional Info
    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    industry: {
      type: String,
      default: "",
      trim: true,
    },
    workType: {
      type: String,
      enum: ["Office", "Remote", "Hybrid"],
      default: "Office",
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    workingHours: {
      type: String,
      default: "9:00 AM - 5:00 PM",
      trim: true,
    },
    workingDays: {
      type: String,
      default: "Monday - Friday",
      trim: true,
    },
    // Section 3: Wellness Preferences
    avgSleepHours: {
      type: Number,
      default: 7.5,
    },
    dailyFocusGoal: {
      type: String,
      default: "5 Hours",
      trim: true,
    },
    preferredBreakDuration: {
      type: String,
      default: "15 Minutes",
      trim: true,
    },
    wellnessGoal: {
      type: String,
      enum: [
        "Reduce Stress",
        "Improve Sleep",
        "Improve Focus",
        "Maintain Work-Life Balance",
        "Prevent Burnout",
      ],
      default: "Maintain Work-Life Balance",
    },
    // Section 4: Emergency / Support Contact
    contactName: {
      type: String,
      default: "",
      trim: true,
    },
    relationship: {
      type: String,
      default: "",
      trim: true,
    },
    emergencyPhone: {
      type: String,
      default: "",
      trim: true,
    },
    emergencyEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

professionalProfileSchema.index({ userId: 1 });

const ProfessionalProfile = mongoose.model(
  "ProfessionalProfile",
  professionalProfileSchema,
  "professionalprofiles"
);

module.exports = ProfessionalProfile;
