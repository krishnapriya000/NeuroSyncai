const ProfessionalCheckIn = require("../models/ProfessionalCheckIn");
const User = require("../models/User");

// Utility to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

// Map Work Pressure string to numeric score 1-5
const mapWorkPressureToScore = (pressureStr) => {
  switch (pressureStr) {
    case "No Pressure":
      return 1;
    case "Low":
      return 2;
    case "Moderate":
      return 3;
    case "High":
      return 4;
    case "Very High":
      return 5;
    default:
      return 3;
  }
};

// @desc    Get today's Working Professional Check-in
// @route   GET /api/professional/checkin/today
// @access  Private (Working Professional)
exports.getTodayCheckIn = async (req, res) => {
  try {
    const todayStr = getTodayDateString();

    const checkIn = await ProfessionalCheckIn.findOne({
      userId: req.user._id,
      date: todayStr,
    });

    return res.status(200).json({
      success: true,
      hasSubmitted: !!checkIn,
      data: checkIn || null,
    });
  } catch (error) {
    console.error("Get Today Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's check-in: " + error.message,
    });
  }
};

// @desc    Create or update today's Working Professional Check-in
// @route   POST /api/professional/checkin
// @access  Private (Working Professional)
exports.createOrUpdateCheckIn = async (req, res) => {
  try {
    const {
      date,
      mood,
      stressLevel,
      energyLevel,
      sleepHours,
      focusLevel,
      workingHours,
      breaksTaken,
      workLifeBalance,
      workPressure,
      journal,
    } = req.body;

    const targetDate = date || getTodayDateString();

    // Validation
    if (
      !mood ||
      !stressLevel ||
      !energyLevel ||
      !sleepHours ||
      !focusLevel ||
      workingHours === undefined ||
      !breaksTaken ||
      !workLifeBalance ||
      !workPressure
    ) {
      return res.status(400).json({
        success: false,
        message: "Please answer all required check-in questions.",
      });
    }

    const pressureScore = mapWorkPressureToScore(workPressure);

    const checkInFields = {
      userId: req.user._id,
      date: targetDate,
      mood,
      stressLevel: Number(stressLevel),
      energyLevel: Number(energyLevel),
      sleepHours,
      focusLevel: Number(focusLevel),
      workingHours: Number(workingHours),
      breaksTaken,
      workLifeBalance: Number(workLifeBalance),
      workPressure,
      workPressureScore: pressureScore,
      journal: journal ? journal.trim() : "",
    };

    const checkIn = await ProfessionalCheckIn.findOneAndUpdate(
      { userId: req.user._id, date: targetDate },
      checkInFields,
      { upsert: true, new: true, runValidators: true }
    );

    // Update last check-in date on User model
    await User.findByIdAndUpdate(req.user._id, {
      lastCheckInDate: targetDate,
    });

    return res.status(200).json({
      success: true,
      message: "Check-in recorded successfully!",
      data: checkIn,
    });
  } catch (error) {
    console.error("Create Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit check-in: " + error.message,
    });
  }
};

// @desc    Update an existing check-in entry by ID
// @route   PUT /api/professional/checkin/:id
// @access  Private (Working Professional)
exports.updateCheckInById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      mood,
      stressLevel,
      energyLevel,
      sleepHours,
      focusLevel,
      workingHours,
      breaksTaken,
      workLifeBalance,
      workPressure,
      journal,
    } = req.body;

    const checkIn = await ProfessionalCheckIn.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: "Check-in record not found.",
      });
    }

    if (mood) checkIn.mood = mood;
    if (stressLevel) checkIn.stressLevel = Number(stressLevel);
    if (energyLevel) checkIn.energyLevel = Number(energyLevel);
    if (sleepHours) checkIn.sleepHours = sleepHours;
    if (focusLevel) checkIn.focusLevel = Number(focusLevel);
    if (workingHours !== undefined) checkIn.workingHours = Number(workingHours);
    if (breaksTaken) checkIn.breaksTaken = breaksTaken;
    if (workLifeBalance) checkIn.workLifeBalance = Number(workLifeBalance);
    if (workPressure) {
      checkIn.workPressure = workPressure;
      checkIn.workPressureScore = mapWorkPressureToScore(workPressure);
    }
    if (journal !== undefined) checkIn.journal = journal.trim();

    await checkIn.save();

    return res.status(200).json({
      success: true,
      message: "Check-in updated successfully!",
      data: checkIn,
    });
  } catch (error) {
    console.error("Update Check-in By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update check-in: " + error.message,
    });
  }
};

