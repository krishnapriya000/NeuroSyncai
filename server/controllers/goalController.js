const Goal = require("../models/Goal");

// Helper to get today's date in YYYY-MM-DD format (local time)
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private (Student)
exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      startDate,
      targetDate,
      progress,
    } = req.body;

    // Required Field Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal Title is required.",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (!priority || !priority.trim()) {
      return res.status(400).json({
        success: false,
        message: "Priority is required.",
      });
    }

    if (!startDate || !startDate.trim()) {
      return res.status(400).json({
        success: false,
        message: "Start Date is required.",
      });
    }

    if (!targetDate || !targetDate.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target Date is required.",
      });
    }

    // Date Logic Validation: Start Date cannot be after Target Date
    if (startDate.trim() > targetDate.trim()) {
      return res.status(400).json({
        success: false,
        message: "Start Date cannot be after Target Date.",
      });
    }

    const progressNum = Math.min(100, Math.max(0, Number(progress) || 0));
    const isCompleted = progressNum >= 100;
    const status = isCompleted ? "completed" : "active";

    const newGoal = await Goal.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : "",
      category: category.trim(),
      priority: priority.trim(),
      startDate: startDate.trim(),
      targetDate: targetDate.trim(),
      progress: progressNum,
      status,
      completedAt: isCompleted ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: "Goal created successfully! 🎯",
      data: newGoal,
    });
  } catch (error) {
    console.error("Create Goal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating goal.",
      error: error.message,
    });
  }
};

// @desc    Get all goals for authenticated student (with filtering & search)
// @route   GET /api/goals
// @access  Private (Student)
exports.getGoals = async (req, res) => {
  try {
    const { search, category, priority, status } = req.query;
    const todayStr = getTodayString();

    // Strict ownership enforcement
    const query = { userId: req.user._id };

    // Search filter (title, description, category)
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== "All" && category.trim() !== "") {
      query.category = category.trim();
    }

    // Priority filter
    if (priority && priority !== "All" && priority.trim() !== "") {
      query.priority = priority.trim();
    }

    // Status filter (Active, Completed, Overdue)
    if (status && status !== "All" && status.trim() !== "") {
      const cleanStatus = status.trim().toLowerCase();
      if (cleanStatus === "completed") {
        query.$or = [{ status: "completed" }, { progress: 100 }];
      } else if (cleanStatus === "active") {
        query.status = "active";
        query.progress = { $lt: 100 };
        query.targetDate = { $gte: todayStr };
      } else if (cleanStatus === "overdue") {
        query.status = "active";
        query.progress = { $lt: 100 };
        query.targetDate = { $lt: todayStr };
      }
    }

    // Fetch goals sorted by targetDate asc
    const goals = await Goal.find(query).sort({ targetDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("Get Goals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching goals.",
      error: error.message,
    });
  }
};

// @desc    Get single goal by ID
// @route   GET /api/goals/:id
// @access  Private (Student)
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found or unauthorized access.",
      });
    }

    return res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Get Goal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching goal.",
      error: error.message,
    });
  }
};

// @desc    Update an existing goal
// @route   PUT /api/goals/:id
// @access  Private (Student)
exports.updateGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      startDate,
      targetDate,
      progress,
    } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found or unauthorized access.",
      });
    }

    // Validation
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal Title cannot be empty.",
      });
    }

    if (category !== undefined && !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be empty.",
      });
    }

    if (priority !== undefined && !priority.trim()) {
      return res.status(400).json({
        success: false,
        message: "Priority cannot be empty.",
      });
    }

    const newStart = startDate !== undefined ? startDate.trim() : goal.startDate;
    const newTarget = targetDate !== undefined ? targetDate.trim() : goal.targetDate;

    if (newStart > newTarget) {
      return res.status(400).json({
        success: false,
        message: "Start Date cannot be after Target Date.",
      });
    }

    if (title !== undefined) goal.title = title.trim();
    if (description !== undefined) goal.description = description.trim();
    if (category !== undefined) goal.category = category.trim();
    if (priority !== undefined) goal.priority = priority.trim();
    goal.startDate = newStart;
    goal.targetDate = newTarget;

    if (progress !== undefined) {
      const progressNum = Math.min(100, Math.max(0, Number(progress) || 0));
      goal.progress = progressNum;
      if (progressNum >= 100) {
        goal.status = "completed";
        if (!goal.completedAt) goal.completedAt = new Date();
      } else {
        goal.status = "active";
        goal.completedAt = null;
      }
    }

    const updatedGoal = await goal.save();

    return res.status(200).json({
      success: true,
      message: "Goal updated successfully.",
      data: updatedGoal,
    });
  } catch (error) {
    console.error("Update Goal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating goal.",
      error: error.message,
    });
  }
};

