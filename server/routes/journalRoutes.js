const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} = require("../controllers/journalController");

// All journal routes require JWT authentication
router.use(protect);

router.route("/")
  .post(createJournalEntry)
  .get(getJournalEntries);

router.route("/:id")
  .get(getJournalEntryById)
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

module.exports = router;
