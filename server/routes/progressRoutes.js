const express = require("express");
const router = express.Router();
const { getStudentProgressAnalytics } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getStudentProgressAnalytics);

module.exports = router;
