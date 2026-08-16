const Notification = require("../models/Notification");
const StudyTask = require("../models/StudyTask");
const Goal = require("../models/Goal");
const DailyCheckIn = require("../models/DailyCheckIn");
const MoodTracker = require("../models/MoodTracker");
const Journal = require("../models/Journal");
const FocusSession = require("../models/FocusSession");

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Safely create notification if duplicate does not already exist
 */
async function createIfNotExists({
  userId,
  category,
  title,
  message,
  type,
  icon,
  priority = "Normal",
  link = "/student/dashboard",
  sourceType = "System",
  sourceId = "",
}) {
  try {
    const existing = await Notification.findOne({
      userId,
      sourceType,
      sourceId: String(sourceId),
      type,
    });

    if (existing) return existing;

    const notification = await Notification.create({
      userId,
      category,
      title,
      message,
      type,
      icon,
      priority,
      link,
      sourceType,
      sourceId: String(sourceId),
    });

    return notification;
  } catch (err) {
    console.error("Error creating notification safely:", err.message);
    return null;
  }
}

/**
 * Scan student's live module data and generate dynamic notifications
 */
async function generateStudentNotifications(userId) {
  try {
    const todayStr = getTodayDateString();

    // 1. STUDY PLANNER NOTIFICATIONS
    const pendingTasks = await StudyTask.find({ userId, status: "pending" }).lean();
    for (const task of pendingTasks) {
      if (task.date === todayStr) {
        await createIfNotExists({
          userId,
          category: "Study",
          title: "Study Task Due Today 📚",
          message: `Your task "${task.title}" (${task.subject}) is scheduled for today.`,
          type: "task_due_today",
          icon: "FiCalendar",
          priority: "Normal",
          link: "/student/study-planner",
          sourceType: "StudyTask",
          sourceId: task._id,
        });
      } else if (task.date && task.date < todayStr) {
        await createIfNotExists({
          userId,
          category: "Study",
          title: "Study Task Overdue ⚠️",
          message: `Task "${task.title}" was due on ${task.date}. Reschedule or complete it soon.`,
          type: "task_overdue",
          icon: "FiCalendar",
          priority: "High",
          link: "/student/study-planner",
          sourceType: "StudyTask",
          sourceId: task._id,
        });
      }
    }

    // 2. GOALS NOTIFICATIONS
    const activeGoals = await Goal.find({ userId, status: "active" }).lean();
    const todayDateObj = new Date(todayStr);

    for (const goal of activeGoals) {
      if (goal.targetDate) {
        const targetObj = new Date(goal.targetDate);
        const diffDays = Math.ceil((targetObj - todayDateObj) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 2) {
          await createIfNotExists({
            userId,
            category: "Goals",
            title: "Goal Deadline Approaching 🎯",
            message: `Your goal "${goal.title}" target date is in ${diffDays === 0 ? "today" : diffDays + " day(s)"}.`,
            type: "goal_deadline_approaching",
            icon: "FiTarget",
            priority: "High",
            link: "/student/goals",
            sourceType: "Goal",
            sourceId: goal._id,
          });
        } else if (diffDays < 0) {
          await createIfNotExists({
            userId,
            category: "Goals",
            title: "Goal Needs Attention 🎯",
            message: `Your active goal "${goal.title}" target date has passed. Update your progress or target date.`,
            type: "goal_overdue",
            icon: "FiTarget",
            priority: "Normal",
            link: "/student/goals",
            sourceType: "Goal",
            sourceId: goal._id,
          });
        }
      }
    }

    // 3. WELLNESS & DAILY CHECK-IN NOTIFICATIONS
    const todayCheckIn = await DailyCheckIn.findOne({ studentId: userId, date: todayStr }).lean();
    if (!todayCheckIn) {
      await createIfNotExists({
        userId,
        category: "Wellness",
        title: "Daily Check-in Reminder 🧠",
        message: "Take a quick moment to log how you're feeling and your main goal for today.",
        type: "checkin_reminder",
        icon: "FiSmile",
        priority: "Normal",
        link: "/student/checkin",
        sourceType: "DailyCheckIn",
        sourceId: todayStr,
      });
    }

    // Check recent mood pattern (last 3 entries within past 7 days)
    const recentMoods = await MoodTracker.find({ studentId: userId }).sort({ createdAt: -1 }).limit(3).lean();
    if (recentMoods.length >= 3) {
      const negativeCount = recentMoods.filter(
        (m) => m.intensity >= 7 || ["Stressed", "Sad", "Anxious", "Angry", "Tired"].includes(m.mood)
      ).length;

      if (negativeCount >= 3) {
        await createIfNotExists({
          userId,
          category: "Wellness",
          title: "Wellness Check 🧠",
          message: "Your recent mood pattern suggests higher stress. Remember to take relaxation breaks and stay hydrated.",
          type: "wellness_pattern_alert",
          icon: "FiSmile",
          priority: "Normal",
          link: "/student/mood-tracker",
          sourceType: "MoodTracker",
          sourceId: recentMoods[0]._id,
        });
      }
    }

    // 4. JOURNAL NOTIFICATIONS
    const latestJournal = await Journal.findOne({ userId }).sort({ createdAt: -1 }).lean();
    if (latestJournal) {
      const daysSinceJournal = Math.floor((new Date() - new Date(latestJournal.createdAt)) / (1000 * 60 * 60 * 24));
      if (daysSinceJournal >= 3) {
        await createIfNotExists({
          userId,
          category: "Journal",
          title: "Journal Reminder 📔",
          message: `It's been ${daysSinceJournal} days since your last journal entry. Reflection helps clear your mind.`,
          type: "journal_reminder",
          icon: "FiBookOpen",
          priority: "Low",
          link: "/student/journal",
          sourceType: "Journal",
          sourceId: todayStr,
        });
      }
    } else {
      await createIfNotExists({
        userId,
        category: "Journal",
        title: "Start Your Journal 📔",
        message: "Write your first journal entry to track your personal reflections and thoughts.",
        type: "journal_welcome",
        icon: "FiBookOpen",
        priority: "Low",
        link: "/student/journal",
        sourceType: "Journal",
        sourceId: "welcome",
      });
    }

    // 5. FOCUS NOTIFICATIONS
    const focusCountToday = await FocusSession.countDocuments({ userId, date: todayStr });
    if (focusCountToday >= 4) {
      await createIfNotExists({
        userId,
        category: "Focus",
        title: "Focus Milestone Reached ⏱️",
        message: `Awesome dedication! You completed ${focusCountToday} Pomodoro focus sessions today.`,
        type: "focus_milestone_today",
        icon: "FiClock",
        priority: "Normal",
        link: "/student/focus-timer",
        sourceType: "FocusSession",
        sourceId: `${todayStr}_4`,
      });
    }
  } catch (err) {
    console.error("Error generating student notifications:", err);
  }
}

module.exports = {
  createIfNotExists,
  generateStudentNotifications,
};
