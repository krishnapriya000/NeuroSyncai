const express = require("express");
const router = express.Router();
const { logFocusSession, getTodayFocusSummary } = require("../controllers/focusController");
const { protect } = require("../middleware/authMiddleware");

router.post("/session", protect, logFocusSession);
router.get("/today", protect, getTodayFocusSummary);

module.exports = router;
