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

