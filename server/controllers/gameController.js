const GameResult = require("../models/GameResult");

// Helper function to calculate earned points
const calculatePoints = (score, accuracy, difficulty) => {
  const mult = difficulty === "Hard" ? 2 : difficulty === "Medium" ? 1.5 : 1;
  const base = score * 2 + accuracy;
  return Math.round(base * mult);
};

// Helper function to evaluate user achievements/badges
const evaluateBadges = (results) => {
  const badges = [];
  if (!results || results.length === 0) return badges;

  // 🏆 First Game
  if (results.length >= 1) {
    badges.push({
      id: "first-game",
      title: "First Game",
      icon: "🏆",
      description: "Completed your first cognitive game or memory exercise",
      unlockedAt: results[results.length - 1].createdAt,
    });
  }

  // 🎯 Accuracy Expert
  const hasPerfectAccuracy = results.some((r) => r.accuracy === 100);
  if (hasPerfectAccuracy) {
    badges.push({
      id: "accuracy-expert",
      title: "Accuracy Expert",
      icon: "🎯",
      description: "Achieved 100% accuracy in a challenge",
    });
  }

  // 🧠 Memory Master
  const highMemoryEx = results.some(
    (r) => r.category === "memory" && r.accuracy >= 90
  );
  if (highMemoryEx) {
    badges.push({
      id: "memory-master",
      title: "Memory Master",
      icon: "🧠",
      description: "Scored 90%+ accuracy in a Memory Exercise",
    });
  }

  // ⚡ Quick Thinker
  const quickResponse = results.some(
    (r) =>
      (r.gameType === "quick-thinking" || r.gameType === "attention-challenge") &&
      r.timeTaken <= 20 &&
      r.score >= 80
  );
  if (quickResponse) {
    badges.push({
      id: "quick-thinker",
      title: "Quick Thinker",
      icon: "⚡",
      description: "Completed a speed challenge in under 20 seconds with high score",
    });
  }

  // 🔥 3-Day Streak check
  const uniqueDates = [
    ...new Set(
      results.map((r) => new Date(r.completedAt || r.createdAt).toISOString().split("T")[0])
    ),
  ].sort((a, b) => (a < b ? 1 : -1));

  let streak = 0;
  if (uniqueDates.length > 0) {
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let checkDate = uniqueDates.includes(todayStr) ? new Date() : yesterdayDate;
      while (true) {
        const dStr = checkDate.toISOString().split("T")[0];
        if (uniqueDates.includes(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  if (streak >= 3) {
    badges.push({
      id: "3-day-streak",
      title: "3-Day Streak",
      icon: "🔥",
      description: "Played cognitive challenges for 3 consecutive days",
    });
  }

  return badges;
};

// @desc    Save game result for authenticated student
// @route   POST /api/games/results
// @access  Private (Student)
exports.saveGameResult = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      gameType,
      category,
      difficulty = "Easy",
      score = 0,
      accuracy = 0,
      correctAnswers = 0,
      wrongAnswers = 0,
      timeTaken = 0,
    } = req.body;

    if (!gameType || !category) {
      return res.status(400).json({
        success: false,
        message: "gameType and category are required fields.",
      });
    }

    const pointsEarned = calculatePoints(score, accuracy, difficulty);

    const gameResult = new GameResult({
      userId,
      gameType,
      category,
      difficulty,
      score: Math.round(score),
      accuracy: Math.round(accuracy),
      correctAnswers: Number(correctAnswers),
      wrongAnswers: Number(wrongAnswers),
      timeTaken: Number(timeTaken),
      pointsEarned,
      completedAt: new Date(),
    });

    await gameResult.save();

    return res.status(201).json({
      success: true,
      message: "Game result saved successfully.",
      data: gameResult,
    });
  } catch (error) {
    console.error("Save Game Result Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save game result: " + error.message,
    });
  }
};

