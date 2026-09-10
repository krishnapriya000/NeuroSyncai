const Journal = require("../models/Journal");
const JournalAnalysis = require("../models/JournalAnalysis");
const MoodTracker = require("../models/MoodTracker");
const { analyzeJournalText } = require("../services/journalAiService");

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

    const journal = await Journal.create({
      userId: req.user._id,
      title: title.trim(),
      content: content.trim(),
      mood: mood ? mood.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Journal entry created successfully.",
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
// @route   POST /api/journal/:id/analyze
// @access  Private
exports.analyzeJournalEntry = async (req, res) => {
  try {
    const journalId = req.params.id;
    const userId = req.user._id;
    const { forceReanalyze } = req.body;

    // Validate ownership
    const entry = await Journal.findOne({ _id: journalId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found or unauthorized access.",
      });
    }

    if (!entry.content || entry.content.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Journal entry content is too short for AI analysis.",
      });
    }

    // Check if analysis already exists unless force re-analyze is requested
    if (!forceReanalyze) {
      const existingAnalysis = await JournalAnalysis.findOne({ journalEntryId: journalId, userId });
      if (existingAnalysis) {
        return res.status(200).json({
          success: true,
          message: "Existing AI analysis retrieved.",
          data: existingAnalysis,
        });
      }
    }

    // Call AI Service
    const aiResult = await analyzeJournalText(entry.title, entry.content);

    // Save or update in MongoDB
    const analysis = await JournalAnalysis.findOneAndUpdate(
      { journalEntryId: journalId, userId },
      {
        userId,
        journalEntryId: journalId,
        emotion: aiResult.emotion,
        sentiment: aiResult.sentiment,
        themes: aiResult.themes,
        reflection: aiResult.reflection,
        suggestion: aiResult.suggestion,
        analyzedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Journal entry analyzed successfully with AI.",
      data: analysis,
    });
  } catch (error) {
    console.error("Analyze Journal Entry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to analyze this entry right now. Please try again.",
      error: error.message,
    });
  }
};

