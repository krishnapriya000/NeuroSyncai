const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getLoginLogs,
  getWellnessAnalytics,
  getTodayCheckIns,
  getAverageWellnessScore,
  getHighStressStudents,
  getWellnessTrends,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes require JWT verification and Admin role
router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/logins", getLoginLogs);

// Wellness Analytics Routes
router.get("/wellness-analytics", getWellnessAnalytics);
router.get("/today-checkins", getTodayCheckIns);
router.get("/wellness-score", getAverageWellnessScore);
router.get("/high-stress-students", getHighStressStudents);
router.get("/wellness-trends", getWellnessTrends);

module.exports = router;
