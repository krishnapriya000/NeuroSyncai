const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getEmergencyContact,
  saveEmergencyContact,
  deleteEmergencyContact,
  getAlertHistory,
  evaluateStudentRiskStatus,
} = require("../controllers/emergencyController");

// All emergency routes require JWT authentication
router.use(protect);

router.route("/contact")
  .get(getEmergencyContact)
  .post(saveEmergencyContact)
  .delete(deleteEmergencyContact);

router.get("/alerts", getAlertHistory);
router.post("/evaluate", evaluateStudentRiskStatus);

module.exports = router;
