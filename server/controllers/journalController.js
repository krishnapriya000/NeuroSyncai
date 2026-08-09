const Journal = require("../models/Journal");

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

// @desc    Delete a journal entry
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
