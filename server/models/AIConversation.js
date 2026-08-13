const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
    },
    suggestedTasks: [
      {
        title: String,
        subject: String,
        duration: String,
        priority: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Medium",
        },
        category: {
          type: String,
          default: "Study",
        },
      },
    ],
    tasksAdded: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const AIConversation = mongoose.model(
  "AIConversation",
  aiConversationSchema,
  "aiConversations"
);

module.exports = AIConversation;
