const User = require("../models/User");
const Goal = require("../models/Goal");
const StudyTask = require("../models/StudyTask");
const MoodTracker = require("../models/MoodTracker");
const Journal = require("../models/Journal");
const DailyCheckIn = require("../models/DailyCheckIn");
const ProfessionalCheckIn = require("../models/ProfessionalCheckIn");
const SeniorDailyCheckIn = require("../models/SeniorDailyCheckIn");
const DailyPlan = require("../models/DailyPlan");

/**
 * Helper: Convert "HH:MM" time string to minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Helper: Convert minutes from midnight to "HH:MM" string
 */
function minutesToTime(totalMins) {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, totalMins));
  const hours = Math.floor(normalized / 60);
  const minutes = Math.floor(normalized % 60);
  const hStr = String(hours).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");
  return `${hStr}:${mStr}`;
}

/**
 * Helper: Convert "HH:MM" to 12-hour format e.g. "09:00 AM"
 */
function format12Hour(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const displayMin = String(m || 0).padStart(2, "0");
  return `${displayHour}:${displayMin} ${period}`;
}

/**
 * Generate contextual positive reminder message for a task based on category, priority, and time of day
 */
function buildReminderMessage(title, priority, type, startTime, progressInfo) {
  const p = (priority || "").toLowerCase();
  const t = (type || "").toLowerCase();
  const titleLower = (title || "").toLowerCase();

  if (progressInfo && progressInfo.total > 0 && progressInfo.completed === progressInfo.total - 1) {
    return `🎉 Great progress! You've completed ${progressInfo.completed} of today's ${progressInfo.total} tasks. Just one important task remains.`;
  }

  if (t === "break" || titleLower.includes("break") || titleLower.includes("rest")) {
    return "☕ You've been focusing for a while. Take a short break, drink some water and recharge.";
  }

  if (t === "meal" || titleLower.includes("lunch") || titleLower.includes("breakfast") || titleLower.includes("dinner")) {
    return "🍽️ Meal Time. Step away from your tasks and take some time to recharge.";
  }

  if (t === "exercise" || titleLower.includes("exercise") || titleLower.includes("walk") || titleLower.includes("workout")) {
    return "🏃 Movement Time! Take a short walk or do some light activity.";
  }

  if (titleLower.includes("sleep") || titleLower.includes("wind down")) {
    return "🌙 It's getting late. Start winding down and prepare for tomorrow.";
  }

  if (p === "high") {
    return `⭐ Priority Task: "${title}" is one of today's important targets. Let's focus on completing it!`;
  }

  if (t === "study" || titleLower.includes("study") || titleLower.includes("assignment") || titleLower.includes("exam")) {
    return `📚 Study Time! Your session for "${title}" is starting now. Let's focus and make great progress. You've got this!`;
  }

  if (t === "work" || titleLower.includes("work") || titleLower.includes("project") || titleLower.includes("meeting")) {
    return `💻 Focus Time! Your work session "${title}" is starting now. Let's make some quality progress!`;
  }

  const hour = parseInt((startTime || "09:00").split(":")[0], 10);
  if (hour < 9) {
    return `🌞 Good morning! A new day is ready. Let's start with your planned activity: ${title}.`;
  } else if (hour >= 20) {
    return `🌙 Your day is winding down. Finish what is important and start relaxing. Upcoming: ${title}.`;
  }

  return `🔔 Reminder: Scheduled activity "${title}" is starting at ${format12Hour(startTime)}.`;
}

/**
 * Gather full context for a user for intelligent plan generation
 */
