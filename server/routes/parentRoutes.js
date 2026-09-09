const express = require("express");
const router = express.Router();
const { protect, parentOnly } = require("../middleware/authMiddleware");
const {
  getParentProfile,
  updateParentProfile,
  getLinkedChildren,
  linkChildAccount,
  addDependentChild,
  unlinkChild,
  getChildDetails,
  updateChildDetails,
  getChildMoods,
} = require("../controllers/parentController");

// All parent routes require JWT auth and Parent role
router.use(protect);
router.use(parentOnly);

// Parent Profile Endpoints
router.get("/profile", getParentProfile);
router.put("/profile", updateParentProfile);

// Children & Dependents Management Endpoints
router.get("/children", getLinkedChildren);
router.post("/children/link", linkChildAccount);
router.post("/children/dependent", addDependentChild);
router.delete("/children/:id", unlinkChild);
router.get("/children/:childId", getChildDetails);
router.put("/children/:id", updateChildDetails);
router.get("/children/:childId/moods", getChildMoods);

module.exports = router;
