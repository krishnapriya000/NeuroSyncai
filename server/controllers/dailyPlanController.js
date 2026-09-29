const DailyPlan = require("../models/DailyPlan");
const Notification = require("../models/Notification");
const neuroPlanAiService = require("../services/neuroPlanAiService");
const notificationGenerator = require("../services/notificationGeneratorService");

/**
 * Helper: Recalculate completion percentage for a DailyPlan instance
 */
function updateCompletionPercentage(plan) {
  if (!plan || !plan.tasks || plan.tasks.length === 0) {
    plan.completionPercentage = 0;
    return;
  }
  const countableTasks = plan.tasks.filter((t) => t.type !== "break");
  if (countableTasks.length === 0) {
    plan.completionPercentage = 100;
    return;
  }
  const completedCount = countableTasks.filter((t) => t.status === "completed").length;
  plan.completionPercentage = Math.round((completedCount / countableTasks.length) * 100);
}

/**
 * Helper: Sync plan task reminders with user Notifications
 */
async function syncTaskNotifications(userId, plan) {
  try {
    if (!plan || !plan.tasks || plan.tasks.length === 0) return;

    for (const task of plan.tasks) {
      if (task.reminderOption === "none" || task.status === "completed") continue;

      const title = `Task Reminder: ${task.title}`;
      const message = task.reminderMessage || neuroPlanAiService.buildReminderMessage(task.title, task.priority, task.type, task.startTime);

      await notificationGenerator.createIfNotExists({
        userId,
        category: task.type === "study" ? "Study" : task.type === "work" ? "Focus" : "Wellness",
        title,
        message,
        type: "neuroplan_reminder",
        icon: "FiCalendar",
        priority: task.priority === "High" ? "High" : "Normal",
        link: "/neuroplan",
        sourceType: "DailyPlanTask",
        sourceId: `${plan._id}_${task.taskId}`,
      });
    }
  } catch (err) {
    console.error("Error syncing task notifications:", err.message);
  }
}

/**
 * @desc    Get Daily Plan for a specific date ("YYYY-MM-DD")
 * @route   GET /api/neuroplan/:date
 * @access  Private
 */
exports.getPlanByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date parameter is required." });
    }

    let plan = await DailyPlan.findOne({ userId, date });

    if (!plan) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No daily plan found for this date.",
      });
    }

    updateCompletionPercentage(plan);
    await plan.save();

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Get Plan By Date Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load daily plan." });
  }
};

/**
 * @desc    Generate AI Personalized Daily Plan
 * @route   POST /api/neuroplan/generate
 * @access  Private
 */
exports.generatePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      date,
      wakeUpTime = "07:00",
      sleepTime = "23:00",
      energyLevel = "Medium",
      roughTasks = [],
      fixedCommitments = [],
    } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    // Call AI / Schedule Generator
    const generated = await neuroPlanAiService.generateSchedule({
      userId,
      date,
      wakeUpTime,
      sleepTime,
      energyLevel,
      roughTasks,
      fixedCommitments,
    });

    // Check if plan already exists for this date, update or create
    let plan = await DailyPlan.findOne({ userId, date });

    if (plan) {
      plan.wakeUpTime = wakeUpTime;
      plan.sleepTime = sleepTime;
      plan.energyLevel = energyLevel;
      plan.fixedCommitments = fixedCommitments;
      plan.tasks = generated.tasks;
      plan.daySummary = generated.daySummary;
      plan.aiGuidance = generated.aiGuidance;
    } else {
      plan = new DailyPlan({
        userId,
        date,
        wakeUpTime,
        sleepTime,
        energyLevel,
        fixedCommitments,
        tasks: generated.tasks,
        daySummary: generated.daySummary,
        aiGuidance: generated.aiGuidance,
      });
    }

    updateCompletionPercentage(plan);
    await plan.save();

    // Create notifications for tasks
    await syncTaskNotifications(userId, plan);

    return res.status(200).json({
      success: true,
      message: "✨ AI Daily Plan successfully generated!",
      data: plan,
    });
  } catch (error) {
    console.error("Generate Daily Plan Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate AI daily plan." });
  }
};

/**
 * @desc    Save or Update Full Daily Plan manually
 * @route   POST /api/neuroplan
 * @access  Private
 */
