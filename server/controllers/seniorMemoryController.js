const SeniorMemoryExerciseResult = require("../models/SeniorMemoryExerciseResult");

// @desc    Save completed memory exercise result
// @route   POST /api/senior/memory-exercises/results
// @access  Private
exports.saveExerciseResult = async (req, res) => {
  try {
    const {
      exerciseType,
      difficulty,
      score,
      accuracy,
      correctAnswers,
      incorrectAnswers,
      timeTaken,
    } = req.body;

    const userId = req.user._id; // Enforce JWT authenticated ownership

    if (!exerciseType || score === undefined || accuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required memory exercise fields.",
      });
    }

    const result = await SeniorMemoryExerciseResult.create({
      userId,
      exerciseType: exerciseType.trim(),
      difficulty: difficulty || "Easy",
      score: Math.min(100, Math.max(0, Math.round(score))),
      accuracy: Math.min(100, Math.max(0, Math.round(accuracy))),
      correctAnswers: Number(correctAnswers) || 0,
      incorrectAnswers: Number(incorrectAnswers) || 0,
      timeTaken: timeTaken || "00:00",
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Memory exercise result saved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Save Memory Exercise Result Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving memory exercise result.",
      error: error.message,
    });
  }
};

// @desc    Get user's recent memory exercise history
// @route   GET /api/senior/memory-exercises/results
// @access  Private
exports.getExerciseResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const results = await SeniorMemoryExerciseResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get Memory Exercise Results Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching memory exercise results.",
      error: error.message,
    });
  }
};

// @desc    Get user's aggregated memory exercise stats and performance metrics
// @route   GET /api/senior/memory-exercises/stats
// @access  Private
exports.getMemoryStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const results = await SeniorMemoryExerciseResult.find({ userId }).sort({ completedAt: -1 });

    if (!results || results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          exercisesCompleted: 0,
          averageScore: 0,
          averageAccuracy: 0,
          bestScore: 0,
          recentTrend: "No exercises completed yet. Start your first exercise!",
          trendBadge: "New",
        },
      });
    }

    const totalCompleted = results.length;
    const totalScoreSum = results.reduce((acc, r) => acc + (r.score || 0), 0);
    const totalAccuracySum = results.reduce((acc, r) => acc + (r.accuracy || 0), 0);

    const avgScore = Math.round(totalScoreSum / totalCompleted);
    const avgAccuracy = Math.round(totalAccuracySum / totalCompleted);
    const bestScore = Math.max(...results.map((r) => r.score || 0));

    let recentTrend = "Steady performance across exercises.";
    let trendBadge = "↗ Improving";

    if (results.length >= 2) {
      const latestScore = results[0].score;
      const prevScore = results[1].score;
      if (latestScore > prevScore) {
        recentTrend = "Positive progress observed in recent recall exercises.";
        trendBadge = "↗ Improving";
      } else if (latestScore === prevScore) {
        recentTrend = "Consistent recall performance maintained across recent sessions.";
        trendBadge = "→ Consistent";
      } else {
        recentTrend = "Steady engagement. Regular practice builds memory familiarity.";
        trendBadge = "↺ Practicing";
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        exercisesCompleted: totalCompleted,
        averageScore: avgScore,
        averageAccuracy: avgAccuracy,
        bestScore,
        recentTrend,
        trendBadge,
      },
    });
  } catch (error) {
    console.error("Get Memory Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching memory exercise stats.",
      error: error.message,
    });
  }
};
