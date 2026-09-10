const mongoose = require("mongoose");

const parentCheckInSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Null if this is an un-registered dependent profile
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Reference to ParentChild relationship link
    parentChildId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParentChild",
      required: true,
    },
    // Normalized calendar date string (YYYY-MM-DD)
    date: {
      type: String,
      required: true,
    },
    childName: {
      type: String,
      default: "",
    },
    // Question 1: How is your child feeling today?
    mood: {
      type: String,
      required: [true, "Mood is required"],
      enum: ["Happy", "Calm", "Neutral", "Stressed", "Sad", "Irritated"],
    },
    // Question 2: How was your child's energy today?
    energy: {
      type: String,
      required: [true, "Energy level is required"],
      enum: ["High", "Normal", "Low"],
    },
    // Question 3: How was interaction with family/friends today?
    socialInteraction: {
      type: String,
      required: [true, "Social interaction rating is required"],
      enum: ["Positive", "Normal", "Difficult"],
    },
    // Question 4: Did you notice anything unusual in behavior?
    unusualBehavior: {
      type: Boolean,
      required: true,
      default: false,
    },
    unusualBehaviorNote: {
      type: String,
      default: "",
    },
    // Question 5: Overall wellbeing rating (1 to 5)
    wellbeingScore: {
      type: Number,
      required: [true, "Wellbeing score is required"],
      min: 1,
      max: 5,
    },
    // Question 6: Additional notes (Optional)
    additionalNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate check-in for the same child on the same calendar day
parentCheckInSchema.index(
  { parentId: 1, parentChildId: 1, date: 1 },
  { unique: true }
);

// Index on parentId and date for fast queries
parentCheckInSchema.index({ parentId: 1, date: 1 });

const ParentCheckIn = mongoose.model("ParentCheckIn", parentCheckInSchema);

module.exports = ParentCheckIn;
