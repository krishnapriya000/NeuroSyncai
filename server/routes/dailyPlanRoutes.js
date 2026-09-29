const express = require("express");
const router = express.Router();
const {
  getPlanByDate,
  generatePlan,
  saveOrUpdatePlan,
  updateTask,
  completeTask,
  rescheduleTask,
  deleteTask,
  submitReflection,
  getHistoricalAnalytics,
} = require("../controllers/dailyPlanController");
const { protect } = require("../middleware/authMiddleware");

// Historical analytics (Must be before :date parameter)
router.get("/history/analytics", protect, getHistoricalAnalytics);

// AI Schedule Generation
router.post("/generate", protect, generatePlan);

// Manual Save / Update Full Plan
router.post("/", protect, saveOrUpdatePlan);

// Get Plan by Date
router.get("/:date", protect, getPlanByDate);

// Task Actions
router.put("/task/:taskId", protect, updateTask);
router.post("/task/:taskId/complete", protect, completeTask);
router.post("/task/:taskId/reschedule", protect, rescheduleTask);
router.delete("/task/:taskId", protect, deleteTask);

// End-of-Day Reflection
router.post("/:id/reflect", protect, submitReflection);

module.exports = router;
