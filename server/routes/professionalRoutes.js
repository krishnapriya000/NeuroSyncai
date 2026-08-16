const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getProfessionalProfile,
  updateProfessionalProfile,
} = require("../controllers/professionalController");
const {
  getTodayCheckIn,
  createOrUpdateCheckIn,
  updateCheckInById,
  getCheckInHistory,
  getWorkLifeBalanceAnalytics,
} = require("../controllers/professionalCheckInController");

// Profile Routes
router.get("/profile", protect, getProfessionalProfile);
router.put("/profile", protect, updateProfessionalProfile);

// Daily Check-in Routes
router.get("/checkin/today", protect, getTodayCheckIn);
router.get("/checkin/history", protect, getCheckInHistory);
router.post("/checkin", protect, createOrUpdateCheckIn);
router.put("/checkin/:id", protect, updateCheckInById);

// Work-Life Balance Analytics Route
router.get("/work-life-balance", protect, getWorkLifeBalanceAnalytics);

module.exports = router;
