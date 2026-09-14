const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadNotificationCount,
  createMedicationNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadNotificationCount);
router.post("/medication-reminder", protect, createMedicationNotification);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
