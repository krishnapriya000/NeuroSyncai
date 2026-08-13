const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  chatWithAI,
  getConversationHistory,
  clearConversationHistory,
  getStudentInsights,
  confirmStudyPlan,
} = require("../controllers/aiController");

// All AI companion endpoints require authentication
router.post("/chat", protect, chatWithAI);
router.get("/chat/history", protect, getConversationHistory);
router.delete("/chat/history", protect, clearConversationHistory);
router.get("/insights", protect, getStudentInsights);
router.post("/study-plan/confirm", protect, confirmStudyPlan);

module.exports = router;
