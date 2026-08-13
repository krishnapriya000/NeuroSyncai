const StudyTask = require("../models/StudyTask");

// Helper function to get today's date string YYYY-MM-DD
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get tomorrow's date string YYYY-MM-DD
const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get end of week date string YYYY-MM-DD (7 days from today)
const getEndOfWeekString = () => {
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const year = endOfWeek.getFullYear();
  const month = String(endOfWeek.getMonth() + 1).padStart(2, "0");
  const day = String(endOfWeek.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// @desc    Create a new study task
// @route   POST /api/study-tasks
// @access  Private (Student)
exports.createStudyTask = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      date,
      startTime,
      duration,
      priority,
      category,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task Title is required.",
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    if (!date || !date.trim()) {
      return res.status(400).json({
        success: false,
        message: "Date is required.",
      });
    }

    const validPriorities = ["Low", "Medium", "High"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value.",
      });
    }

    const validCategories = [
      "Study",
      "Assignment",
      "Revision",
      "Exam Preparation",
      "Project",
      "Other",
    ];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category value.",
      });
    }

    const newTask = await StudyTask.create({
      userId: req.user._id,
      title: title.trim(),
      subject: subject.trim(),
      description: description ? description.trim() : "",
      date: date.trim(),
      startTime: startTime ? startTime.trim() : "",
      duration: duration ? duration.trim() : "",
      priority: priority || "Medium",
      category: category || "Study",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Study task added successfully.",
      data: newTask,
    });
  } catch (error) {
    console.error("Create Study Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating study task.",
      error: error.message,
    });
  }
};

// @desc    Get all study tasks for authenticated student
// @route   GET /api/study-tasks
// @access  Private (Student)
exports.getStudyTasks = async (req, res) => {
  try {
    const { search, dateFilter, priority, status, subject, category } = req.query;

    // Strict ownership enforcement
    const query = { userId: req.user._id };

    // Search filter
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
      ];
    }

    // Priority filter
    if (priority && priority !== "All" && priority.trim() !== "") {
      query.priority = priority.trim();
    }

    // Status filter
    if (status && status !== "All" && status.trim() !== "") {
      query.status = status.trim().toLowerCase();
    }

    // Subject filter
    if (subject && subject !== "All" && subject.trim() !== "") {
      query.subject = subject.trim();
    }

    // Category filter
    if (category && category !== "All" && category.trim() !== "") {
      query.category = category.trim();
    }

    // Date Filter logic
    const todayStr = getTodayString();
    if (dateFilter) {
      if (dateFilter === "today") {
        query.date = todayStr;
      } else if (dateFilter === "tomorrow") {
        query.date = getTomorrowString();
      } else if (dateFilter === "this-week") {
        const endOfWeekStr = getEndOfWeekString();
        query.date = { $gte: todayStr, $lte: endOfWeekStr };
      } else if (dateFilter !== "all" && dateFilter.match(/^\d{4}-\d{2}-\d{2}$/)) {
        query.date = dateFilter;
      }
    }

    // Fetch tasks sorted by date asc, startTime asc
    const tasks = await StudyTask.find(query).sort({ date: 1, startTime: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get Study Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching study tasks.",
      error: error.message,
    });
  }
};

// @desc    Get single study task by ID
// @route   GET /api/study-tasks/:id
// @access  Private (Student)
exports.getStudyTaskById = async (req, res) => {
  try {
    const task = await StudyTask.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Study task not found or unauthorized access.",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get Study Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching study task.",
      error: error.message,
    });
  }
};

