const Journal = require("../models/Journal");
const JournalAnalysis = require("../models/JournalAnalysis");
const MoodTracker = require("../models/MoodTracker");
const {
  analyzeJournalText,
  analyzeMultiJournalText,
  analyzeWeeklyReflectionText,
} = require("../services/journalAiService");

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Private
exports.createJournalEntry = async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Journal title is required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Journal content is required.",
      });
    }

    // Run AI Analysis immediately on submission
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeJournalText(title.trim(), content.trim());
    } catch (aiErr) {
      console.error("AI Analysis generation error during create:", aiErr);
    }

    const journal = await Journal.create({
      userId: req.user._id,
      title: title.trim(),
      content: content.trim(),
      mood: mood ? mood.trim() : aiAnalysis?.emotion || "",
      analysis: aiAnalysis,
    });

    // Also upsert legacy JournalAnalysis model for backward compatibility
    if (aiAnalysis) {
      try {
        await JournalAnalysis.create({
          journalEntryId: journal._id,
          userId: req.user._id,
          emotion: aiAnalysis.emotion || "Calm",
          sentiment: aiAnalysis.sentiment || "neutral",
          themes: aiAnalysis.keyThemes || aiAnalysis.themes || [],
          reflection: aiAnalysis.summary || aiAnalysis.reflection || "Journal reflection",
          suggestion: aiAnalysis.suggestion || "Take a quiet rest break.",
          analyzedAt: new Date(),
        });
      } catch (legacyErr) {
        console.error("Legacy JournalAnalysis sync error:", legacyErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Journal entry created and analyzed successfully.",
      data: journal,
    });
  } catch (error) {
    console.error("Create Journal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating journal entry.",
      error: error.message,
    });
  }
};

// @desc    Get all journal entries for logged-in user (with optional search and mood filters)
// @route   GET /api/journal
// @access  Private
exports.getJournalEntries = async (req, res) => {
  try {
    const { search, mood } = req.query;

    // Strict ownership validation - user can only see their own journal entries
    const query = { userId: req.user._id };

    if (mood && mood !== "All" && mood.trim() !== "") {
      query.mood = mood.trim();
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
      ];
    }

    const entries = await Journal.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Get Journal Entries Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching journal entries.",
      error: error.message,
    });
  }
};

// @desc    Get single journal entry by ID
// @route   GET /api/journal/:id
// @access  Private
exports.getJournalEntryById = async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id, // Enforce ownership
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found or unauthorized access.",
      });
    }

    return res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Get Journal Entry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching journal entry.",
      error: error.message,
    });
  }
};

// @desc    Update an existing journal entry
// @route   PUT /api/journal/:id
// @access  Private
exports.updateJournalEntry = async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Journal title is required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Journal content is required.",
      });
    }

    // Verify ownership before updating
    const entry = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found or unauthorized access.",
      });
    }

    entry.title = title.trim();
    entry.content = content.trim();
    entry.mood = mood !== undefined ? mood.trim() : entry.mood;

    const updatedEntry = await entry.save();

    return res.status(200).json({
      success: true,
      message: "Journal entry updated successfully.",
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Update Journal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating journal entry.",
      error: error.message,
    });
  }
};

// @desc    Delete a journal entry (and associated AI analysis if present)
// @route   DELETE /api/journal/:id
// @access  Private
exports.deleteJournalEntry = async (req, res) => {
  try {
    // Verify ownership before deleting
    const deletedEntry = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found or unauthorized access.",
      });
    }

    // Delete corresponding analysis if present
    await JournalAnalysis.findOneAndDelete({
      journalEntryId: req.params.id,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Journal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting journal entry.",
      error: error.message,
    });
  }
};

// @desc    Get AI analysis for a specific journal entry
// @route   GET /api/journal/:id/analysis
// @access  Private
exports.getJournalAnalysis = async (req, res) => {
  try {
    const journalId = req.params.id;
    const userId = req.user._id;

    // Verify journal entry ownership first
    const entry = await Journal.findOne({ _id: journalId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found or unauthorized access.",
      });
    }

    const analysis = await JournalAnalysis.findOne({ journalEntryId: journalId, userId });

    return res.status(200).json({
      success: true,
      data: analysis || null,
    });
  } catch (error) {
    console.error("Get Journal Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching journal analysis.",
      error: error.message,
    });
  }
};

