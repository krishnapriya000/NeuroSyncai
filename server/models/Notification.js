const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["Study", "Goals", "Wellness", "Journal", "Focus", "AI Insights", "System"],
      required: true,
      default: "System",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "FiBell",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High"],
      default: "Normal",
    },
    link: {
      type: String,
      default: "/student/dashboard",
    },
    sourceType: {
      type: String,
      default: "System",
    },
    sourceId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate notification creation for the same event
notificationSchema.index({ userId: 1, sourceType: 1, sourceId: 1, type: 1 });

const Notification = mongoose.model("Notification", notificationSchema, "notifications");

module.exports = Notification;
