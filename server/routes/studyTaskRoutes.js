const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createStudyTask,
  getStudyTasks,
  getStudyTaskById,
  updateStudyTask,
  deleteStudyTask,
  toggleTaskStatus,
  getStudyTaskSummary,
} = require("../controllers/studyTaskController");

// All study task routes require JWT authentication
router.use(protect);

// Summary & Aggregations
router.get("/summary", getStudyTaskSummary);

// CRUD routes
router.route("/")
  .post(createStudyTask)
  .get(getStudyTasks);

router.route("/:id")
  .get(getStudyTaskById)
  .put(updateStudyTask)
  .delete(deleteStudyTask);

// Quick status toggle route
router.patch("/:id/status", toggleTaskStatus);

module.exports = router;