// @desc    Analyze a specific journal entry with AI and save analysis to DB
// @route   POST /api/journal/analyze OR POST /api/journal/:id/analyze
// @access  Private
exports.analyzeJournalEntry = async (req, res) => {
  try {
    const journalId = req.params.id || req.body.journalId;
    const userId = req.user._id;
    const { title, content, forceReanalyze } = req.body;

    let entry = null;

    if (journalId) {
      entry = await Journal.findOne({ _id: journalId, userId });
    }

    let targetTitle = title;
    let targetContent = content;

    if (entry) {
      targetTitle = targetTitle || entry.title;
      targetContent = targetContent || entry.content;
    }

    if (!targetContent || targetContent.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Journal entry content is too short for AI analysis.",
      });
    }

    // Check if analysis already exists unless force re-analyze is requested
    if (entry && entry.analysis && !forceReanalyze) {
      return res.status(200).json({
        success: true,
        message: "Existing AI analysis retrieved.",
        data: entry.analysis,
        journal: entry,
      });
    }

    // Call AI Service
    const aiResult = await analyzeJournalText(targetTitle || "Journal Entry", targetContent);

    if (entry) {
      entry.analysis = aiResult;
      await entry.save();

      // Upsert legacy JournalAnalysis
      await JournalAnalysis.findOneAndUpdate(
        { journalEntryId: entry._id, userId },
        {
          userId,
          journalEntryId: entry._id,
          emotion: aiResult.emotion || "Calm",
          sentiment: aiResult.sentiment || "neutral",
          themes: aiResult.keyThemes || aiResult.themes || [],
          reflection: aiResult.summary || aiResult.reflection || "Journal reflection",
          suggestion: aiResult.suggestion || "Take a rest break.",
          analyzedAt: new Date(),
        },
        { new: true, upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Journal entry analyzed successfully with AI.",
        data: aiResult,
        journal: entry,
      });
    } else {
      // Create new journal entry with analysis
      const newJournal = await Journal.create({
        userId,
        title: (targetTitle || "Journal Entry").trim(),
        content: targetContent.trim(),
        mood: aiResult.emotion || "Calm",
        analysis: aiResult,
      });

      return res.status(201).json({
        success: true,
        message: "Journal entry created and analyzed successfully.",
        data: aiResult,
        journal: newJournal,
      });
    }
  } catch (error) {
    console.error("Analyze Journal Entry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to analyze this Journal right now.",
      error: error.message,
    });
  }
};

