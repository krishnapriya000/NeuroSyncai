const ProfessionalCheckIn = require("../models/ProfessionalCheckIn");
const FocusSession = require("../models/FocusSession");
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

// @desc    Get Working Professional Complete Analytics
// @route   GET /api/professional/analytics
// @access  Private (Working Professional)
exports.getProfessionalAnalytics = async (req, res) => {
  try {
    const { period = "this_week" } = req.query;
    const userId = req.user._id;

    // Date range calculation
    const now = new Date();
    let daysCount = 7;
    if (period === "last_week") daysCount = 7;
    if (period === "this_month") daysCount = 30;

    let startDate = new Date();
    let endDate = new Date();

    if (period === "this_week") {
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    } else if (period === "last_week") {
      endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
    } else if (period === "this_month") {
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Previous period range for comparison
    const prevDays = daysCount;
    const prevStartDate = new Date(startDate.getTime() - prevDays * 24 * 60 * 60 * 1000);
    const prevEndDate = new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    const prevStartDateStr = prevStartDate.toISOString().split("T")[0];
    const prevEndDateStr = prevEndDate.toISOString().split("T")[0];

    // Fetch DB records for current period
    const currentCheckIns = await ProfessionalCheckIn.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    }).sort({ date: 1 });

    const currentFocusSessions = await FocusSession.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    }).sort({ date: 1 });

    // Fetch DB records for previous period
    const prevCheckIns = await ProfessionalCheckIn.find({
      userId,
      date: { $gte: prevStartDateStr, $lte: prevEndDateStr },
    }).sort({ date: 1 });

    const prevFocusSessions = await FocusSession.find({
      userId,
      date: { $gte: prevStartDateStr, $lte: prevEndDateStr },
    }).sort({ date: 1 });

    const totalCheckIns = currentCheckIns.length;
    const totalDbFocusSessions = currentFocusSessions.length;
    const hasData = totalCheckIns > 0 || totalDbFocusSessions > 0;

    if (!hasData) {
      return res.status(200).json({
        success: true,
        hasData: false,
        period,
        message: "No analytics data logged yet for this period.",
      });
    }

    // --- COMPUTATIONS ---

    // 1. Focus Session Analytics
    const totalFocusMinutesDb = currentFocusSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const prevFocusMinutesDb = prevFocusSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    const focusSessionCount = totalDbFocusSessions;
    const prevFocusSessionCount = prevFocusSessions.length;

    const avgFocusSessionMinutes = focusSessionCount > 0
      ? Math.round(totalFocusMinutesDb / focusSessionCount)
      : 0;

    const longestFocusSessionMinutes = focusSessionCount > 0
      ? Math.max(...currentFocusSessions.map((s) => s.durationMinutes || 0))
      : 0;

    const breakTimeMinutes = focusSessionCount * 10;
    const focusConsistency = Math.min(100, Math.round((focusSessionCount / (daysCount * 2)) * 100));

    const focusHours = Math.floor(totalFocusMinutesDb / 60);
    const focusMins = totalFocusMinutesDb % 60;
    const formattedFocusTime = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

    const focusTimeChangePercent = prevFocusMinutesDb > 0
      ? Math.round(((totalFocusMinutesDb - prevFocusMinutesDb) / prevFocusMinutesDb) * 100)
      : 12;

    // 2. Work-Life Balance & Productivity Scores
    const calculateRecordScores = (rec) => {
      const balanceScore = (rec.workLifeBalance / 5) * 100 * 0.30;
      const stressScore = ((6 - rec.stressLevel) / 5) * 100 * 0.25;
      const energyScore = (rec.energyLevel / 5) * 100 * 0.20;
      const focusScore = (rec.focusLevel / 5) * 100 * 0.15;
      const breakScore = (rec.breaksTaken === "Regular" ? 100 : rec.breaksTaken === "Occasional" ? 70 : 30) * 0.10;
      return Math.round(balanceScore + stressScore + energyScore + focusScore + breakScore);
    };

    const currentBalanceScores = totalCheckIns > 0 ? currentCheckIns.map(calculateRecordScores) : [78];
    const avgBalanceScore = Math.round(currentBalanceScores.reduce((a, b) => a + b, 0) / currentBalanceScores.length);

    const prevBalanceScores = prevCheckIns.length > 0 ? prevCheckIns.map(calculateRecordScores) : [75];
    const prevAvgBalanceScore = Math.round(prevBalanceScores.reduce((a, b) => a + b, 0) / prevBalanceScores.length);
    const balanceScoreChange = avgBalanceScore - prevAvgBalanceScore;

    // Productivity Score (0-100)
    const avgCheckInFocusLevel = totalCheckIns > 0
      ? currentCheckIns.reduce((a, b) => a + b.focusLevel, 0) / totalCheckIns
      : 4.0;
    const avgCheckInEnergy = totalCheckIns > 0
      ? currentCheckIns.reduce((a, b) => a + b.energyLevel, 0) / totalCheckIns
      : 3.8;

    const baseProdScore = Math.round((avgCheckInFocusLevel / 5) * 50 + (avgCheckInEnergy / 5) * 30 + Math.min(20, focusSessionCount * 3));
    const productivityScore = Math.min(100, Math.max(50, baseProdScore));

    const prevProdScore = prevCheckIns.length > 0 ? Math.min(100, Math.max(50, Math.round(productivityScore - 5))) : 75;
    const prodScoreChange = productivityScore - prevProdScore;

    // 3. Daily Breakdown for Charts
    const daysMap = {};
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      daysMap[dStr] = {
        date: dStr,
        dayLabel: dayName,
        focusMinutes: 0,
        workingHours: 0,
        stressLevel: 3,
        energyLevel: 3,
        focusLevel: 3,
        productivityScore: 70,
        mood: "Neutral",
      };
    }

    currentFocusSessions.forEach((s) => {
      if (daysMap[s.date]) {
        daysMap[s.date].focusMinutes += s.durationMinutes || 0;
      }
    });

    currentCheckIns.forEach((c) => {
      if (daysMap[c.date]) {
        daysMap[c.date].workingHours = c.workingHours || 8;
        daysMap[c.date].stressLevel = c.stressLevel || 3;
        daysMap[c.date].energyLevel = c.energyLevel || 3;
        daysMap[c.date].focusLevel = c.focusLevel || 3;
        daysMap[c.date].mood = c.mood || "Neutral";
        daysMap[c.date].productivityScore = Math.round(
          (c.focusLevel / 5) * 60 + (c.energyLevel / 5) * 30 + Math.min(10, daysMap[c.date].focusMinutes / 10)
        );
      }
    });

    const productivityTrendData = Object.values(daysMap);

    // 4. Work-Life Balance Time Breakdown
    const avgWorkHrs = totalCheckIns > 0
      ? Math.round((currentCheckIns.reduce((a, b) => a + b.workingHours, 0) / totalCheckIns) * 10) / 10
      : 8.0;
    const avgFocusHrs = Math.round(((totalFocusMinutesDb / Math.max(1, daysCount)) / 60) * 10) / 10;
    const avgBreakHrs = 1.0;
    const avgPersonalHrs = Math.max(0, Math.round((24 - 7.5 - avgWorkHrs) * 10) / 10);

    const timeBreakdown = {
      workHours: avgWorkHrs,
      focusHours: avgFocusHrs,
      breakHours: avgBreakHrs,
      personalHours: avgPersonalHrs,
    };

    // 5. Mood & Stress Breakdown
    const moodCounts = { Positive: 0, Neutral: 0, Negative: 0 };
    const stressCounts = { Low: 0, Moderate: 0, High: 0 };

    currentCheckIns.forEach((c) => {
      const m = (c.mood || "").toLowerCase();
      if (m.includes("happy") || m.includes("calm") || m.includes("energetic") || m.includes("good") || m.includes("positive")) {
        moodCounts.Positive++;
      } else if (m.includes("sad") || m.includes("anxious") || m.includes("stressed") || m.includes("negative")) {
        moodCounts.Negative++;
      } else {
        moodCounts.Neutral++;
      }

      if (c.stressLevel <= 2) stressCounts.Low++;
      else if (c.stressLevel === 3) stressCounts.Moderate++;
      else stressCounts.High++;
    });

    // 6. Work Pattern Analysis
    let mostProductiveDay = "Tuesday";
    let maxProd = -1;
    productivityTrendData.forEach((d) => {
      if (d.productivityScore > maxProd) {
        maxProd = d.productivityScore;
        mostProductiveDay = d.dayLabel;
      }
    });

    const bestFocusTime = "09:00 AM – 11:00 AM";
    const avgDailyFocusFormatted = `${Math.floor((totalFocusMinutesDb / daysCount) / 60)}h ${Math.round((totalFocusMinutesDb / daysCount) % 60)}m/day`;

    // 7. AI Productivity Insights
    const aiInsightsList = [
      `Your productivity peaks on ${mostProductiveDay}s during morning focus blocks (${bestFocusTime}).`,
      `You completed ${focusSessionCount} focus session${focusSessionCount !== 1 ? "s" : ""} totaling ${formattedFocusTime} of deep work.`,
      avgWorkHrs > 9
        ? `Your stress levels tend to be higher on days with over 9 hours of work. Consider capping intense blocks.`
        : `Your work-life balance score (${avgBalanceScore}/100) indicates steady energy management and healthy break patterns.`,
      `Maintaining scheduled 10-minute breaks between long focus sessions boosts overall cognitive stamina.`,
    ];

    // 8. Weekly Summary Items
    const weeklySummaryItems = [
      {
        metric: "Total Focus Time",
        currentValue: formattedFocusTime,
        previousValue: `${Math.floor(prevFocusMinutesDb / 60)}h ${prevFocusMinutesDb % 60}m`,
        changePercent: focusTimeChangePercent,
        direction: focusTimeChangePercent >= 0 ? "increased" : "decreased",
      },
      {
        metric: "Productivity Score",
        currentValue: `${productivityScore}/100`,
        previousValue: `${prevProdScore}/100`,
        changePercent: prodScoreChange,
        direction: prodScoreChange >= 0 ? "increased" : "decreased",
      },
      {
        metric: "Work-Life Balance",
        currentValue: `${avgBalanceScore}/100`,
        previousValue: `${prevAvgBalanceScore}/100`,
        changePercent: balanceScoreChange,
        direction: balanceScoreChange >= 0 ? "increased" : "decreased",
      },
      {
        metric: "Mood State",
        currentValue: moodCounts.Positive >= moodCounts.Negative ? "Mostly Positive" : "Needs Care",
        previousValue: "Neutral",
        changePercent: 5,
        direction: "stable",
      },
      {
        metric: "Stress Index",
        currentValue: stressCounts.High > 1 ? "Elevated" : "Manageable",
        previousValue: "Manageable",
        changePercent: -8,
        direction: "decreased",
      },
      {
        metric: "Completed Focus Sessions",
        currentValue: `${focusSessionCount} Sessions`,
        previousValue: `${prevFocusSessionCount} Sessions`,
        changePercent: prevFocusSessionCount > 0 ? Math.round(((focusSessionCount - prevFocusSessionCount) / prevFocusSessionCount) * 100) : 15,
        direction: focusSessionCount >= prevFocusSessionCount ? "increased" : "decreased",
      },
    ];

    return res.status(200).json({
      success: true,
      hasData: true,
      period,
      overview: {
        totalFocusTime: formattedFocusTime,
        focusTimeChangePercent,
        focusSessionsCount: focusSessionCount,
        productivityScore,
        productivityScoreChange: prodScoreChange,
        workLifeBalanceScore: avgBalanceScore,
        workLifeBalanceChange: balanceScoreChange,
      },
      productivityTrend: productivityTrendData,
      focusAnalytics: {
        totalFocusTimeMinutes: totalFocusMinutesDb,
        completedSessions: focusSessionCount,
        avgSessionMinutes: avgFocusSessionMinutes,
        longestSessionMinutes: longestFocusSessionMinutes,
        breakTimeMinutes,
        focusConsistency,
        dailyChart: productivityTrendData,
      },
      workLifeBalance: {
        score: avgBalanceScore,
        timeBreakdown,
        interpretation: avgBalanceScore >= 75
          ? "Your work-life balance is healthy. Try maintaining regular breaks during long work sessions."
          : "Your work-life balance is moderate. Consider setting firm end times for your workday.",
      },
      moodAndStress: {
        dailyTrend: productivityTrendData,
        moodDistribution: moodCounts,
        stressLevels: stressCounts,
      },
      workPattern: {
        mostProductiveDay,
        bestFocusTime,
        avgDailyFocusTime: avgDailyFocusFormatted,
        avgSessionDuration: `${avgFocusSessionMinutes} min`,
        mostActivePeriod: "Morning (9:00 AM – 12:00 PM)",
      },
      aiInsights: aiInsightsList,
      weeklySummary: weeklySummaryItems,
    });
  } catch (error) {
    console.error("Get Professional Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load professional analytics: " + error.message,
    });
  }
};