// @desc    Get aggregated journal insights, weekly reflections, recurring themes, and mood tracker check
// @route   GET /api/journal/insights
// @access  Private
exports.getJournalInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's journal entries sorted by newest first
    const entries = await Journal.find({ userId }).sort({ createdAt: -1 });
    const totalEntries = entries.length;

    // Fetch user's journal analyses
    const analyses = await JournalAnalysis.find({ userId }).sort({ analyzedAt: -1 });

    // Fetch user's latest Mood Tracker entry
    const latestMoodEntry = await MoodTracker.findOne({ studentId: userId }).sort({ createdAt: -1 });

    if (totalEntries === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalEntries: 0,
          mostFrequentEmotion: "None",
          mostFrequentSentiment: "Neutral",
          mostCommonTheme: "None",
          recentPatternMessage: "No journal entries created yet. Write your first reflection!",
          weeklyReflection: {
            hasSufficientData: false,
            entryCount: 0,
            mostCommonEmotion: "None",
            commonThemes: [],
            overallSentiment: "Neutral",
            reflection: "Write more journal entries this week to unlock your AI weekly reflection insights!",
            suggestion: "Start by logging how your day went in a short entry.",
          },
          recurringThemes: [],
          moodTrackerCorrelation: null,
        },
      });
    }

    // Calculate emotion frequencies (from analyses + journal entries)
    const emotionCounts = {};
    const sentimentCounts = {};
    const themeCounts = {};

    analyses.forEach((a) => {
      if (a.emotion) emotionCounts[a.emotion] = (emotionCounts[a.emotion] || 0) + 1;
      if (a.sentiment) sentimentCounts[a.sentiment] = (sentimentCounts[a.sentiment] || 0) + 1;
      if (Array.isArray(a.themes)) {
        a.themes.forEach((t) => {
          if (t && t.trim()) themeCounts[t.trim()] = (themeCounts[t.trim()] || 0) + 1;
        });
      }
    });

    // Fallback counts from raw journal moods if analyses are few
    entries.forEach((e) => {
      if (e.mood && e.mood.trim()) {
        const m = e.mood.trim();
        emotionCounts[m] = (emotionCounts[m] || 0) + 1;
      }
    });

    // Most Frequent Emotion
    let mostFrequentEmotion = "Neutral";
    let maxEmoCount = 0;
    Object.entries(emotionCounts).forEach(([emo, count]) => {
      if (count > maxEmoCount) {
        maxEmoCount = count;
        mostFrequentEmotion = emo;
      }
    });

    // Most Frequent Sentiment
    let mostFrequentSentiment = "Neutral";
    let maxSentCount = 0;
    Object.entries(sentimentCounts).forEach(([sent, count]) => {
      if (count > maxSentCount) {
        maxSentCount = count;
        mostFrequentSentiment = sent;
      }
    });
    if (maxSentCount === 0 && (mostFrequentEmotion === "Stressed" || mostFrequentEmotion === "Sad" || mostFrequentEmotion === "Anxious")) {
      mostFrequentSentiment = "Negative";
    } else if (maxSentCount === 0 && (mostFrequentEmotion === "Happy" || mostFrequentEmotion === "Calm")) {
      mostFrequentSentiment = "Positive";
    }

    // Formatted Recurring Themes list
    const recurringThemes = Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);

    const mostCommonTheme = recurringThemes.length > 0 ? recurringThemes[0].theme : "General Reflection";

    // Recent Pattern Description
    let recentPatternMessage = "";
    if (mostFrequentEmotion === "Stressed" || mostFrequentEmotion === "Anxious") {
      recentPatternMessage = "Stress-related emotions appeared frequently in your recent journal entries.";
    } else if (mostFrequentEmotion === "Happy" || mostFrequentEmotion === "Calm") {
      recentPatternMessage = "Positive and encouraging emotional patterns were frequently reflected in your entries.";
    } else if (mostFrequentEmotion === "Tired") {
      recentPatternMessage = "Rest and fatigue-related themes appeared consistently in your reflections.";
    } else {
      recentPatternMessage = "Your recent reflections show a balanced mix of daily thoughts and experiences.";
    }

    // Weekly Reflection (Recent 7 days window)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyEntries = entries.filter((e) => new Date(e.createdAt) >= sevenDaysAgo);
    const weeklyAnalyses = analyses.filter((a) => new Date(a.analyzedAt) >= sevenDaysAgo);

    const weeklyEmotionCounts = {};
    const weeklyThemeCounts = {};

    weeklyAnalyses.forEach((a) => {
      if (a.emotion) weeklyEmotionCounts[a.emotion] = (weeklyEmotionCounts[a.emotion] || 0) + 1;
      if (Array.isArray(a.themes)) {
        a.themes.forEach((t) => {
          if (t) weeklyThemeCounts[t] = (weeklyThemeCounts[t] || 0) + 1;
        });
      }
    });
    weeklyEntries.forEach((e) => {
      if (e.mood) weeklyEmotionCounts[e.mood] = (weeklyEmotionCounts[e.mood] || 0) + 1;
    });

    let weeklyTopEmotion = mostFrequentEmotion;
    let maxWkEmo = 0;
    Object.entries(weeklyEmotionCounts).forEach(([emo, count]) => {
      if (count > maxWkEmo) {
        maxWkEmo = count;
        weeklyTopEmotion = emo;
      }
    });

    const weeklyThemesList = Object.entries(weeklyThemeCounts)
      .map(([theme, count]) => theme)
      .slice(0, 3);

    if (weeklyThemesList.length === 0) {
      if (recurringThemes.length > 0) {
        weeklyThemesList.push(recurringThemes[0].theme);
      } else {
        weeklyThemesList.push("Academic workload", "Concentration");
      }
    }

    const hasSufficientData = weeklyEntries.length >= 1;

    let weeklyReflectionText = "";
    let weeklySuggestionText = "";

    if (weeklyTopEmotion === "Stressed" || weeklyTopEmotion === "Anxious") {
      weeklyReflectionText = `Your recent entries show that academic workload and concentration have been recurring sources of pressure over the past 7 days.`;
      weeklySuggestionText = `Try dividing larger academic tasks into smaller goals and use your Focus Timer for structured study sessions.`;
    } else if (weeklyTopEmotion === "Happy" || weeklyTopEmotion === "Calm") {
      weeklyReflectionText = `Your journal reflections over the last 7 days indicate a clear positive rhythm and effective workload management.`;
      weeklySuggestionText = `Continue celebrating small daily wins and maintain your healthy work-rest boundaries.`;
    } else {
      weeklyReflectionText = `You wrote ${weeklyEntries.length} journal entry(ies) this week, keeping a steady record of your academic and personal progress.`;
      weeklySuggestionText = `Take a quiet 5-minute pause each evening to maintain consistency in your journaling habit.`;
    }

    // Mood Tracker correlation check
    let moodTrackerCorrelation = null;
    if (latestMoodEntry) {
      const journalEmoNorm = (weeklyTopEmotion || mostFrequentEmotion || "").toLowerCase();
      const trackerMoodNorm = (latestMoodEntry.mood || "").toLowerCase();

      const isSimilar =
        journalEmoNorm === trackerMoodNorm ||
        ((journalEmoNorm.includes("stress") || journalEmoNorm.includes("anx") || journalEmoNorm.includes("sad")) &&
          (trackerMoodNorm.includes("stress") || trackerMoodNorm.includes("anx") || trackerMoodNorm.includes("sad"))) ||
        ((journalEmoNorm.includes("happy") || journalEmoNorm.includes("calm")) &&
          (trackerMoodNorm.includes("happy") || trackerMoodNorm.includes("calm")));

      moodTrackerCorrelation = {
        journalEmotion: weeklyTopEmotion || mostFrequentEmotion,
        moodTrackerMood: latestMoodEntry.mood,
        hasCorrelation: isSimilar,
        correlationMessage: isSimilar
          ? "Your recent journal entries and mood check-ins show a similar emotional pattern."
          : `Recent Journal: ${weeklyTopEmotion || mostFrequentEmotion} | Mood Tracker: ${latestMoodEntry.mood}`,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        totalEntries,
        mostFrequentEmotion,
        mostFrequentSentiment,
        mostCommonTheme,
        recentPatternMessage,
        weeklyReflection: {
          hasSufficientData,
          entryCount: weeklyEntries.length,
          mostCommonEmotion: weeklyTopEmotion,
          commonThemes: weeklyThemesList,
          overallSentiment: mostFrequentSentiment,
          reflection: weeklyReflectionText,
          suggestion: weeklySuggestionText,
        },
        recurringThemes,
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
