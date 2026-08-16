const Notification = require("../models/Notification");
const { generateStudentNotifications } = require("../services/notificationGeneratorService");

// @desc    Get all notifications for logged-in student (with category/unread filters)
// @route   GET /api/notifications
// @access  Private (Student)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Run dynamic event scanner first
    await generateStudentNotifications(userId).catch((err) =>
      console.error("Generator execution error:", err)
    );

    const { category, filter, page = 1, limit = 20 } = req.query;

    const query = { userId };

    if (category && category !== "All" && category.trim() !== "") {
      if (category === "Unread") {
        query.isRead = false;
      } else {
        query.category = category.trim();
      }
    }

    if (filter === "Unread") {
      query.isRead = false;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      totalCount,
      unreadCount,
      page: parseInt(page, 10),
      data: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications: " + error.message,
    });
  }
};

// @desc    Get unread notification count for logged-in student (for sidebar badge)
// @route   GET /api/notifications/unread-count
// @access  Private (Student)
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get Unread Count Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count.",
    });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Student)
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized.",
      });
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      unreadCount,
      data: notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification: " + error.message,
    });
  }
};

// @desc    Mark all unread notifications as read for logged-in student
// @route   PATCH /api/notifications/read-all
// @access  Private (Student)
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read.",
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private (Student)
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized.",
      });
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
      unreadCount,
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};