// @desc    Get aggregated analytics & structured emotional trends for user's journal entries
// @route   GET /api/journal/analytics
// @access  Private
exports.getJournalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = "7days" } = req.query;

    let startDate = new Date();
    if (period === "7days" || period === "7d" || period === "last7") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "30days" || period === "30d" || period === "last30") {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // All time
      startDate = new Date(0);
    }

    // Query journal entries for user in date range
    const entries = await Journal.find({
      userId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 }); // Ascending order for chart timeline

    if (!entries || entries.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          period,
          hasData: false,
          totalEntries: 0,
          moodTrend: [],
          emotionDistribution: { happy: 0, calm: 0, tired: 0, stressed: 0 },
          keyThemes: [],
          latestAnalysis: null,
          emotionalPatternSummary: "No journal entries found for this time period. Write a few journal entries to start discovering your emotional patterns.",
        },
      });
    }

    // Process entries & compile chart analytics dynamically from MongoDB
    const moodTrend = [];
    let happyTotal = 0;
    let calmTotal = 0;
    let tiredTotal = 0;
    let stressedTotal = 0;
    const themeCounts = {};
    let latestAnalysis = null;
    const { generateJournalFallback } = require("../services/journalAiService");

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      let analysis = entry.analysis;

      // If entry does not have stored analysis, compute fallback analysis on-the-fly so charts render real data
      if (!analysis || typeof analysis.moodScore !== "number") {
        analysis = generateJournalFallback(entry.title || "", entry.content || "");
      }

      latestAnalysis = analysis;

      // Format date for chart X-axis e.g. "Sep 20"
      const dateLabel = new Date(entry.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      moodTrend.push({
        date: dateLabel,
        score: analysis.moodScore || 5,
        rawDate: entry.createdAt,
        title: entry.title,
      });

      if (analysis.emotions) {
        happyTotal += analysis.emotions.happy || 0;
        calmTotal += analysis.emotions.calm || 0;
        tiredTotal += analysis.emotions.tired || 0;
        stressedTotal += analysis.emotions.stressed || 0;
      }

      const themesToCount = analysis.keyThemes || analysis.themes || [];
      if (Array.isArray(themesToCount)) {
        themesToCount.forEach((t) => {
          if (t) {
            const key = t.toLowerCase().trim();
            themeCounts[key] = (themeCounts[key] || 0) + 1;
          }
        });
      }
    }

    // Calculate emotion percentages
    const totalEmotionSum = happyTotal + calmTotal + tiredTotal + stressedTotal;
    let emotionDistribution = {
      happy: 0,
      calm: 0,
      tired: 0,
      stressed: 0,
    };

    if (totalEmotionSum > 0) {
      let happyPct = Math.round((happyTotal / totalEmotionSum) * 100);
      let calmPct = Math.round((calmTotal / totalEmotionSum) * 100);
      let tiredPct = Math.round((tiredTotal / totalEmotionSum) * 100);
      let stressedPct = 100 - (happyPct + calmPct + tiredPct);
      if (stressedPct < 0) stressedPct = 0;

      emotionDistribution = {
        happy: happyPct,
        calm: calmPct,
        tired: tiredPct,
        stressed: stressedPct,
      };
    }

    // Sort themes by count
    const keyThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme.charAt(0).toUpperCase() + theme.slice(1))
      .slice(0, 6);

    if (keyThemes.length === 0) {
      keyThemes.push("Productivity", "Studies", "Family", "Social Life", "Sleep");
    }

    // Calculate average mood score
    const avgMoodScore = (
      moodTrend.reduce((acc, curr) => acc + curr.score, 0) / (moodTrend.length || 1)
    ).toFixed(1);

    // Generate dynamic emotional pattern summary
    let emotionalPatternSummary = "";
    const periodLabel = period === "7days" ? "this week" : period === "30days" ? "this month" : "across your journal entries";

    if (avgMoodScore >= 7) {
      emotionalPatternSummary = `Your journal entries show mostly positive emotional patterns ${periodLabel}. Stress indicators remained low while your overall mood averaged ${avgMoodScore}/10.`;
    } else if (avgMoodScore <= 4.5) {
      emotionalPatternSummary = `Your journal entries reflect heightened stress indicators and mild tiredness ${periodLabel}, with an average mood score of ${avgMoodScore}/10.`;
    } else {
      emotionalPatternSummary = `Your journal entries show balanced emotional patterns ${periodLabel}. Mood scores averaged ${avgMoodScore}/10 with steady daily reflection.`;
    }

    return res.status(200).json({
      success: true,
      data: {
        period,
        hasData: true,
        totalEntries: entries.length,
        avgMoodScore,
        moodTrend,
        emotionDistribution,
        keyThemes,
        latestAnalysis,
        emotionalPatternSummary,
      },
    });
  } catch (error) {
    console.error("Get Journal Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load emotional insights.",
      error: error.message,
    });
  }
};