// @desc    Get user's game results and aggregate stats
// @route   GET /api/games/results
// @access  Private (Student)
exports.getUserGameResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    const results = await GameResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(limit)
      .lean();

    const allResults = await GameResult.find({ userId }).lean();

    const totalGamesPlayed = allResults.length;
    const totalPoints = allResults.reduce((acc, r) => acc + (r.pointsEarned || 0), 0);
    const totalTimeTaken = allResults.reduce((acc, r) => acc + (r.timeTaken || 0), 0);

    let averageScore = 0;
    let averageAccuracy = 0;
    let bestScore = 0;

    if (totalGamesPlayed > 0) {
      const sumScore = allResults.reduce((acc, r) => acc + r.score, 0);
      const sumAccuracy = allResults.reduce((acc, r) => acc + r.accuracy, 0);
      averageScore = Math.round(sumScore / totalGamesPlayed);
      averageAccuracy = Math.round(sumAccuracy / totalGamesPlayed);
      bestScore = Math.max(...allResults.map((r) => r.score));
    }

    // Cognitive vs Memory breakdown
    const cognitiveResults = allResults.filter((r) => r.category === "cognitive");
    const memoryResults = allResults.filter((r) => r.category === "memory");

    const cognitiveStats = {
      totalPlayed: cognitiveResults.length,
      avgScore: cognitiveResults.length
        ? Math.round(cognitiveResults.reduce((a, r) => a + r.score, 0) / cognitiveResults.length)
        : 0,
      avgAccuracy: cognitiveResults.length
        ? Math.round(cognitiveResults.reduce((a, r) => a + r.accuracy, 0) / cognitiveResults.length)
        : 0,
    };

    const memoryStats = {
      totalPlayed: memoryResults.length,
      avgScore: memoryResults.length
        ? Math.round(memoryResults.reduce((a, r) => a + r.score, 0) / memoryResults.length)
        : 0,
      avgAccuracy: memoryResults.length
        ? Math.round(memoryResults.reduce((a, r) => a + r.accuracy, 0) / memoryResults.length)
        : 0,
    };

    // Calculate streak
    const uniqueDates = [
      ...new Set(
        allResults.map((r) => new Date(r.completedAt || r.createdAt).toISOString().split("T")[0])
      ),
    ].sort((a, b) => (a < b ? 1 : -1));

    let currentStreak = 0;
    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

      if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
        let checkDate = uniqueDates.includes(todayStr) ? new Date() : yesterdayDate;
        while (true) {
          const dStr = checkDate.toISOString().split("T")[0];
          if (uniqueDates.includes(dStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Calculate level based on points
    let level = 1;
    let levelTitle = "Novice Thinker";
    if (totalPoints >= 3000) {
      level = 5;
      levelTitle = "Memory Titan";
    } else if (totalPoints >= 1500) {
      level = 4;
      levelTitle = "Cognitive Master";
    } else if (totalPoints >= 700) {
      level = 3;
      levelTitle = "Focus Strategist";
    } else if (totalPoints >= 250) {
      level = 2;
      levelTitle = "Mind Explorer";
    }

    const badges = evaluateBadges(allResults);

    return res.status(200).json({
      success: true,
      data: {
        results,
        stats: {
          totalGamesPlayed,
          averageScore,
          averageAccuracy,
          bestScore,
          totalPoints,
          totalTimeTaken,
          currentStreak,
          level,
          levelTitle,
          badges,
          cognitiveStats,
          memoryStats,
        },
      },
    });
  } catch (error) {
    console.error("Get User Game Results Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load game results: " + error.message,
    });
  }
};

// @desc    Get user's game results for a specific game type
// @route   GET /api/games/results/:gameType
// @access  Private (Student)
exports.getGameResultsByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameType } = req.params;

    const results = await GameResult.find({ userId, gameType })
      .sort({ completedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get Game Results By Type Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load game history for type: " + error.message,
    });
  }
};
