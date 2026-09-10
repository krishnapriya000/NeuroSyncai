const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  saveGameResult,
  getGameResults,
  getGameStats,
} = require("../controllers/seniorCognitiveController");

// All cognitive game routes require JWT authentication
router.use(protect);

router.get("/stats", getGameStats);

router.route("/results")
  .post(saveGameResult)
  .get(getGameResults);

module.exports = router;
