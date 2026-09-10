const mongoose = require("mongoose");

const childFaceAnalysisSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to ParentChild relationship link (handles registered student accounts and dependent profiles)
    parentChildId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParentChild",
      required: true,
    },
    // Null if this is an un-registered dependent profile
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    childName: {
      type: String,
      required: true,
    },
    expression: {
      type: String,
      required: true,
      enum: ["Happy", "Neutral", "Sad", "Angry", "Surprised", "Fearful", "Disgusted"],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index on parentChildId and analyzedAt for efficient per-child query
childFaceAnalysisSchema.index({ parentChildId: 1, analyzedAt: -1 });
childFaceAnalysisSchema.index({ parentId: 1, parentChildId: 1 });

const ChildFaceAnalysis = mongoose.model("ChildFaceAnalysis", childFaceAnalysisSchema);

module.exports = ChildFaceAnalysis;
