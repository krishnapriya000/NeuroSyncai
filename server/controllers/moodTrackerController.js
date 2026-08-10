const MoodTracker = require("../models/MoodTracker");
const { evaluateAndProcessStudentRisk } = require("../services/riskAssessmentService");

// Helper function to format current date (YYYY-MM-DD) and time (hh:mm AM/PM)
const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const formattedHours = String(hours).padStart(2, "0");
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;

  return { date: dateStr, time: timeStr };
};

/**
 * @desc    Save a new mood entry
 * @route   POST /api/moodtracker
 * @access  Private (Student)
 */
exports.createMoodEntry = async (req, res) => {
  try {
    const { mood, intensity, reason, notes } = req.body;

    if (!mood || !intensity || !reason) {
      return res.status(400).json({
        success: false,
        message: "Mood, intensity, and reason are required fields.",
      });
    }

    const { date, time } = getFormattedDateTime();

    const moodEntry = await MoodTracker.create({
      studentId: req.user._id,
      mood,
      intensity: Number(intensity),
      reason,
      notes: notes || "",
      date,
      time,
    });

    // Asynchronously trigger risk assessment evaluation
    const riskEval = await evaluateAndProcessStudentRisk(req.user._id).catch((err) => {
      console.error("Mood Risk Evaluation Error:", err);
      return null;
    });

    return res.status(201).json({
      success: true,
      message: "Mood recorded successfully!",
      data: moodEntry,
      wellbeingAssessment: riskEval
        ? {
            riskLevel: riskEval.riskLevel,
            alertSent: riskEval.alertSent,
            message: riskEval.message,
          }
        : null,
    });
  } catch (error) {
    console.error("Error creating mood entry:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save mood entry.",
    });
  }
};

/**
 * @desc    Get the logged-in student's latest mood entry
 * @route   GET /api/moodtracker/latest
 * @access  Private (Student)
 */
exports.getLatestMoodEntry = async (req, res) => {
  try {
    const latestMood = await MoodTracker.findOne({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .exec();

    if (!latestMood) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "You haven't recorded your mood today.",
      });
    }

    return res.status(200).json({
      success: true,
      data: latestMood,
    });
  } catch (error) {
    console.error("Error fetching latest mood entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest mood entry.",
    });
  }
};

/**
 * @desc    Get previous mood entries for the logged-in student (excluding the latest entry)
 * @route   GET /api/moodtracker/history
 * @access  Private (Student)
 */
exports.getMoodHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;

    // We skip 1 (for the latest entry already shown in Today's Latest Mood) + additional pages
    const skip = 1 + (page - 1) * limit;

    const totalCount = await MoodTracker.countDocuments({ studentId: req.user._id });
    const historyEntries = await MoodTracker.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Total previous entries excluding the 1 latest entry
    const previousTotal = Math.max(0, totalCount - 1);
    const loadedSoFar = (page - 1) * limit + historyEntries.length;
    const hasMore = loadedSoFar < previousTotal;

    return res.status(200).json({
      success: true,
      data: historyEntries,
      totalCount: totalCount,
      previousTotal: previousTotal,
      hasMore: hasMore,
      page: page,
    });
  } catch (error) {
    console.error("Error fetching mood history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mood history.",
    });
  }
};
