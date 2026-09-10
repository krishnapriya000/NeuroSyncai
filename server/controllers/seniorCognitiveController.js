const SeniorCognitiveGameResult = require("../models/SeniorCognitiveGameResult");

// @desc    Save completed cognitive game result
// @route   POST /api/senior/cognitive-games/results
// @access  Private
exports.saveGameResult = async (req, res) => {
  try {
    const {
      gameType,
      score,
      accuracy,
      correctAnswers,
      incorrectAnswers,
      timeTaken,
      difficulty,
    } = req.body;

    const userId = req.user._id; // Enforce JWT authenticated ownership

    if (!gameType || score === undefined || accuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required game result fields.",
      });
    }

    const gameResult = await SeniorCognitiveGameResult.create({
      userId,
      gameType: gameType.trim(),
      score: Math.min(100, Math.max(0, Math.round(score))),
      accuracy: Math.min(100, Math.max(0, Math.round(accuracy))),
      correctAnswers: Number(correctAnswers) || 0,
      incorrectAnswers: Number(incorrectAnswers) || 0,
      timeTaken: timeTaken || "00:00",
      difficulty: difficulty || "Easy",
      playedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Cognitive exercise result saved successfully.",
      data: gameResult,
    });
  } catch (error) {
    console.error("Save Game Result Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving game result.",
      error: error.message,
    });
  }
};

// @desc    Get user's recent cognitive game history
// @route   GET /api/senior/cognitive-games/results
// @access  Private
exports.getGameResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const results = await SeniorCognitiveGameResult.find({ userId })
      .sort({ playedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get Game Results Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching game results.",
      error: error.message,
    });
  }
};

// @desc    Get user's aggregated cognitive game stats and performance metrics
// @route   GET /api/senior/cognitive-games/stats
// @access  Private
exports.getGameStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const results = await SeniorCognitiveGameResult.find({ userId }).sort({ playedAt: -1 });

    if (!results || results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalGamesPlayed: 0,
          averageScore: 0,
          averageAccuracy: 0,
          memoryPerformance: 0,
          attentionPerformance: 0,
          numberPerformance: 0,
          recommendedDifficulty: "Easy",
          recentTrend: "No cognitive exercises completed yet. Start your first game!",
        },
      });
    }

    const totalGames = results.length;
    const totalScoreSum = results.reduce((acc, r) => acc + (r.score || 0), 0);
    const totalAccuracySum = results.reduce((acc, r) => acc + (r.accuracy || 0), 0);

    const avgScore = Math.round(totalScoreSum / totalGames);
    const avgAccuracy = Math.round(totalAccuracySum / totalGames);

    // Performance per game type
    const memoryGames = results.filter((r) => r.gameType === "Memory Match");
    const attentionGames = results.filter((r) => r.gameType === "Attention Challenge");
    const numberGames = results.filter((r) => r.gameType === "Number Sequence");

    const memoryPerf = memoryGames.length > 0
      ? Math.round(memoryGames.reduce((acc, r) => acc + r.score, 0) / memoryGames.length)
      : 0;

    const attentionPerf = attentionGames.length > 0
      ? Math.round(attentionGames.reduce((acc, r) => acc + r.score, 0) / attentionGames.length)
      : 0;

    const numberPerf = numberGames.length > 0
      ? Math.round(numberGames.reduce((acc, r) => acc + r.score, 0) / numberGames.length)
      : 0;

    // Difficulty Recommendation Logic (Non-medical threshold)
    let recommendedDifficulty = "Easy";
    if (totalGames >= 3 && avgScore >= 85) {
      recommendedDifficulty = "Medium";
    } else if (totalGames >= 8 && avgScore >= 92) {
      recommendedDifficulty = "Hard";
    }

    // Performance Trend text summary
    let recentTrend = "";
    if (avgScore >= 80) {
      recentTrend = "High consistency and strong accuracy across recent exercises.";
    } else if (avgScore >= 60) {
      recentTrend = "Steady performance trend. Regular practice will boost your confidence.";
    } else {
      recentTrend = "Positive exercise activity logged. Keep practicing whenever you feel ready.";
    }

    return res.status(200).json({
      success: true,
      data: {
        totalGamesPlayed: totalGames,
        averageScore: avgScore,
        averageAccuracy: avgAccuracy,
        memoryPerformance: memoryPerf,
        attentionPerformance: attentionPerf,
        numberPerformance: numberPerf,
        recommendedDifficulty,
        recentTrend,
      },
    });
  } catch (error) {
    console.error("Get Game Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cognitive stats.",
      error: error.message,
    });
  }
};
