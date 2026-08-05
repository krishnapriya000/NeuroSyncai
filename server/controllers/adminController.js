const User = require("../models/User");
const Login = require("../models/Login");
const DailyCheckIn = require("../models/DailyCheckIn");

// @desc    Get Admin Dashboard statistics & metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "Admin" });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalLogins = await Login.countDocuments();
    const recentLogins = await Login.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // Breakdown by roles
    const roleStatsRaw = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const roleBreakdown = {};
    roleStatsRaw.forEach((item) => {
      if (item._id) {
        roleBreakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        verifiedUsers,
        totalLogins,
        recentLogins24h: recentLogins,
        roleBreakdown,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats: " + error.message,
    });
  }
};

// @desc    Get all users with search, role filter, pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users: " + error.message,
    });
  }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const allowedRoles = ["Admin", "Parent", "User", "Student", "Working Professional", "Senior Citizen"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.email} role updated to ${role}.`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin Update Role Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update role: " + error.message,
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: `User ${user.email} deleted successfully.`,
    });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user: " + error.message,
    });
  }
};

// @desc    Get login history logs
// @route   GET /api/admin/logins
// @access  Private/Admin
exports.getLoginLogs = async (req, res) => {
  try {
    const logs = await Login.find()
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Admin Login Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch login logs: " + error.message,
    });
  }
};

// --- Helper Functions for Wellness Analytics ---
function computeWellnessScore(checkIn) {
  if (!checkIn) return 0;

  // Mood Score (max 25)
  let moodScore = 15;
  const m = String(checkIn.feeling || checkIn.mood || "").toLowerCase();
  if (m.includes("very happy")) moodScore = 25;
  else if (m.includes("happy")) moodScore = 20;
  else if (m.includes("neutral")) moodScore = 15;
  else if (m.includes("stressed")) moodScore = 8;
  else if (m.includes("sad")) moodScore = 5;

  // Sleep Score (max 25)
  let sleepScore = 15;
  const s = String(checkIn.sleepHours || "").toLowerCase();
  if (s.includes("more than 8") || s.includes("> 8") || s.includes(">8")) sleepScore = 25;
  else if (s.includes("6–8") || s.includes("6-8")) sleepScore = 20;
  else if (s.includes("4–6") || s.includes("4-6")) sleepScore = 12;
  else if (s.includes("less than 4") || s.includes("< 4") || s.includes("<4")) sleepScore = 5;

  // Stress Score (max 25)
  let stressScore = 15;
  const strVal = Number(checkIn.stressLevel);
  if (!isNaN(strVal)) {
    if (strVal >= 1 && strVal <= 3) stressScore = 25;
    else if (strVal >= 4 && strVal <= 6) stressScore = 15;
    else if (strVal >= 7 && strVal <= 10) stressScore = 5;
  }

  // Motivation Score (max 25)
  let motScore = 15;
  const motVal = Number(checkIn.motivationLevel);
  if (!isNaN(motVal)) {
    if (motVal >= 8 && motVal <= 10) motScore = 25;
    else if (motVal >= 5 && motVal <= 7) motScore = 15;
    else if (motVal >= 1 && motVal <= 4) motScore = 5;
  }

  return moodScore + sleepScore + stressScore + motScore;
}

function getWellnessStatus(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Moderate";
  return "Needs Attention";
}

// @desc    Get comprehensive Student Wellness Analytics
// @route   GET /api/admin/wellness-analytics
// @access  Private/Admin
exports.getWellnessAnalytics = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // Total registered students
    const totalStudents = await User.countDocuments({ role: "Student" });

    // Fetch all check-ins with populated student user details
    const allCheckIns = await DailyCheckIn.find()
      .populate("studentId", "fullName email role")
      .sort({ createdAt: -1 });

    // Filter today's check-ins
    const todaysCheckInsCount = allCheckIns.filter(c => 
      c.date === todayStr || (c.createdAt && c.createdAt.toISOString().split("T")[0] === todayStr)
    ).length;

    // Group check-ins per student
    const studentCheckInsMap = {};
    allCheckIns.forEach(c => {
      if (!c.studentId) return;
      const sId = c.studentId._id ? c.studentId._id.toString() : c.studentId.toString();
      if (!studentCheckInsMap[sId]) {
        studentCheckInsMap[sId] = [];
      }
      studentCheckInsMap[sId].push(c);
    });

    const studentWellnessList = [];
    const studentsNeedingAttentionMap = {};
    let totalScoreSum = 0;
    let totalScoredCount = 0;
    let highStressCount = 0;
    let lowWellnessCount = 0;

    const moodDistribution = {
      "Very Happy": 0,
      "Happy": 0,
      "Neutral": 0,
      "Stressed": 0,
      "Sad": 0,
    };

    const stressDistribution = {
      "Low (1-3)": 0,
      "Moderate (4-6)": 0,
      "High (7-10)": 0,
    };

    const scoreDistribution = {
      "Excellent (80-100%)": 0,
      "Good (60-79%)": 0,
      "Moderate (40-59%)": 0,
      "Needs Attention (<40%)": 0,
    };

    // Analyze latest check-in for each student
    for (const sId in studentCheckInsMap) {
      const history = studentCheckInsMap[sId];
      const latest = history[0];
      const studentUser = latest.studentId;

      const score = computeWellnessScore(latest);
      const status = getWellnessStatus(score);
      const stress = Number(latest.stressLevel) || 5;

      totalScoreSum += score;
      totalScoredCount++;

      if (stress >= 7) highStressCount++;
      if (score < 40) lowWellnessCount++;

      // Mood Breakdown
      const moodRaw = String(latest.feeling || "").toLowerCase();
      if (moodRaw.includes("very happy")) moodDistribution["Very Happy"]++;
      else if (moodRaw.includes("happy")) moodDistribution["Happy"]++;
      else if (moodRaw.includes("neutral")) moodDistribution["Neutral"]++;
      else if (moodRaw.includes("stressed")) moodDistribution["Stressed"]++;
      else if (moodRaw.includes("sad")) moodDistribution["Sad"]++;
      else moodDistribution["Neutral"]++;

      // Stress Breakdown
      if (stress >= 1 && stress <= 3) stressDistribution["Low (1-3)"]++;
      else if (stress >= 4 && stress <= 6) stressDistribution["Moderate (4-6)"]++;
      else stressDistribution["High (7-10)"]++;

      // Score Breakdown
      if (score >= 80) scoreDistribution["Excellent (80-100%)"]++;
      else if (score >= 60) scoreDistribution["Good (60-79%)"]++;
      else if (score >= 40) scoreDistribution["Moderate (40-59%)"]++;
      else scoreDistribution["Needs Attention (<40%)"]++;

      studentWellnessList.push({
        id: latest._id,
        studentId: studentUser?._id || sId,
        fullName: studentUser?.fullName || "Student User",
        email: studentUser?.email || "N/A",
        mood: latest.feeling || "Neutral",
        wellnessScore: score,
        stressLevel: stress,
        energyLevel: latest.energyLevel || "Moderate",
        checkInDate: latest.date || (latest.createdAt ? latest.createdAt.toISOString().split("T")[0] : todayStr),
        status,
      });

      // Alert logic: Needs Attention
      const alertReasons = [];
      if (score < 40) alertReasons.push("Low Wellness Score (<40%)");
      if (stress >= 8) alertReasons.push("High Stress Level (≥8)");

      let consecutiveBad = 0;
      for (const hItem of history) {
        const feel = String(hItem.feeling || "").toLowerCase();
        if (feel.includes("sad") || feel.includes("stressed") || Number(hItem.stressLevel) >= 8) {
          consecutiveBad++;
        } else {
          break;
        }
      }

      if (consecutiveBad >= 2 && !alertReasons.some(r => r.includes("High Stress"))) {
        alertReasons.push(`Stressed/Sad for ${consecutiveBad} consecutive check-ins`);
      }

      if (alertReasons.length > 0) {
        studentsNeedingAttentionMap[sId] = {
          studentId: studentUser?._id || sId,
          fullName: studentUser?.fullName || "Student User",
          email: studentUser?.email || "N/A",
          wellnessScore: score,
          stressLevel: stress,
          mood: latest.feeling || "Neutral",
          checkInDate: latest.date || (latest.createdAt ? latest.createdAt.toISOString().split("T")[0] : todayStr),
          reasons: alertReasons,
        };
      }
    }

    const avgWellnessScore = totalScoredCount > 0 ? Math.round(totalScoreSum / totalScoredCount) : 0;
    const studentsNeedingAttention = Object.values(studentsNeedingAttentionMap);

    // 7-day trend
    const dailyTrendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      dailyTrendMap[dateKey] = 0;
    }

    allCheckIns.forEach(c => {
      const dateKey = c.date || (c.createdAt ? c.createdAt.toISOString().split("T")[0] : null);
      if (dateKey && dailyTrendMap[dateKey] !== undefined) {
        dailyTrendMap[dateKey]++;
      }
    });

    const dailyTrend = Object.keys(dailyTrendMap).map(d => ({
      date: d,
      count: dailyTrendMap[d],
    }));

    res.status(200).json({
      success: true,
      analytics: {
        totalStudents,
        todaysCheckIns: todaysCheckInsCount,
        avgWellnessScore,
        highStressStudents: highStressCount,
        lowWellnessStudents: lowWellnessCount,
        moodDistribution,
        stressDistribution,
        scoreDistribution,
        dailyTrend,
        studentsNeedingAttention,
        studentWellnessList,
      },
    });
  } catch (error) {
    console.error("Wellness Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wellness analytics: " + error.message,
    });
  }
};

// @desc    Get today's check-ins
// @route   GET /api/admin/today-checkins
// @access  Private/Admin
exports.getTodayCheckIns = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const checkIns = await DailyCheckIn.find({ date: todayStr })
      .populate("studentId", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: checkIns.length,
      checkIns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get average wellness score
// @route   GET /api/admin/wellness-score
// @access  Private/Admin
exports.getAverageWellnessScore = async (req, res) => {
  try {
    const checkIns = await DailyCheckIn.find();
    let totalScore = 0;
    checkIns.forEach(c => {
      totalScore += computeWellnessScore(c);
    });

    const averageScore = checkIns.length > 0 ? Math.round(totalScore / checkIns.length) : 0;

    res.status(200).json({
      success: true,
      averageScore,
      totalCheckIns: checkIns.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get high-stress students
// @route   GET /api/admin/high-stress-students
// @access  Private/Admin
exports.getHighStressStudents = async (req, res) => {
  try {
    const highStressCheckIns = await DailyCheckIn.find({ stressLevel: { $gte: 7 } })
      .populate("studentId", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: highStressCheckIns.length,
      students: highStressCheckIns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get wellness trends
// @route   GET /api/admin/wellness-trends
// @access  Private/Admin
exports.getWellnessTrends = async (req, res) => {
  try {
    const checkIns = await DailyCheckIn.find().sort({ createdAt: -1 }).limit(100);
    const trendMap = {};

    checkIns.forEach(c => {
      const d = c.date || (c.createdAt ? c.createdAt.toISOString().split("T")[0] : "Unknown");
      if (!trendMap[d]) trendMap[d] = { count: 0, scoreSum: 0 };
      trendMap[d].count += 1;
      trendMap[d].scoreSum += computeWellnessScore(c);
    });

    const trends = Object.keys(trendMap).map(d => ({
      date: d,
      checkInsCount: trendMap[d].count,
      avgScore: Math.round(trendMap[d].scoreSum / trendMap[d].count),
    }));

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
