const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  saveExerciseResult,
  getExerciseResults,
  getMemoryStats,
} = require("../controllers/seniorMemoryController");

// All memory exercise routes require JWT authentication
router.use(protect);

router.get("/stats", getMemoryStats);

router.route("/results")
  .post(saveExerciseResult)
  .get(getExerciseResults);

module.exports = router;