// @desc    Get check-in history for authenticated Working Professional
// @route   GET /api/professional/checkin/history
// @access  Private (Working Professional)
exports.getCheckInHistory = async (req, res) => {
  try {
    const history = await ProfessionalCheckIn.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get Check-in History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-in history: " + error.message,
    });
  }
};

// @desc    Get Work-Life Balance analytics for authenticated Working Professional
// @route   GET /api/professional/work-life-balance
// @access  Private (Working Professional)
exports.getWorkLifeBalanceAnalytics = async (req, res) => {
  try {
    const { period = "week" } = req.query;

    const now = new Date();
    let daysCount = 7;
    if (period === "month") daysCount = 30;
    if (period === "3months") daysCount = 90;

    const startDate = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toISOString().split("T")[0];

    const prevStartDate = new Date(now.getTime() - daysCount * 2 * 24 * 60 * 60 * 1000);
    const prevStartDateStr = prevStartDate.toISOString().split("T")[0];

    // Fetch check-ins for current period
    const currentCheckIns = await ProfessionalCheckIn.find({
      userId: req.user._id,
      date: { $gte: startDateStr },
    }).sort({ date: 1 });

    // Fetch check-ins for previous period (for comparison)
    const prevCheckIns = await ProfessionalCheckIn.find({
      userId: req.user._id,
      date: { $gte: prevStartDateStr, $lt: startDateStr },
    }).sort({ date: 1 });

    const totalCheckIns = currentCheckIns.length;

    if (totalCheckIns === 0) {
      return res.status(200).json({
        success: true,
        period,
        totalCheckIns: 0,
        overallScore: 0,
        previousScore: 0,
        scoreChange: 0,
        status: "No Data",
        keyStats: {
          avgWorkingHours: 0,
          totalWorkingHours: 0,
          avgStress: 0,
          avgEnergy: 0,
          avgFocus: 0,
          breakPattern: "No Data",
          breakConsistency: 0,
        },
        workHoursAnalysis: {
          avgWorkingHours: 0,
          totalWorkingHours: 0,
          longestWorkday: 0,
          extendedHoursDays: 0,
          manageableHoursDays: 0,
          workingHoursByDay: [],
        },
        stressVsWorkHours: [],
        stressCorrelationInsight: "Start tracking your work-life balance by completing your Daily Check-ins.",
        breakAnalysis: {
          breakPattern: "No Data",
          breakConsistency: 0,
          insufficientBreakDays: 0,
          breakAdvice: "Complete Daily Check-in records to analyze your break pattern.",
        },
        workVSFreeTime: {
          avgWorkHours: 0,
          avgPersonalTime: 0,
          ratioText: "No Data",
        },
        trends: [],
        weeklySummary: [],
        recentCheckIns: [],
        aiInsight: "Complete a few Daily Check-ins to generate personalized work-life balance insights.",
        recommendations: [
          "Complete your first Daily Check-in to unlock personalized work-life insights.",
        ],
      });
    }

    // Single Record Score Helper
    const calculateRecordScore = (rec) => {
      const balanceScore = (rec.workLifeBalance / 5) * 100 * 0.30;
      const stressScore = ((6 - rec.stressLevel) / 5) * 100 * 0.20;
      const energyScore = (rec.energyLevel / 5) * 100 * 0.15;

      let hrsScore = 100;
      if (rec.workingHours > 10.5) hrsScore = 40;
      else if (rec.workingHours > 9.5) hrsScore = 60;
      else if (rec.workingHours > 8.5) hrsScore = 80;
      else if (rec.workingHours < 6) hrsScore = 70;
      const hoursScoreWeighted = hrsScore * 0.15;

      let breakScore = 60;
      if (rec.breaksTaken === "Regular") breakScore = 100;
      else if (rec.breaksTaken === "Rare") breakScore = 20;
      const breakScoreWeighted = breakScore * 0.10;

      let sleepScore = 75;
      if (typeof rec.sleepHours === "string" && (rec.sleepHours.includes("7") || rec.sleepHours.includes("8"))) {
        sleepScore = 100;
      } else if (typeof rec.sleepHours === "string" && rec.sleepHours.includes("<")) {
        sleepScore = 45;
      }
      const sleepScoreWeighted = sleepScore * 0.10;

      return Math.round(balanceScore + stressScore + energyScore + hoursScoreWeighted + breakScoreWeighted + sleepScoreWeighted);
    };

    // Calculate current period metrics
    const currentScores = currentCheckIns.map(calculateRecordScore);
    const overallScore = Math.round(currentScores.reduce((a, b) => a + b, 0) / currentScores.length);

    // Calculate previous period metrics if available
    let previousScore = overallScore;
    if (prevCheckIns.length > 0) {
      const prevScores = prevCheckIns.map(calculateRecordScore);
      previousScore = Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length);
    }
    const scoreChange = overallScore - previousScore;

    // Status calculation
    let status = "Moderate Balance";
    if (overallScore >= 80) status = "Excellent Balance";
    else if (overallScore >= 65) status = "Good Balance";
    else if (overallScore >= 50) status = "Moderate Balance";
    else status = "Needs Attention";

    // Aggregates
    const totalHrs = currentCheckIns.reduce((acc, c) => acc + c.workingHours, 0);
    const avgWorkingHours = Math.round((totalHrs / totalCheckIns) * 10) / 10;
    const avgStress = Math.round((currentCheckIns.reduce((acc, c) => acc + c.stressLevel, 0) / totalCheckIns) * 10) / 10;
    const avgEnergy = Math.round((currentCheckIns.reduce((acc, c) => acc + c.energyLevel, 0) / totalCheckIns) * 10) / 10;
    const avgFocus = Math.round((currentCheckIns.reduce((acc, c) => acc + c.focusLevel, 0) / totalCheckIns) * 10) / 10;

    // Break counts & pattern
    const breakCounts = { Regular: 0, Occasional: 0, Rare: 0 };
    currentCheckIns.forEach((c) => {
      if (c.breaksTaken && breakCounts[c.breaksTaken] !== undefined) {
        breakCounts[c.breaksTaken]++;
      } else {
        breakCounts.Occasional++;
      }
    });

    let dominantBreak = "Occasional Breaks";
    if (breakCounts.Regular >= breakCounts.Occasional && breakCounts.Regular >= breakCounts.Rare) {
      dominantBreak = "Regular Breaks";
    } else if (breakCounts.Rare > breakCounts.Regular && breakCounts.Rare > breakCounts.Occasional) {
      dominantBreak = "Rare Breaks";
    }

    const breakConsistency = Math.round(((breakCounts.Regular + breakCounts.Occasional) / totalCheckIns) * 100);

    // Work Hours Analysis
    const longestWorkday = Math.max(...currentCheckIns.map((c) => c.workingHours));
    const extendedHoursDays = currentCheckIns.filter((c) => c.workingHours > 8.5).length;
    const manageableHoursDays = currentCheckIns.filter((c) => c.workingHours <= 8.5).length;

    // Daily breakdown array
    const workingHoursByDay = currentCheckIns.map((c) => {
      const dateObj = new Date(c.date);
      const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      return {
        _id: c._id,
        date: c.date,
        dayLabel: `${dayLabel} (${c.date.split("-").slice(1).join("/")})`,
        workingHours: c.workingHours,
        stressLevel: c.stressLevel,
        energyLevel: c.energyLevel,
        focusLevel: c.focusLevel,
        workLifeBalance: c.workLifeBalance,
        balanceScore: calculateRecordScore(c),
      };
    });

    // Stress vs Work Hours Correlation
    let stressCorrelationInsight = "Continue using Daily Check-in for a few more days to identify your work-stress pattern.";
    if (totalCheckIns >= 3) {
      const longDays = currentCheckIns.filter((c) => c.workingHours > 8.5);
      const normalDays = currentCheckIns.filter((c) => c.workingHours <= 8.5);

      if (longDays.length > 0 && normalDays.length > 0) {
        const avgStressLong = longDays.reduce((acc, c) => acc + c.stressLevel, 0) / longDays.length;
        const avgStressNormal = normalDays.reduce((acc, c) => acc + c.stressLevel, 0) / normalDays.length;

        if (avgStressLong > avgStressNormal + 0.3) {
          stressCorrelationInsight = "Your stress levels tend to be higher on days with longer working hours.";
        } else if (avgStressNormal > avgStressLong + 0.3) {
          stressCorrelationInsight = "Your stress levels remain manageable even on days with extended work hours.";
        } else {
          stressCorrelationInsight = "Your stress levels remain relatively consistent across your working hours.";
        }
      }
    }

    // Work vs Personal Time
    const estSleep = 7.5;
    const avgPersonalTime = Math.max(0, Math.round((24 - estSleep - avgWorkingHours) * 10) / 10);

    // AI Insight & Recommendations Engine
    let aiInsight = "Your recent check-ins indicate a balanced approach to workload and personal well-being.";
    const recommendations = [];

    if (avgWorkingHours > 9 && avgStress >= 3.5) {
      aiInsight = `Your recent check-ins show higher average work hours (${avgWorkingHours}h/day) combined with elevated stress (${avgStress}/5). Protecting rest periods can help maintain sustainable energy.`;
      recommendations.push("Set a firm end time for your workday to guard your evening recovery.");
      recommendations.push("Schedule 10-minute micro-breaks during demanding work sprints.");
    } else if (breakCounts.Rare > 1) {
      aiInsight = "Your check-ins show that breaks are taken infrequently during workdays. Regular rest intervals support cognitive focus.";
      recommendations.push("Schedule short breaks between long work tasks to replenish focus.");
      recommendations.push("Incorporate light movement or stretch sessions during lunch breaks.");
    } else if (avgEnergy < 3.0) {
      aiInsight = `Your average energy level (${avgEnergy}/5) has been lower recently. Reviewing sleep quality and workload density can boost vitality.`;
      recommendations.push("Review rest patterns and avoid extending working hours late into the evening.");
      recommendations.push("Ensure consistent hydration and scheduled nutrition pauses.");
    } else {
      aiInsight = `Your work-life balance score (${overallScore}/100) reflects steady management of productivity and personal wellness. Keep maintaining your routine!`;
      recommendations.push("Your current work routine looks balanced. Keep maintaining your current check-in habits.");
      recommendations.push("Continue scheduling regular rest breaks during intense projects.");
    }

    // Weekly Summary Statements
    const weeklySummary = [
      `You averaged ${avgWorkingHours} working hours per day.`,
      `Your average stress level was ${avgStress}/5.`,
      `Your average focus score reached ${avgFocus}/5 across ${totalCheckIns} check-in entries.`,
      `You maintained ${dominantBreak.toLowerCase()} across your check-ins.`,
    ];

    // Recent Check-ins (latest 7)
    const recentCheckIns = [...currentCheckIns].reverse().slice(0, 7);

    return res.status(200).json({
      success: true,
      period,
      totalCheckIns,
      overallScore,
      previousScore,
      scoreChange,
      status,
      keyStats: {
        avgWorkingHours,
        totalWorkingHours: totalHrs,
        avgStress,
        avgEnergy,
        avgFocus,
        breakPattern: dominantBreak,
        breakConsistency,
      },
      workHoursAnalysis: {
        avgWorkingHours,
        totalWorkingHours: totalHrs,
        longestWorkday,
        extendedHoursDays,
        manageableHoursDays,
        workingHoursByDay,
      },
      stressVsWorkHours: workingHoursByDay,
      stressCorrelationInsight,
      breakAnalysis: {
        breakPattern: dominantBreak,
        breakConsistency,
        insufficientBreakDays: breakCounts.Rare,
        breakAdvice: breakCounts.Rare > 0
          ? "Taking regular breaks helps prevent fatigue and maintains peak focus."
          : "Your break routine is consistent and supports healthy productivity.",
      },
      workVSFreeTime: {
        avgWorkHours: avgWorkingHours,
        avgPersonalTime,
        ratioText: `${avgWorkingHours}h Work vs ${avgPersonalTime}h Personal`,
      },
      trends: workingHoursByDay,
      weeklySummary,
      recentCheckIns,
      aiInsight,
      recommendations,
    });
  } catch (error) {
    console.error("Get Work-Life Balance Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to compute Work-Life Balance analytics: " + error.message,
    });
  }
};