exports.saveOrUpdatePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, wakeUpTime, sleepTime, energyLevel, fixedCommitments, tasks, daySummary, aiGuidance } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    let plan = await DailyPlan.findOne({ userId, date });

    if (!plan) {
      plan = new DailyPlan({ userId, date });
    }

    if (wakeUpTime) plan.wakeUpTime = wakeUpTime;
    if (sleepTime) plan.sleepTime = sleepTime;
    if (energyLevel) plan.energyLevel = energyLevel;
    if (Array.isArray(fixedCommitments)) plan.fixedCommitments = fixedCommitments;
    if (Array.isArray(tasks)) plan.tasks = tasks;
    if (daySummary !== undefined) plan.daySummary = daySummary;
    if (aiGuidance !== undefined) plan.aiGuidance = aiGuidance;

    updateCompletionPercentage(plan);
    await plan.save();

    await syncTaskNotifications(userId, plan);

    return res.status(200).json({
      success: true,
      message: "Daily plan saved successfully.",
      data: plan,
    });
  } catch (error) {
    console.error("Save/Update Daily Plan Error:", error);
    return res.status(500).json({ success: false, message: "Failed to save daily plan." });
  }
};

/**
 * @desc    Update a specific task inside a daily plan
 * @route   PUT /api/neuroplan/task/:taskId
 * @access  Private
 */
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.params;
    const { date, title, description, startTime, endTime, duration, priority, type, reminderOption } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    const plan = await DailyPlan.findOne({ userId, date });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found for given date." });
    }

    const task = plan.tasks.find((t) => t.taskId === taskId || t._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found in daily plan." });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (startTime !== undefined) task.startTime = startTime;
    if (endTime !== undefined) task.endTime = endTime;
    if (duration !== undefined) task.duration = Number(duration);
    if (priority !== undefined) task.priority = priority;
    if (type !== undefined) task.type = type;
    if (reminderOption !== undefined) task.reminderOption = reminderOption;

    task.userModified = true;
    task.reminderMessage = neuroPlanAiService.buildReminderMessage(task.title, task.priority, task.type, task.startTime);

    updateCompletionPercentage(plan);
    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: plan,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update task." });
  }
};

/**
 * @desc    Toggle or complete a task
 * @route   POST /api/neuroplan/task/:taskId/complete
 * @access  Private
 */
exports.completeTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.params;
    const { date, completed = true } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    const plan = await DailyPlan.findOne({ userId, date });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found for given date." });
    }

    const task = plan.tasks.find((t) => t.taskId === taskId || t._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    task.status = completed ? "completed" : "pending";
    task.completedAt = completed ? new Date() : null;

    updateCompletionPercentage(plan);
    await plan.save();

    const totalTasks = plan.tasks.filter((t) => t.type !== "break").length;
    const completedTasks = plan.tasks.filter((t) => t.type !== "break" && t.status === "completed").length;

    let progressFeedback = "";
    if (completed) {
      if (completedTasks === totalTasks && totalTasks > 0) {
        progressFeedback = "🎉 Outstanding! You've completed ALL planned tasks for today!";
      } else {
        progressFeedback = `✅ Task completed! You've finished ${completedTasks} of ${totalTasks} tasks (${plan.completionPercentage}% complete).`;
      }
    } else {
      progressFeedback = "Task marked back as pending.";
    }

    return res.status(200).json({
      success: true,
      message: progressFeedback,
      data: plan,
      completionPercentage: plan.completionPercentage,
    });
  } catch (error) {
    console.error("Complete Task Error:", error);
    return res.status(500).json({ success: false, message: "Failed to mark task status." });
  }
};

/**
 * @desc    Reschedule a task to later today or tomorrow
 * @route   POST /api/neuroplan/task/:taskId/reschedule
 * @access  Private
 */