// @desc    Update study task
// @route   PUT /api/study-tasks/:id
// @access  Private (Student)
exports.updateStudyTask = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      date,
      startTime,
      duration,
      priority,
      category,
      status,
    } = req.body;

    const task = await StudyTask.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Study task not found or unauthorized access.",
      });
    }

    // Validation
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task Title cannot be empty.",
      });
    }

    if (subject !== undefined && !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject cannot be empty.",
      });
    }

    if (date !== undefined && !date.trim()) {
      return res.status(400).json({
        success: false,
        message: "Date cannot be empty.",
      });
    }

    if (title !== undefined) task.title = title.trim();
    if (subject !== undefined) task.subject = subject.trim();
    if (description !== undefined) task.description = description.trim();
    if (date !== undefined) task.date = date.trim();
    if (startTime !== undefined) task.startTime = startTime.trim();
    if (duration !== undefined) task.duration = duration.trim();
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;

    if (status !== undefined) {
      if (status === "completed" && task.status !== "completed") {
        task.status = "completed";
        task.completedAt = new Date();
      } else if (status === "pending") {
        task.status = "pending";
        task.completedAt = null;
      }
    }

    const updatedTask = await task.save();

    return res.status(200).json({
      success: true,
      message: "Study task updated successfully.",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update Study Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating study task.",
      error: error.message,
    });
  }
};

// @desc    Toggle task status (pending / completed)
// @route   PATCH /api/study-tasks/:id/status
// @access  Private (Student)
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await StudyTask.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Study task not found or unauthorized access.",
      });
    }

    const newStatus = req.body.status || (task.status === "completed" ? "pending" : "completed");

    task.status = newStatus;
    if (newStatus === "completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    const updatedTask = await task.save();

    return res.status(200).json({
      success: true,
      message: newStatus === "completed" ? "Task completed! 🎉" : "Task marked as pending.",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Toggle Task Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating task status.",
      error: error.message,
    });
  }
};

// @desc    Delete a study task
// @route   DELETE /api/study-tasks/:id
// @access  Private (Student)
exports.deleteStudyTask = async (req, res) => {
  try {
    const deletedTask = await StudyTask.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Study task not found or unauthorized access.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Study task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Study Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting study task.",
      error: error.message,
    });
  }
};

// @desc    Get summary metrics for student (Today's counts, weekly overview, subject progress)
// @route   GET /api/study-tasks/summary
// @access  Private (Student)
exports.getStudyTaskSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayString();

    const allTasks = await StudyTask.find({ userId });

    const todayTasks = allTasks.filter((t) => t.date === todayStr);
    const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
    const todayPending = todayTasks.filter((t) => t.status === "pending").length;

    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter((t) => t.status === "completed").length;
    const pendingTasksCount = allTasks.filter((t) => t.status === "pending").length;

    const completionRate = totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

    // Subject-wise stats
    const subjectMap = {};
    allTasks.forEach((task) => {
      const subj = task.subject || "General";
      if (!subjectMap[subj]) {
        subjectMap[subj] = { total: 0, completed: 0 };
      }
      subjectMap[subj].total += 1;
      if (task.status === "completed") {
        subjectMap[subj].completed += 1;
      }
    });

    const subjectProgress = Object.keys(subjectMap).map((subj) => {
      const total = subjectMap[subj].total;
      const completed = subjectMap[subj].completed;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        subject: subj,
        total,
        completed,
        progress,
      };
    });

    // Next upcoming task for today or future
    const upcomingPendingTasks = allTasks
      .filter((t) => t.status === "pending" && t.date >= todayStr)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.startTime || "").localeCompare(b.startTime || "");
      });

    const nextUpcomingTask = upcomingPendingTasks.length > 0 ? upcomingPendingTasks[0] : null;

    return res.status(200).json({
      success: true,
      data: {
        today: {
          total: todayTasks.length,
          completed: todayCompleted,
          pending: todayPending,
        },
        overview: {
          total: totalTasksCount,
          completed: completedTasksCount,
          pending: pendingTasksCount,
          completionRate,
        },
        subjectProgress,
        nextUpcomingTask,
      },
    });
  } catch (error) {
    console.error("Get Study Task Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while calculating task summary.",
      error: error.message,
    });
  }
};
