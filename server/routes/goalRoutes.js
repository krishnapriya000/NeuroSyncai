const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalSummary,
} = require("../controllers/goalController");

// All goal routes require JWT authentication
router.use(protect);

// Summary & Aggregations
router.get("/summary", getGoalSummary);

// CRUD routes
router.route("/")
  .post(createGoal)
  .get(getGoals);

router.route("/:id")
  .get(getGoalById)
  .put(updateGoal)
  .delete(deleteGoal);

// Dedicated progress update route
router.patch("/:id/progress", updateGoalProgress);

module.exports = router;