exports.rescheduleTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.params;
    const { date, targetOption = "tomorrow", newTime, newDate } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    const currentPlan = await DailyPlan.findOne({ userId, date });
    if (!currentPlan) {
      return res.status(404).json({ success: false, message: "Current day plan not found." });
    }

    const taskIndex = currentPlan.tasks.findIndex((t) => t.taskId === taskId || t._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: "Task not found in daily plan." });
    }

    const task = currentPlan.tasks[taskIndex];

    if (targetOption === "later_today" || (targetOption === "choose_time" && (!newDate || newDate === date))) {
      // Reschedule later today
      if (newTime) {
        task.startTime = newTime;
        const [h, m] = newTime.split(":").map(Number);
        const endMins = h * 60 + m + (task.duration || 30);
        const endH = Math.floor(endMins / 60) % 24;
        const endM = endMins % 60;
        task.endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
      }
      task.postponedCount = (task.postponedCount || 0) + 1;
      task.rescheduledFrom = date;
      task.status = "pending";
      task.userModified = true;

      updateCompletionPercentage(currentPlan);
      await currentPlan.save();

      return res.status(200).json({
        success: true,
        message: `Task rescheduled to ${task.startTime} today.`,
        data: currentPlan,
      });
    }

    // Reschedule to Tomorrow or specified target newDate
    let targetDateStr = newDate;
    if (!targetDateStr || targetOption === "tomorrow") {
      const currentDateObj = new Date(date);
      currentDateObj.setDate(currentDateObj.getDate() + 1);
      targetDateStr = currentDateObj.toISOString().split("T")[0];
    }

    // Mark task as rescheduled in current plan
    task.status = "rescheduled";
    task.postponedCount = (task.postponedCount || 0) + 1;

    updateCompletionPercentage(currentPlan);
    await currentPlan.save();

    // Move or copy task to targetDate plan
    let targetPlan = await DailyPlan.findOne({ userId, date: targetDateStr });
    if (!targetPlan) {
      targetPlan = new DailyPlan({
        userId,
        date: targetDateStr,
        wakeUpTime: currentPlan.wakeUpTime,
        sleepTime: currentPlan.sleepTime,
        energyLevel: currentPlan.energyLevel,
        tasks: [],
      });
    }

    const copiedTask = {
      taskId: `resched_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: task.title,
      description: task.description,
      startTime: newTime || task.startTime || "09:00",
      endTime: task.endTime,
      duration: task.duration,
      priority: task.priority,
      type: task.type,
      reason: task.reason,
      breakAfter: task.breakAfter,
      reminderOption: task.reminderOption,
      reminderTime: newTime || task.startTime || "09:00",
      reminderMessage: task.reminderMessage,
      status: "pending",
      rescheduledFrom: date,
      postponedCount: (task.postponedCount || 0),
      aiGenerated: task.aiGenerated,
      userModified: true,
    };

    targetPlan.tasks.push(copiedTask);
    updateCompletionPercentage(targetPlan);
    await targetPlan.save();

    return res.status(200).json({
      success: true,
      message: `Task rescheduled to ${targetDateStr}!`,
      data: currentPlan,
      targetPlan,
    });
  } catch (error) {
    console.error("Reschedule Task Error:", error);
    return res.status(500).json({ success: false, message: "Failed to reschedule task." });
  }
};

/**
 * @desc    Delete a task from a daily plan
 * @route   DELETE /api/neuroplan/task/:taskId
 * @access  Private
 */
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date query parameter is required." });
    }

    const plan = await DailyPlan.findOne({ userId, date });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found for given date." });
    }

    plan.tasks = plan.tasks.filter((t) => t.taskId !== taskId && t._id.toString() !== taskId);

    updateCompletionPercentage(plan);
    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Task removed from daily plan.",
      data: plan,
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete task." });
  }
};

/**
 * @desc    Submit End-of-Day Reflection & get AI guidance
 * @route   POST /api/neuroplan/:id/reflect
 * @access  Private
 */
exports.submitReflection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { userNotes } = req.body;

    const plan = await DailyPlan.findOne({ _id: id, userId });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Daily plan not found." });
    }

    const totalCount = plan.tasks.filter((t) => t.type !== "break").length;
    const completedCount = plan.tasks.filter((t) => t.type !== "break" && t.status === "completed").length;
    const postponedCount = plan.tasks.filter((t) => t.status === "rescheduled" || (t.postponedCount || 0) > 0).length;

    const reflectionInsights = await neuroPlanAiService.generateReflectionInsights({
      userNotes,
      completedCount,
      totalCount,
      postponedCount,
      userRole: req.user.role || "Student",
    });

    plan.reflection = reflectionInsights;
    await plan.save();

    return res.status(200).json({
      success: true,
      message: "🌙 Daily reflection saved successfully!",
      data: plan,
    });
  } catch (error) {
    console.error("Submit Reflection Error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit daily reflection." });
  }
};

/**
 * @desc    Get historical pattern analytics for learning from previous days
 * @route   GET /api/neuroplan/history/analytics
 * @access  Private
 */
exports.getHistoricalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const plans = await DailyPlan.find({ userId }).sort({ date: -1 }).limit(14).lean();

    let totalTasks = 0;
    let completedTasks = 0;
    let totalPostponed = 0;
    const typeCounts = {};
    const postponedTypeCounts = {};

    plans.forEach((plan) => {
      (plan.tasks || []).forEach((t) => {
        if (t.type === "break") return;
        totalTasks++;
        if (t.status === "completed") completedTasks++;
        if (t.status === "rescheduled" || (t.postponedCount || 0) > 0) totalPostponed++;

        const type = t.type || "other";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        if (t.postponedCount > 0) {
          postponedTypeCounts[type] = (postponedTypeCounts[type] || 0) + 1;
        }
      });
    });

    const averageCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalPlansLogged: plans.length,
        totalTasks,
        completedTasks,
        totalPostponed,
        averageCompletionRate,
        typeCounts,
        postponedTypeCounts,
      },
    });
  } catch (error) {
    console.error("Get Historical Analytics Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load historical analytics." });
  }
};