async function getFullUserContext(userId) {
  try {
    const user = await User.findById(userId).select("fullName email role").lean();

    const [activeGoals, pendingStudyTasks, latestMood, recentJournals, pastPlans] = await Promise.all([
      Goal.find({ userId, status: "active" }).sort({ priority: -1 }).limit(5).lean(),
      StudyTask.find({ userId, status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
      MoodTracker.findOne({ studentId: userId }).sort({ createdAt: -1 }).lean(),
      Journal.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
      DailyPlan.find({ userId }).sort({ date: -1 }).limit(7).lean(),
    ]);

    // Calculate historical statistics
    let totalHistoricalTasks = 0;
    let completedHistoricalTasks = 0;
    const postponedCategoryCounts = {};

    pastPlans.forEach((plan) => {
      (plan.tasks || []).forEach((t) => {
        totalHistoricalTasks++;
        if (t.status === "completed") completedHistoricalTasks++;
        if (t.postponedCount > 0) {
          const type = t.type || "other";
          postponedCategoryCounts[type] = (postponedCategoryCounts[type] || 0) + 1;
        }
      });
    });

    const historicalCompletionRate = totalHistoricalTasks > 0
      ? Math.round((completedHistoricalTasks / totalHistoricalTasks) * 100)
      : 80;

    return {
      userId,
      userRole: user?.role || "Student",
      userName: user?.fullName || "User",
      goals: activeGoals.map((g) => ({ title: g.title, category: g.category, priority: g.priority })),
      studyTasks: pendingStudyTasks.map((s) => ({ title: s.title, subject: s.subject, priority: s.priority })),
      latestMood: latestMood ? latestMood.mood : null,
      historicalCompletionRate,
      postponedCategoryCounts,
      pastPlanCount: pastPlans.length,
    };
  } catch (err) {
    console.error("Error building full user context for NeuroPlan:", err);
    return {
      userId,
      userRole: "Student",
      userName: "User",
      goals: [],
      studyTasks: [],
      latestMood: null,
      historicalCompletionRate: 75,
      postponedCategoryCounts: {},
      pastPlanCount: 0,
    };
  }
}

/**
 * Deterministic / Fallback Schedule Generator Engine
 */
function generateDeterministicSchedule({
  wakeUpTime = "07:00",
  sleepTime = "23:00",
  energyLevel = "Medium",
  roughTasks = [],
  fixedCommitments = [],
  context = {},
}) {
  const wakeMins = timeToMinutes(wakeUpTime);
  const sleepMins = timeToMinutes(sleepTime);

  // Convert fixed commitments to minutes range
  const fixedRanges = (fixedCommitments || []).map((fc) => ({
    title: fc.title,
    start: timeToMinutes(fc.startTime),
    end: timeToMinutes(fc.endTime),
  }));

  // Build raw list of task items combining user rough tasks + relevant existing goals/study tasks
  const rawTasks = [];

  // Add user rough tasks
  if (Array.isArray(roughTasks) && roughTasks.length > 0) {
    roughTasks.forEach((rt, idx) => {
      if (!rt.title || !rt.title.trim()) return;
      rawTasks.push({
        taskId: `task_user_${idx + 1}_${Date.now().toString(36)}`,
        title: rt.title.trim(),
        description: rt.description || "",
        priority: rt.priority || "Medium",
        type: rt.type || "work",
        duration: rt.duration ? Number(rt.duration) : rt.priority === "High" ? 60 : 45,
      });
    });
  }

  // If few tasks provided, incorporate pending study tasks or goals
  if (rawTasks.length < 3 && context.studyTasks && context.studyTasks.length > 0) {
    context.studyTasks.forEach((st, idx) => {
      if (rawTasks.length >= 5) return;
      if (!rawTasks.some((t) => t.title.toLowerCase() === st.title.toLowerCase())) {
        rawTasks.push({
          taskId: `task_study_${idx + 1}_${Date.now().toString(36)}`,
          title: `${st.subject || "Study"}: ${st.title}`,
          description: "Imported from your Study Planner",
          priority: st.priority || "Medium",
          type: "study",
          duration: 45,
        });
      }
    });
  }

  // Fallback defaults if list is still empty
  if (rawTasks.length === 0) {
    const isProf = context.userRole === "Working Professional";
    const isSenior = context.userRole === "Senior Citizen";

    if (isProf) {
      rawTasks.push(
        { taskId: `t1_${Date.now()}`, title: "Deep Work: Key Deliverable", description: "Focus on primary work outcome", priority: "High", type: "work", duration: 60 },
        { taskId: `t2_${Date.now()}`, title: "Team Sync & Communications", description: "Review messages and hold check-ins", priority: "Medium", type: "work", duration: 45 },
        { taskId: `t3_${Date.now()}`, title: "Workplace Skill Upgrade / Reading", description: "Professional development block", priority: "Low", type: "work", duration: 30 }
      );
    } else if (isSenior) {
      rawTasks.push(
        { taskId: `t1_${Date.now()}`, title: "Morning Mobility & Stretch", description: "Gentle exercises for joint flexibility", priority: "High", type: "exercise", duration: 30 },
        { taskId: `t2_${Date.now()}`, title: "Memory Exercise & Reading", description: "Engage with brain training or favorite book", priority: "Medium", type: "personal", duration: 40 },
        { taskId: `t3_${Date.now()}`, title: "Family Connection / Call", description: "Reach out to loved ones", priority: "Medium", type: "personal", duration: 30 }
      );
    } else {
      rawTasks.push(
        { taskId: `t1_${Date.now()}`, title: "Core Subject Study Session", description: "Review key concepts and notes", priority: "High", type: "study", duration: 60 },
        { taskId: `t2_${Date.now()}`, title: "Assignment & Practice Problems", description: "Hands-on exercise and coding", priority: "Medium", type: "study", duration: 45 },
        { taskId: `t3_${Date.now()}`, title: "Project Work & Research", description: "Collaborative or solo project progress", priority: "High", type: "study", duration: 60 }
      );
    }
  }

  // Sort tasks by priority (High -> Medium -> Low)
  rawTasks.sort((a, b) => {
    const pMap = { High: 3, Medium: 2, Low: 1 };
    return pMap[b.priority] - pMap[a.priority];
  });

  // Schedule timeline builder
  let currentMins = wakeMins + 30; // Start 30 mins after waking up (e.g. 07:30)
  const scheduledTasks = [];

  const isSlotOverlappingFixed = (start, end) => {
    return fixedRanges.some((fr) => Math.max(start, fr.start) < Math.min(end, fr.end));
  };

  const getNextAvailableMinuteAfterFixed = (start) => {
    for (const fr of fixedRanges) {
      if (start >= fr.start && start < fr.end) {
        return fr.end + 15; // 15 mins after commitment ends
      }
    }
    return start;
  };

  // 1. Add Morning Ritual / Start Day
  scheduledTasks.push({
    taskId: `task_morning_${Date.now()}`,
    title: "Morning Routine & Planning",
    description: "Hydrate, light stretch, and review your daily goals.",
    startTime: minutesToTime(wakeMins + 15),
    endTime: minutesToTime(wakeMins + 35),
    duration: 20,
    priority: "Low",
    type: "personal",
    reason: "Start your morning with clarity and balance",
    breakAfter: false,
    reminderOption: "ai_smart",
    reminderTime: minutesToTime(wakeMins + 15),
    reminderMessage: `🌞 Good morning, ${context.userName || "friend"}! A fresh day has arrived. Let's make today meaningful.`,
    status: "pending",
    aiGenerated: true,
    userModified: false,
  });

  currentMins = wakeMins + 45;

  // 2. Schedule Tasks into available windows
  rawTasks.forEach((raw, i) => {
    // Check fixed commitments
    currentMins = getNextAvailableMinuteAfterFixed(currentMins);

    let start = currentMins;
    let duration = raw.duration || 45;

    // Energy level adjustment: if low energy, cap single task block at 45 min
    if (energyLevel === "Low" && duration > 45) {
      duration = 45;
    }

    let end = start + duration;

    // Handle collision with fixed commitment
    if (isSlotOverlappingFixed(start, end)) {
      currentMins = getNextAvailableMinuteAfterFixed(start);
      start = currentMins;
      end = start + duration;
    }

    // Do not schedule past sleep time
    if (end > sleepMins - 30) return;

    const startTimeStr = minutesToTime(start);
    const endTimeStr = minutesToTime(end);

    const reminderMsg = buildReminderMessage(raw.title, raw.priority, raw.type, startTimeStr);

    scheduledTasks.push({
      taskId: raw.taskId || `task_${i + 1}_${Date.now()}`,
      title: raw.title,
      description: raw.description || "",
      startTime: startTimeStr,
      endTime: endTimeStr,
      duration: duration,
      priority: raw.priority || "Medium",
      type: raw.type || "work",
      reason: raw.priority === "High" ? "High priority target scheduled during optimal focus window" : "Balanced task block",
      breakAfter: true,
      reminderOption: "ai_smart",
      reminderTime: startTimeStr,
      reminderMessage: reminderMsg,
      status: "pending",
      aiGenerated: true,
      userModified: false,
    });

    currentMins = end;

    // Add a 15-minute break after heavy or high-priority tasks
    if (raw.priority === "High" || duration >= 60) {
      const breakStart = currentMins;
      const breakEnd = breakStart + 15;
      if (!isSlotOverlappingFixed(breakStart, breakEnd) && breakEnd < sleepMins - 30) {
        scheduledTasks.push({
          taskId: `break_${i + 1}_${Date.now()}`,
          title: "Short Hydration & Rest Break ☕",
          description: "Step away from your screen, stretch, and relax.",
          startTime: minutesToTime(breakStart),
          endTime: minutesToTime(breakEnd),
          duration: 15,
          priority: "Low",
          type: "break",
          reason: "Scheduled break to prevent mental fatigue and sustain high focus",
          breakAfter: false,
          reminderOption: "at_start",
          reminderTime: minutesToTime(breakStart),
          reminderMessage: "☕ You've been focusing well! Take a 15-minute break, stretch, and grab some water.",
          status: "pending",
          aiGenerated: true,
          userModified: false,
        });
        currentMins = breakEnd;
      }
    }
  });

  // 3. Evening Wind-Down Task
  const windDownStart = Math.min(sleepMins - 45, currentMins > sleepMins - 60 ? currentMins + 15 : sleepMins - 45);
  if (windDownStart > currentMins && windDownStart < sleepMins) {
    scheduledTasks.push({
      taskId: `task_evening_${Date.now()}`,
      title: "Evening Reflection & Wind Down 🌙",
      description: "Review today's achievements, log reflection, and prepare for restful sleep.",
      startTime: minutesToTime(windDownStart),
      endTime: minutesToTime(sleepMins - 5),
      duration: sleepMins - 5 - windDownStart,
      priority: "Low",
      type: "personal",
      reason: "Prepare mind and body for sleep",
      breakAfter: false,
      reminderOption: "ai_smart",
      reminderTime: minutesToTime(windDownStart),
      reminderMessage: "🌙 Your day is winding down. Great effort today! Complete your daily reflection and prepare for rest.",
      status: "pending",
      aiGenerated: true,
      userModified: false,
    });
  }

  const daySummary = `Realistic ${energyLevel.toLowerCase()}-energy plan with ${scheduledTasks.filter((t) => t.type !== "break").length} main tasks and balanced rest intervals.`;

  const aiGuidance = energyLevel === "High"
    ? "Your energy is high today! Tackle your highest priority tasks early in the morning and maintain steady momentum."
    : energyLevel === "Low"
    ? "Your energy level is low today. We've structured shorter focus blocks with frequent breaks. Focus on steady progress without rushing."
    : "Balanced daily flow. Focus on completing tasks one at a time and respect your scheduled break intervals.";

  return {
    daySummary,
    aiGuidance,
    tasks: scheduledTasks,
  };
}

/**
 * Main AI Schedule Generator. Uses Gemini API if key is present, or falls back to deterministic generator.
 */
async function generateSchedule({ userId, date, wakeUpTime, sleepTime, energyLevel, roughTasks, fixedCommitments }) {
  const context = await getFullUserContext(userId);

  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const promptPayload = {
        role: context.userRole,
        userName: context.userName,
        date,
        wakeUpTime,
        sleepTime,
        energyLevel,
        roughTasks,
        fixedCommitments,
        userActiveGoals: context.goals,
        userPendingStudyTasks: context.studyTasks,
        historicalCompletionRate: `${context.historicalCompletionRate}%`,
      };

      const systemPrompt = `You are NeuroPlan, an AI personalized daily planner inside the NeuroSync ecosystem.
Convert the user's rough daily input and context into a realistic, balanced, personalized daily schedule JSON object.

RULES:
1. Do NOT overload the user with too many heavy tasks.
2. Respect wakeUpTime (${wakeUpTime}) and sleepTime (${sleepTime}).
3. Avoid scheduling tasks during fixedCommitments (${JSON.stringify(fixedCommitments)}).
4. Insert 15-minute breaks after intense tasks or high priority work.
5. Generate positive, supportive reminder messages for each task.
6. MUST return ONLY valid JSON string without Markdown wrappers or explanations.

Expected JSON schema:
{
  "daySummary": "Brief overview of the day plan",
  "aiGuidance": "Actionable encouragement for the user",
  "tasks": [
    {
      "taskId": "unique_string",
      "title": "Task title",
      "description": "Short details",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "duration": 45,
      "priority": "High|Medium|Low",
      "type": "study|work|break|exercise|personal|meal|other",
      "reason": "Why scheduled here",
      "breakAfter": true,
      "reminderOption": "ai_smart",
      "reminderTime": "HH:MM",
      "reminderMessage": "Contextual positive reminder text",
      "status": "pending"
    }
  ]
}`;

      const fetchRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUSER DATA:\n${JSON.stringify(promptPayload)}` }],
            },
          ],
        }),
      });

      if (fetchRes.ok) {
        const data = await fetchRes.json();
        const textRes = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textRes) {
          // Clean possible markdown code fences
          const cleanedText = textRes.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
            return {
              daySummary: parsed.daySummary || "Personalized daily schedule generated by AI.",
              aiGuidance: parsed.aiGuidance || "Focus on your top priorities and take regular breaks.",
              tasks: parsed.tasks.map((t, idx) => ({
                taskId: t.taskId || `ai_task_${idx + 1}_${Date.now()}`,
                title: t.title || "Scheduled Activity",
                description: t.description || "",
                startTime: t.startTime || "09:00",
                endTime: t.endTime || "09:45",
                duration: t.duration || 45,
                priority: ["High", "Medium", "Low"].includes(t.priority) ? t.priority : "Medium",
                type: t.type || "work",
                reason: t.reason || "Optimized focus block",
                breakAfter: Boolean(t.breakAfter),
                reminderOption: t.reminderOption || "ai_smart",
                reminderTime: t.reminderTime || t.startTime || "09:00",
                reminderMessage: t.reminderMessage || buildReminderMessage(t.title, t.priority, t.type, t.startTime),
                status: "pending",
                aiGenerated: true,
                userModified: false,
              })),
            };
          }
        }
      }
    } catch (err) {
      console.warn("External AI call for NeuroPlan failed or timed out, using deterministic engine:", err.message);
    }
  }

  // Fallback to deterministic generator
  return generateDeterministicSchedule({
    wakeUpTime,
    sleepTime,
    energyLevel,
    roughTasks,
    fixedCommitments,
    context,
  });
}

/**
 * Generate End-Of-Day Reflection Insights
 */
async function generateReflectionInsights({ userNotes, completedCount, totalCount, postponedCount, userRole = "Student" }) {
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  let whatWentWell = "";
  let whatCouldBeImproved = "";
  let tomorrowSuggestion = "";

  if (completionRate >= 80) {
    whatWentWell = `Outstanding performance today! You accomplished ${completedCount} out of ${totalCount} planned tasks (${completionRate}% completion).`;
    whatCouldBeImproved = postponedCount > 0
      ? `You postponed ${postponedCount} task(s). Try allocating slightly larger time buffers for complex tasks.`
      : "You maintained strong focus throughout your scheduled blocks.";
    tomorrowSuggestion = "Keep up this fantastic momentum tomorrow! Consider starting with your highest impact goal early.";
  } else if (completionRate >= 50) {
    whatWentWell = `Good solid progress! You completed ${completedCount} key task(s) today.`;
    whatCouldBeImproved = `Unfinished or postponed tasks (${postponedCount}). Avoid scheduling too many heavy tasks back-to-back.`;
    tomorrowSuggestion = "For tomorrow's plan, pick your top 2 non-negotiable tasks first and schedule 15-minute breaks after each.";
  } else {
    whatWentWell = `You logged your daily progress and completed ${completedCount} task(s). Every bit of effort counts.`;
    whatCouldBeImproved = "Tasks may have been too large or unexpected interruptions occurred during the day.";
    tomorrowSuggestion = "Break down large goals into 15-minute micro-tasks tomorrow morning to build momentum quickly.";
  }

  if (userNotes && userNotes.trim()) {
    whatWentWell += ` Your reflection note: "${userNotes.trim()}" reflects great self-awareness.`;
  }

  return {
    userNotes: userNotes || "",
    whatWentWell,
    whatCouldBeImproved,
    tomorrowSuggestion,
    reflectedAt: new Date(),
  };
}

module.exports = {
  getFullUserContext,
  generateSchedule,
  generateReflectionInsights,
  buildReminderMessage,
  format12Hour,
};