// @desc    Get aggregated multi-entry AI journal insights for logged-in user
// @route   GET /api/journal/insights
// @access  Private
exports.getJournalInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's recent journal entries sorted by newest first (limit to recent 30 entries)
    const entries = await Journal.find({ userId }).sort({ createdAt: -1 }).limit(30);
    const analyses = await JournalAnalysis.find({ userId }).sort({ analyzedAt: -1 });

    // Fetch user's latest Mood Tracker entry
    const latestMoodEntry = await MoodTracker.findOne({ studentId: userId }).sort({ createdAt: -1 });

    if (!entries || entries.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasData: false,
          totalEntries: 0,
          dominantEmotion: "None",
          mostFrequentEmotion: "None",
          commonEmotions: [],
          emotionalTrend: [],
          commonThemes: [],
          mostCommonTheme: "None",
          recurringThemes: [],
          recurringPattern: {
            title: "🔍 Recurring Pattern",
            patternText: "No journal entries created yet. Write your first reflection!",
          },
          recentPatternMessage: "No journal entries created yet. Write your first reflection!",
          overallSentimentTrend: "Neutral",
          mostFrequentSentiment: "Neutral",
          aiInsight: "Start writing journal reflections to unlock personalized AI insights across your history.",
          personalizedRecommendation: "Take a quiet moment today to log how your study session went.",
          weeklyReflection: {
            hasSufficientData: false,
            entryCount: 0,
            mostCommonEmotion: "None",
            commonThemes: [],
            overallSentiment: "Neutral",
            reflection: "Write more journal entries this week to unlock your AI weekly reflection insights!",
            suggestion: "Start by logging how your day went in a short entry.",
          },
          moodTrackerCorrelation: null,
        },
      });
    }

    // Call multi-entry AI Service
    const multiResult = await analyzeMultiJournalText(entries, analyses);

    // Mood Tracker correlation check
    let moodTrackerCorrelation = null;
    if (latestMoodEntry) {
      const journalEmoNorm = (multiResult.dominantEmotion || "").toLowerCase();
      const trackerMoodNorm = (latestMoodEntry.mood || "").toLowerCase();

      const isSimilar =
        journalEmoNorm === trackerMoodNorm ||
        ((journalEmoNorm.includes("stress") || journalEmoNorm.includes("anx") || journalEmoNorm.includes("sad")) &&
          (trackerMoodNorm.includes("stress") || trackerMoodNorm.includes("anx") || trackerMoodNorm.includes("sad"))) ||
        ((journalEmoNorm.includes("happy") || journalEmoNorm.includes("calm")) &&
          (trackerMoodNorm.includes("happy") || trackerMoodNorm.includes("calm")));

      moodTrackerCorrelation = {
        journalEmotion: multiResult.dominantEmotion,
        moodTrackerMood: latestMoodEntry.mood,
        hasCorrelation: isSimilar,
        correlationMessage: isSimilar
          ? "Your recent journal entries and mood check-ins show a similar emotional pattern."
          : `Recent Journal: ${multiResult.dominantEmotion} | Mood Tracker: ${latestMoodEntry.mood}`,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        ...multiResult,
        // Backward compatibility properties for existing UI bindings
        mostFrequentEmotion: multiResult.dominantEmotion,
        mostFrequentSentiment: multiResult.overallSentimentTrend,
        mostCommonTheme: multiResult.commonThemes[0] || "Daily reflection",
        recentPatternMessage: multiResult.recurringPattern?.patternText || "",
        moodTrackerCorrelation,
      },
    });
  } catch (error) {
    console.error("Get Journal Insights Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching journal insights.",
      error: error.message,
    });
  }
};

// @desc    Get weekly AI reflection for logged-in user (approx last 7 days window)
// @route   GET /api/journal/weekly-reflection
// @access  Private
exports.getWeeklyJournalReflection = async (req, res) => {
  try {
    const userId = req.user._id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await Journal.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });

    const analyses = await JournalAnalysis.find({
      userId,
      analyzedAt: { $gte: sevenDaysAgo },
    }).sort({ analyzedAt: -1 });

    const weeklyResult = await analyzeWeeklyReflectionText(entries, analyses);

    return res.status(200).json({
      success: true,
      data: weeklyResult,
    });
  } catch (error) {
    console.error("Get Weekly Journal Reflection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching weekly journal reflection.",
      error: error.message,
    });
  }
};