// @desc    Update progress of a goal (0 - 100%)
// @route   PATCH /api/goals/:id/progress
// @access  Private (Student)
exports.updateGoalProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress === undefined || isNaN(progress)) {
      return res.status(400).json({
        success: false,
        message: "Valid progress number between 0 and 100 is required.",
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found or unauthorized access.",
      });
    }

    const progressNum = Math.min(100, Math.max(0, Number(progress)));
    goal.progress = progressNum;

    let message = "Goal progress updated.";

    if (progressNum >= 100) {
      goal.status = "completed";
      if (!goal.completedAt) goal.completedAt = new Date();
      message = "Goal completed! 🎉";
    } else {
      goal.status = "active";
      goal.completedAt = null;
    }

    const updatedGoal = await goal.save();

    return res.status(200).json({
      success: true,
      message,
      data: updatedGoal,
    });
  } catch (error) {
    console.error("Update Goal Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating goal progress.",
      error: error.message,
    });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private (Student)
exports.deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedGoal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found or unauthorized access.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Goal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting goal.",
      error: error.message,
    });
  }
};

// @desc    Get Goal Summary & Metrics for student dashboard/overview
// @route   GET /api/goals/summary
// @access  Private (Student)
exports.getGoalSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayString();

    const allGoals = await Goal.find({ userId });

    const totalCount = allGoals.length;
    const completedGoals = allGoals.filter((g) => g.progress >= 100 || g.status === "completed");
    const completedCount = completedGoals.length;

    const overdueGoals = allGoals.filter((g) => g.progress < 100 && g.targetDate < todayStr);
    const overdueCount = overdueGoals.length;

    const activeGoals = allGoals.filter((g) => g.progress < 100 && g.targetDate >= todayStr);
    const activeCount = activeGoals.length;

    const overallProgressPercent = totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

    // Category-wise progress visualization
    const categoryMap = {};
    allGoals.forEach((g) => {
      const cat = g.category || "Other";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, completed: 0, totalProgress: 0 };
      }
      categoryMap[cat].total += 1;
      categoryMap[cat].totalProgress += g.progress || 0;
      if (g.progress >= 100 || g.status === "completed") {
        categoryMap[cat].completed += 1;
      }
    });

    const categoryProgress = Object.keys(categoryMap).map((cat) => {
      const item = categoryMap[cat];
      const avgProgress = item.total > 0 ? Math.round(item.totalProgress / item.total) : 0;
      return {
        category: cat,
        total: item.total,
        completed: item.completed,
        progress: avgProgress,
      };
    });

    // Upcoming deadlines: next 3–5 active goals sorted by targetDate ascending
    const upcomingDeadlines = allGoals
      .filter((g) => g.progress < 100 && g.targetDate >= todayStr)
      .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
      .slice(0, 5)
      .map((g) => {
        // Calculate days remaining
        const target = new Date(g.targetDate);
        const today = new Date(todayStr);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          _id: g._id,
          title: g.title,
          category: g.category,
          targetDate: g.targetDate,
          progress: g.progress,
          daysRemaining: diffDays >= 0 ? diffDays : 0,
        };
      });

    // Nearest single goal for widget
    const nearestGoal = upcomingDeadlines.length > 0 ? upcomingDeadlines[0] : null;

    return res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        completed: completedCount,
        overdue: overdueCount,
        overallProgress: overallProgressPercent,
        categoryProgress,
        upcomingDeadlines,
        nearestGoal,
      },
    });
  } catch (error) {
    console.error("Get Goal Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while calculating goal summary.",
      error: error.message,
    });
  }
};
