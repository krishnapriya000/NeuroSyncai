const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createMoodEntry,
  getLatestMoodEntry,
  getMoodHistory,
} = require("../controllers/moodTrackerController");

// All routes are protected by JWT auth middleware
router.post("/", protect, createMoodEntry);
router.get("/latest", protect, getLatestMoodEntry);
router.get("/history", protect, getMoodHistory);

module.exports = router;
