const express = require("express");
const router = express.Router();
const {
  saveGameResult,
  getUserGameResults,
  getGameResultsByType,
} = require("../controllers/gameController");
const { protect } = require("../middleware/authMiddleware");

// Routes protected with student authentication middleware
router.post("/results", protect, saveGameResult);
router.get("/results", protect, getUserGameResults);
router.get("/results/:gameType", protect, getGameResultsByType);

module.exports = router;
