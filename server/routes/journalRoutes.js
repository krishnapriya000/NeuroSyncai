const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalAnalysis,
  analyzeJournalEntry,
  getJournalInsights,
  getWeeklyJournalReflection,
} = require("../controllers/journalController");

// All journal routes require JWT authentication
router.use(protect);

// Journal Insights & Summary Routes
router.get("/insights", getJournalInsights);
router.get("/weekly-reflection", getWeeklyJournalReflection);

// Main Journal CRUD
router.route("/")
  .post(createJournalEntry)
  .get(getJournalEntries);

// Single Journal AI Analysis Routes
router.get("/:id/analysis", getJournalAnalysis);
router.post("/:id/analyze", analyzeJournalEntry);

// Single Journal Entry Operations
router.route("/:id")
  .get(getJournalEntryById)
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

module.exports = router;
