const AIConversation = require("../models/AIConversation");
const StudyTask = require("../models/StudyTask");
const aiService = require("../services/aiService");

/**
 * @desc    Send a message to AI Companion and receive context-aware response
 * @route   POST /api/ai/chat
 * @access  Private (Student)
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty.",
      });
    }

    // Retrieve student context from MongoDB
    const userContext = await aiService.getUserContext(userId);

    // Find or create AI conversation for authenticated student
    let conversation = await AIConversation.findOne({ userId });
    if (!conversation) {
      conversation = new AIConversation({ userId, messages: [] });
    }

    // Add user message to history
    const userMsgObj = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };
    conversation.messages.push(userMsgObj);

    // Generate AI response
    const aiResult = await aiService.generateAIResponse({
      userPrompt: message.trim(),
      userContext,
      history: conversation.messages,
    });

    const assistantMsgObj = {
      role: "assistant",
      content: aiResult.content,
      category: aiResult.category,
      suggestedTasks: aiResult.suggestedTasks || [],
      tasksAdded: false,
      timestamp: new Date(),
    };
    conversation.messages.push(assistantMsgObj);

    await conversation.save();

    // Get updated assistant message with its generated _id
    const savedAssistantMsg = conversation.messages[conversation.messages.length - 1];

    return res.status(200).json({
      success: true,
      data: {
        userMessage: userMsgObj,
        assistantMessage: savedAssistantMsg,
      },
    });
  } catch (error) {
    console.error("AI Companion Chat Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "I'm having trouble connecting right now. Please try again in a moment.",
    });
  }
};

/**
 * @desc    Get authenticated student's conversation history
 * @route   GET /api/ai/chat/history
 * @access  Private (Student)
 */
exports.getConversationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversation = await AIConversation.findOne({ userId });

    return res.status(200).json({
      success: true,
      data: conversation ? conversation.messages : [],
    });
  } catch (error) {
    console.error("Fetch AI Chat History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load chat history.",
    });
  }
};

/**
 * @desc    Clear authenticated student's conversation history
 * @route   DELETE /api/ai/chat/history
 * @access  Private (Student)
 */
exports.clearConversationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    await AIConversation.findOneAndDelete({ userId });

    return res.status(200).json({
      success: true,
      message: "Conversation cleared successfully.",
    });
  } catch (error) {
    console.error("Clear AI Chat History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear conversation history.",
    });
  }
};

/**
 * @desc    Get real-time insights for the student's "Your Current Insights" panel
 * @route   GET /api/ai/insights
 * @access  Private (Student)
 */
exports.getStudentInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const context = await aiService.getUserContext(userId);

    // Build insights response without fake values
    const todayMood = context.mood?.mood || context.checkIn?.feeling || null;
    const stressLevel = context.checkIn?.stressLevel != null ? context.checkIn.stressLevel : null;
    const pendingTasks = context.studyTasks?.pendingCount != null ? context.studyTasks.pendingCount : null;
    const activeGoals = context.goals?.activeCount != null ? context.goals.activeCount : null;

    // Check facial emotion estimate if recorded in user's profile/checkin or session
    const facialEmotion = req.user.latestFacialEmotion || null;

    return res.status(200).json({
      success: true,
      data: {
        mood: todayMood,
        stressLevel: stressLevel,
        pendingTasks: pendingTasks,
        activeGoals: activeGoals,
        facialEmotion: facialEmotion,
      },
    });
  } catch (error) {
    console.error("Get Student Insights Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student insights.",
    });
  }
};

/**
 * @desc    Confirm and add AI-suggested study tasks to Study Planner
 * @route   POST /api/ai/study-plan/confirm
 * @access  Private (Student)
 */
exports.confirmStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tasks, messageId } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tasks provided to add to Study Planner.",
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const tasksToCreate = tasks.map((t) => ({
      userId,
      title: t.title || "Study Session",
      subject: t.subject || "General",
      duration: t.duration || "45 min",
      priority: t.priority || "Medium",
      category: t.category || "Study",
      date: todayStr,
      status: "pending",
    }));

    const createdTasks = await StudyTask.insertMany(tasksToCreate);

    // If messageId provided, mark tasksAdded in conversation
    if (messageId) {
      const conversation = await AIConversation.findOne({ userId });
      if (conversation) {
        const msg = conversation.messages.id(messageId);
        if (msg) {
          msg.tasksAdded = true;
          await conversation.save();
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: `${createdTasks.length} task(s) successfully added to your Study Planner!`,
      data: createdTasks,
    });
  } catch (error) {
    console.error("Confirm Study Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add tasks to Study Planner.",
    });
  }
};
