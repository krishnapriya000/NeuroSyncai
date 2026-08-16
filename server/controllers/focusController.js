const FocusSession = require("../models/FocusSession");

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// @desc    Log a completed focus timer session
// @route   POST /api/focus/session
// @access  Private (Student)
exports.logFocusSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { durationMinutes, taskName } = req.body;

    const todayStr = getTodayDateString();

    const session = await FocusSession.create({
      userId,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 25,
      taskName: taskName || "General Study & Revision",
      date: todayStr,
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Focus session logged successfully!",
      data: session,
    });
  } catch (error) {
    console.error("Log Focus Session Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log focus session: " + error.message,
    });
  }
};

// @desc    Get focus session summary for today
// @route   GET /api/focus/today
// @access  Private (Student)
exports.getTodayFocusSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayDateString();

    const todaySessions = await FocusSession.find({ userId, date: todayStr }).sort({ completedAt: -1 });

    const totalMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    return res.status(200).json({
      success: true,
      completedCount: todaySessions.length,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      sessions: todaySessions,
    });
  } catch (error) {
    console.error("Get Today Focus Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch focus summary: " + error.message,
    });
  }
};
