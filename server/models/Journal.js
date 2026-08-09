const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

// Index to efficiently query entries by userId sorted by creation date
journalSchema.index({ userId: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", journalSchema, "journals");

module.exports = Journal;
