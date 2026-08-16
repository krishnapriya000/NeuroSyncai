const DailyCheckIn = require("../models/DailyCheckIn");
const MoodTracker = require("../models/MoodTracker");
const Journal = require("../models/Journal");
const StudyTask = require("../models/StudyTask");
const Goal = require("../models/Goal");
const FocusSession = require("../models/FocusSession");
const { getUserContext } = require("../services/aiService");

// Helper to convert Date to YYYY-MM-DD string
const formatDateStr = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Numeric mapping for mood visualization and calculation
const mapMoodToScore = (moodStr) => {
  if (!moodStr) return 3;
  const m = moodStr.trim().toLowerCase();
  if (m.includes("very happy")) return 5;
  if (m.includes("happy") || m.includes("great") || m.includes("calm") || m.includes("energetic")) return 4;
  if (m.includes("neutral") || m.includes("okay")) return 3;
  if (m.includes("sad") || m.includes("tired")) return 2;
  if (m.includes("stressed") || m.includes("angry") || m.includes("anxious") || m.includes("overwhelmed")) return 1;
  return 3;
};

// Helper for consecutive day streak calculation
const calculateJournalStreak = (journals) => {
  if (!journals || journals.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dates = [...new Set(journals.map((j) => formatDateStr(j.createdAt)))].sort((a, b) => (a < b ? 1 : -1));
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const todayStr = formatDateStr(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterdayDate);

  let currentStreak = 0;
  let checkIndexDate = new Date();

  // If latest entry is today or yesterday, count streak
  if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
    let curr = dates.includes(todayStr) ? new Date() : yesterdayDate;
    while (true) {
      const dStr = formatDateStr(curr);
      if (dates.includes(dStr)) {
        currentStreak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const d1 = new Date(dates[i]);
    const d2 = new Date(dates[i + 1]);
    const diffTime = Math.abs(d1 - d2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 1;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  return { currentStreak, longestStreak };
};

// Calculate metrics for a given time window [startDate, endDate]
const computePeriodMetrics = async (userId, startDate, endDate, daysCount) => {
  const startDateStr = formatDateStr(startDate);
  const endDateStr = formatDateStr(endDate);

  // 1. Study Tasks
  const studyTasks = await StudyTask.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();

  const totalStudyTasks = studyTasks.length;
  const completedStudyTasks = studyTasks.filter((t) => t.status === "completed").length;
  const pendingStudyTasks = studyTasks.filter((t) => t.status === "pending").length;

  const todayStr = formatDateStr(new Date());
  const overdueStudyTasks = studyTasks.filter(
    (t) => t.status === "pending" && t.date && t.date < todayStr
  ).length;

  const studyCompletionRate = totalStudyTasks > 0 ? Math.round((completedStudyTasks / totalStudyTasks) * 100) : 0;

  // 2. Goals
  const allGoals = await Goal.find({
    userId,
    createdAt: { $lte: endDate },
  }).lean();

  const totalGoals = allGoals.length;
  const completedGoals = allGoals.filter((g) => g.status === "completed").length;
  const activeGoals = allGoals.filter((g) => g.status === "active");
  const activeGoalsCount = activeGoals.length;

  let goalProgressSum = 0;
  if (totalGoals > 0) {
    const sumActive = activeGoals.reduce((acc, g) => acc + (g.progress || 0), 0);
    const sumCompleted = completedGoals * 100;
    goalProgressSum = Math.round((sumActive + sumCompleted) / totalGoals);
  }

  // 3. Focus Sessions
  const focusSessions = await FocusSession.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();

  const focusSessionCount = focusSessions.length;
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalFocusHours = parseFloat((totalFocusMinutes / 60).toFixed(1));
  const avgFocusDuration = focusSessionCount > 0 ? Math.round(totalFocusMinutes / focusSessionCount) : 0;
  const longestFocusSession = focusSessions.reduce((max, s) => Math.max(max, s.durationMinutes || 0), 0);

  // Target focus rate (aiming for 1.5 hours per day)
  const targetFocusHours = Math.max(1, daysCount * 1.5);
  const focusScore = Math.min(100, Math.round((totalFocusHours / targetFocusHours) * 100));

  // 4. Mood & Wellness
  const moodEntries = await MoodTracker.find({
    studentId: userId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();

  const moodCount = moodEntries.length;
  let avgMoodScore = 0;
  let moodDistribution = { "Very Happy": 0, Happy: 0, Neutral: 0, Sad: 0, Stressed: 0, Angry: 0, Tired: 0, Anxious: 0 };
  let moodCountsMap = {};

  if (moodCount > 0) {
    let sum = 0;
    moodEntries.forEach((m) => {
      const score = mapMoodToScore(m.mood);
      sum += score;
      if (moodDistribution[m.mood] !== undefined) {
        moodDistribution[m.mood]++;
      }
      moodCountsMap[m.mood] = (moodCountsMap[m.mood] || 0) + 1;
    });
    avgMoodScore = parseFloat((sum / moodCount).toFixed(1));
  }

  // Find most frequent mood
  let mostFrequentMood = "None";
  let maxMoodCount = 0;
  Object.keys(moodCountsMap).forEach((m) => {
    if (moodCountsMap[m] > maxMoodCount) {
      maxMoodCount = moodCountsMap[m];
      mostFrequentMood = m;
    }
  });

  const distinctMoodDays = new Set(moodEntries.map((m) => formatDateStr(m.createdAt))).size;
  const moodConsistencyScore = Math.round((distinctMoodDays / Math.max(1, daysCount)) * 100);
  const normalizedMoodScore = avgMoodScore > 0 ? Math.round((avgMoodScore / 5) * 100) : 0;
  const wellnessScore = Math.round(normalizedMoodScore * 0.7 + moodConsistencyScore * 0.3);

  // 5. Journaling
  const journalEntries = await Journal.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();

  const totalJournalEntries = journalEntries.length;
  const distinctJournalDays = new Set(journalEntries.map((j) => formatDateStr(j.createdAt))).size;
  const journalScore = Math.min(100, Math.round((distinctJournalDays / Math.max(1, daysCount * 0.5)) * 100));

  // 6. Daily Check-in
  const checkIns = await DailyCheckIn.find({
    studentId: userId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();

  const distinctCheckInDays = new Set(checkIns.map((c) => formatDateStr(c.createdAt))).size;
  const checkInScore = Math.min(100, Math.round((distinctCheckInDays / Math.max(1, daysCount)) * 100));

  // Weighted Overall Score Calculation
  // Study: 30%, Goals: 20%, Focus: 20%, Mood/Wellness: 15%, Journal: 10%, Check-in: 5%
  const hasAnyActivity = totalStudyTasks > 0 || totalGoals > 0 || focusSessionCount > 0 || moodCount > 0 || totalJournalEntries > 0 || checkIns.length > 0;

  const overallScore = hasAnyActivity
    ? Math.min(
        100,
        Math.round(
          studyCompletionRate * 0.30 +
            goalProgressSum * 0.20 +
            focusScore * 0.20 +
            wellnessScore * 0.15 +
            journalScore * 0.10 +
            checkInScore * 0.05
        )
      )
    : 0;

  return {
    overallScore,
    hasAnyActivity,
    study: {
      total: totalStudyTasks,
      completed: completedStudyTasks,
      pending: pendingStudyTasks,
      overdue: overdueStudyTasks,
      completionRate: studyCompletionRate,
    },
    goals: {
      total: totalGoals,
      completed: completedGoals,
      active: activeGoalsCount,
      overallProgress: goalProgressSum,
      activeGoalsList: activeGoals.slice(0, 5).map((g) => ({
        id: g._id,
        title: g.title,
        category: g.category,
        progress: g.progress || 0,
        targetDate: g.targetDate,
      })),
    },
    focus: {
      totalHours: totalFocusHours,
      totalMinutes: totalFocusMinutes,
      sessionCount: focusSessionCount,
      avgDuration: avgFocusDuration,
      longestSession: longestFocusSession,
    },
    mood: {
      avgScore: avgMoodScore,
      mostFrequent: mostFrequentMood,
      distribution: moodDistribution,
      totalEntries: moodCount,
    },
    journal: {
      totalEntries: totalJournalEntries,
    },
    checkIn: {
      total: checkIns.length,
    },
  };
};

// Generate trend timeline points for chart visualization
const buildTrendData = async (userId, startDate, endDate, period) => {
  const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  let stepDays = 1;
  if (period === "month") stepDays = 4; // 7-8 points
  if (period === "3months") stepDays = 10; // ~9 points

  const trendPoints = [];
  const curr = new Date(startDate);

  while (curr <= endDate) {
    const pointEnd = new Date(curr);
    pointEnd.setDate(pointEnd.getDate() + (stepDays - 1));
    if (pointEnd > endDate) pointEnd.setTime(endDate.getTime());

    const pointStartStr = formatDateStr(curr);
    const label =
      period === "week"
        ? curr.toLocaleDateString("en-US", { weekday: "short" })
        : curr.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Fetch metrics for this sub-window
    const [tasks, focus, moods, goals] = await Promise.all([
      StudyTask.find({ userId, createdAt: { $gte: curr, $lte: pointEnd } }).lean(),
      FocusSession.find({ userId, createdAt: { $gte: curr, $lte: pointEnd } }).lean(),
      MoodTracker.find({ studentId: userId, createdAt: { $gte: curr, $lte: pointEnd } }).lean(),
      Goal.find({ userId, createdAt: { $lte: pointEnd } }).lean(),
    ]);

    const studyCompleted = tasks.filter((t) => t.status === "completed").length;
    const studyPct = tasks.length > 0 ? Math.round((studyCompleted / tasks.length) * 100) : 0;

    const focusMins = focus.reduce((acc, f) => acc + (f.durationMinutes || 0), 0);
    const focusHrs = parseFloat((focusMins / 60).toFixed(1));

    let moodAvg = 0;
    if (moods.length > 0) {
      const sum = moods.reduce((acc, m) => acc + mapMoodToScore(m.mood), 0);
      moodAvg = Math.round((sum / moods.length / 5) * 100);
    }

    let goalAvg = 0;
    if (goals.length > 0) {
      const sum = goals.reduce((acc, g) => acc + (g.progress || (g.status === "completed" ? 100 : 0)), 0);
      goalAvg = Math.round(sum / goals.length);
    }

    trendPoints.push({
      date: pointStartStr,
      label,
      study: studyPct,
      focus: focusHrs,
      goals: goalAvg,
      wellness: moodAvg,
    });

    curr.setDate(curr.getDate() + stepDays);
  }

  return trendPoints;
};

// Generate Rule-based AI Insight Summary
const generateAIInsight = (currentData, previousData) => {
  const { overallScore, study, goals, focus, mood, journal } = currentData;

  if (!currentData.hasAnyActivity) {
    return {
      summary: "You haven't logged study or wellness activity for this period yet. Starting your first daily check-in, study task, or focus session will begin tracking your personal progress score.",
      recommendation: "Complete your first Daily Check-in or start a 25-minute Pomodoro focus session today to build momentum!",
    };
  }

  let insights = [];
  if (study.completionRate >= 75) {
    insights.push(`Your study task completion rate is strong at ${study.completionRate}%.`);
  } else if (study.overdue > 0) {
    insights.push(`You currently have ${study.overdue} overdue task(s) in your Study Planner.`);
  }

  if (focus.totalHours >= 5) {
    insights.push(`You maintained an effective focus routine logging ${focus.totalHours} focus hours across ${focus.sessionCount} sessions.`);
  } else if (focus.sessionCount === 0) {
    insights.push(`Try initiating short Pomodoro focus sprints to boost dedicated study time.`);
  }

  if (mood.avgScore >= 4) {
    insights.push(`Your emotional wellness remains high with an average mood of '${mood.mostFrequent}'.`);
  } else if (mood.avgScore > 0 && mood.avgScore < 3) {
    insights.push(`Your emotional wellness score dipped slightly. Remember to take rest breaks and log your feelings in the Journal.`);
  }

  if (goals.overallProgress >= 70) {
    insights.push(`Great progress on your goals (${goals.overallProgress}% total goal completion rate).`);
  }

  const summary = insights.length > 0
    ? insights.join(" ")
    : `Overall progress score stands at ${overallScore}%. Consistent study sessions and regular mood check-ins will help raise your productivity index.`;

  let recommendation = "Schedule your most challenging study tasks during your peak focus hours and maintain a 5-minute break between Pomodoro sessions.";
  if (study.overdue > 0) {
    recommendation = "Prioritize clearing your overdue study tasks first, breaking them down into 25-minute Pomodoro blocks.";
  } else if (mood.avgScore > 0 && mood.avgScore < 3) {
    recommendation = "Take 10 minutes to log a Journal entry or try box-breathing in the Daily Check-in before starting intense study blocks.";
  } else if (goals.active > 0) {
    recommendation = "Focus on advancing your highest priority active goal by updating sub-task progress in the Goals module.";
  }

  return { summary, recommendation };
};

// @desc    Get comprehensive Progress Analytics for logged-in student
// @route   GET /api/progress
// @access  Private (Student)
exports.getStudentProgressAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const period = req.query.period || "week"; // week | month | 3months

    let days = 7;
    if (period === "month") days = 30;
    if (period === "3months") days = 90;

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const currentStartDate = new Date(now);
    currentStartDate.setDate(currentStartDate.getDate() - days + 1);
    currentStartDate.setHours(0, 0, 0, 0);

    const prevEndDate = new Date(currentStartDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    prevEndDate.setHours(23, 59, 59, 999);

    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - days + 1);
    prevStartDate.setHours(0, 0, 0, 0);

    // Compute metrics for current period and previous period
    const currentMetrics = await computePeriodMetrics(userId, currentStartDate, now, days);
    const previousMetrics = await computePeriodMetrics(userId, prevStartDate, prevEndDate, days);

    // Score comparison
    const scoreDiff = currentMetrics.overallScore - previousMetrics.overallScore;
    const pctChange = previousMetrics.overallScore > 0
      ? Math.round(((currentMetrics.overallScore - previousMetrics.overallScore) / previousMetrics.overallScore) * 100)
      : currentMetrics.overallScore;

    let status = "Needs Attention";
    if (currentMetrics.overallScore >= 80) status = "Excellent";
    else if (currentMetrics.overallScore >= 65) status = "Good";
    else if (currentMetrics.overallScore >= 50) status = "Improving";

    // Streak calculations from all journals
    const allJournals = await Journal.find({ userId }).sort({ createdAt: -1 }).lean();
    const streakInfo = calculateJournalStreak(allJournals);

    // Trend chart points
    const trends = await buildTrendData(userId, currentStartDate, now, period);

    // AI Insight
    const insights = generateAIInsight(currentMetrics, previousMetrics);

    return res.status(200).json({
      success: true,
      data: {
        period,
        overallProgress: currentMetrics.overallScore,
        previousPeriodProgress: previousMetrics.overallScore,
        scoreDiff,
        improvementPercentage: Math.abs(pctChange),
        isImprovement: scoreDiff >= 0,
        status,
        hasData: currentMetrics.hasAnyActivity,
        study: currentMetrics.study,
        goals: currentMetrics.goals,
        focus: currentMetrics.focus,
        mood: currentMetrics.mood,
        journal: {
          ...currentMetrics.journal,
          currentStreak: streakInfo.currentStreak,
          longestStreak: streakInfo.longestStreak,
          totalEntriesAllTime: allJournals.length,
        },
        dailyCheckIn: currentMetrics.checkIn,
        trends,
        insights,
      },
    });
  } catch (error) {
    console.error("Get Student Progress Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load progress analytics: " + error.message,
    });
  }
};
