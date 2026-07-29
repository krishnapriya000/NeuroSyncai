const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  getCheckInStatus, 
  submitCheckIn, 
  getLatestCheckIn, 
  getStudentProfile, 
  updateStudentProfile 
} = require("../controllers/studentController");

// All routes are protected by JWT token auth
router.get("/checkin-status", protect, getCheckInStatus);
router.post("/checkin", protect, submitCheckIn);
router.get("/dailycheckin/latest", protect, getLatestCheckIn);
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);

module.exports = router;
