const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  saveSeniorMood,
  getSeniorMoodHistory,
  saveDailyCheckIn,
  getDailyCheckInHistory,
  saveHealthActivity,
  getHealthActivityHistory,
  addMedication,
  getMedications,
  updateMedication,
  deleteMedication,
  logMedicationStatus,
  addFamilyContact,
  getFamilyContacts,
  updateFamilyContact,
  deleteFamilyContact,
  triggerSOS,
  getSeniorProgressData,
} = require("../controllers/seniorController");

// Require JWT authentication for all senior routes
router.use(protect);

// Mood & Wellbeing Routes
router.route("/mood")
  .post(saveSeniorMood)
  .get(getSeniorMoodHistory);

// Daily Check-in Routes
router.route("/daily-checkin")
  .post(saveDailyCheckIn)
  .get(getDailyCheckInHistory);

// Health & Activity Routes
router.route("/health-activity")
  .post(saveHealthActivity)
  .get(getHealthActivityHistory);

// Medication Routes
router.route("/medications")
  .post(addMedication)
  .get(getMedications);

router.route("/medications/:id")
  .put(updateMedication)
  .delete(deleteMedication);

router.post("/medications/:id/log", logMedicationStatus);

// Family Contacts Routes
router.route("/family-contacts")
  .post(addFamilyContact)
  .get(getFamilyContacts);

router.route("/family-contacts/:id")
  .put(updateFamilyContact)
  .delete(deleteFamilyContact);

// SOS Alert Route
router.post("/sos", triggerSOS);

// Progress & Insights Route
router.get("/progress", getSeniorProgressData);

module.exports = router;
