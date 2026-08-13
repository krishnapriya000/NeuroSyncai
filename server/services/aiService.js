const DailyCheckIn = require("../models/DailyCheckIn");
const MoodTracker = require("../models/MoodTracker");
const StudyTask = require("../models/StudyTask");
const Goal = require("../models/Goal");
const Journal = require("../models/Journal");

/**
 * Retrieves authenticated student context safely for AI personalized responses.
 * Only retrieves data belonging to the requested student ID.
 */
async function getUserContext(userId) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const [latestCheckIn, latestMood, pendingTasks, activeGoals, recentJournals] = await Promise.all([
      DailyCheckIn.findOne({ studentId: userId }).sort({ createdAt: -1 }).lean(),
      MoodTracker.findOne({ studentId: userId }).sort({ createdAt: -1 }).lean(),
      StudyTask.find({ userId, status: "pending" }).sort({ createdAt: -1 }).lean(),
      Goal.find({ userId, status: "active" }).sort({ createdAt: -1 }).lean(),
      Journal.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    // Format safe context object (no unnecessary raw personal text)
    return {
      checkIn: latestCheckIn
        ? {
            feeling: latestCheckIn.feeling,
            stressLevel: latestCheckIn.stressLevel,
            motivationLevel: latestCheckIn.motivationLevel,
            sleepHours: latestCheckIn.sleepHours,
            energyLevel: latestCheckIn.energyLevel,
            mainGoal: latestCheckIn.mainGoal,
            biggestChallenge: latestCheckIn.biggestChallenge,
            date: latestCheckIn.date,
          }
        : null,
      mood: latestMood
        ? {
            mood: latestMood.mood,
            intensity: latestMood.intensity,
            reason: latestMood.reason,
            date: latestMood.date,
          }
        : null,
      studyTasks: {
        pendingCount: pendingTasks.length,
        tasks: pendingTasks.slice(0, 5).map((t) => ({
          title: t.title,
          subject: t.subject,
          priority: t.priority,
          category: t.category,
        })),
      },
      goals: {
        activeCount: activeGoals.length,
        goals: activeGoals.slice(0, 3).map((g) => ({
          title: g.title,
          category: g.category,
          progress: g.progress,
        })),
      },
      recentJournalMoods: recentJournals
        .map((j) => j.mood)
        .filter(Boolean),
    };
  } catch (error) {
    console.error("Error building AI student context:", error);
    return {
      checkIn: null,
      mood: null,
      studyTasks: { pendingCount: 0, tasks: [] },
      goals: { activeCount: 0, goals: [] },
      recentJournalMoods: [],
    };
  }
}

/**
 * Detects topic category from prompt
 */
function classifyIntent(prompt) {
  const p = prompt.toLowerCase();

  if (
    p.includes("study") ||
    p.includes("plan") ||
    p.includes("revision") ||
    p.includes("exam") ||
    p.includes("subject") ||
    p.includes("assignment") ||
    p.includes("schedule") ||
    p.includes("homework")
  ) {
    return "study";
  }

  if (
    p.includes("focus") ||
    p.includes("pomodoro") ||
    p.includes("distract") ||
    p.includes("break") ||
    p.includes("concentrat") ||
    p.includes("productivity")
  ) {
    return "focus";
  }

  if (
    p.includes("stress") ||
    p.includes("anxious") ||
    p.includes("sad") ||
    p.includes("overwhelmed") ||
    p.includes("mood") ||
    p.includes("relax") ||
    p.includes("tired") ||
    p.includes("feel") ||
    p.includes("burnout") ||
    p.includes("coping")
  ) {
    return "wellness";
  }

  if (
    p.includes("goal") ||
    p.includes("target") ||
    p.includes("reach") ||
    p.includes("achieve") ||
    p.includes("milestone")
  ) {
    return "goals";
  }

  return "general";
}

/**
 * Fallback Context Engine for intelligent personalized responses when external API key is not provided.
 */
function generateContextualFallback(prompt, context) {
  const intent = classifyIntent(prompt);
  const p = prompt.toLowerCase();

  let responseContent = "";
  let suggestedTasks = null;
  let category = intent;

  const currentMood = context.mood?.mood || context.checkIn?.feeling || "Good";
  const stressLevel = context.checkIn?.stressLevel || (context.mood?.mood === "Stressed" ? 7 : 3);
  const pendingCount = context.studyTasks?.pendingCount || 0;
  const activeGoalsCount = context.goals?.activeCount || 0;
  const topGoal = context.goals?.goals[0]?.title || context.checkIn?.mainGoal || "your academic targets";

  // Intent 1: Study Planning & Revision
  if (intent === "study" || p.includes("plan my study") || p.includes("create a study plan")) {
    category = "study";

    if (p.includes("plan") || p.includes("schedule") || p.includes("create")) {
      const suggestedList = [];
      if (context.studyTasks?.tasks && context.studyTasks.tasks.length > 0) {
        context.studyTasks.tasks.slice(0, 3).forEach((t, index) => {
          const duration = index === 0 ? "45 min" : index === 1 ? "30 min" : "60 min";
          suggestedList.push({
            title: t.title,
            subject: t.subject || "General",
            duration: duration,
            priority: t.priority || "High",
            category: t.category || "Study",
          });
        });
      } else {
        suggestedList.push(
          { title: "Core Subject Revision", subject: "DBMS", duration: "45 min", priority: "High", category: "Revision" },
          { title: "Practical Code Practice", subject: "Java Programming", duration: "30 min", priority: "Medium", category: "Study" },
          { title: "Project & Assignment Review", subject: "NeuroSync Project", duration: "60 min", priority: "High", category: "Project" }
        );
      }

      suggestedTasks = suggestedList;

      responseContent = `I've put together a personalized study session schedule based on your current workload:\n\n` +
        suggestedList.map((st, i) => `${i + 1}. **${st.subject}** (${st.title}) — ${st.duration}`).join("\n") +
        `\n\n` +
        (stressLevel >= 6
          ? `*Note: Since your current stress level is elevated (${stressLevel}/10), remember to take 10-minute breaks between sessions.*`
          : `*Working in focused 30-45 minute blocks will maximize your retention today.*`) +
        `\n\nWould you like me to add these tasks to your Study Planner?`;
    } else if (p.includes("progress")) {
      responseContent = `Here is your current study progress:\n\n` +
        `• **Pending Tasks**: ${pendingCount} task${pendingCount === 1 ? "" : "s"} waiting for review.\n` +
        `• **Current Mood**: ${currentMood}\n` +
        `• **Stress Level**: ${stressLevel}/10\n\n` +
        (pendingCount > 0
          ? `You have ${pendingCount} pending task(s). Tackling the highest-priority task first will help lower your workload.`
          : `Awesome work! All your study tasks are up to date. You can use this time to review previous notes or start a focus session.`);
    } else {
      responseContent = `To optimize your study session today:\n\n` +
        `1. **Active Recall**: Quiz yourself on key concepts instead of passive reading.\n` +
        `2. **Spaced Repetition**: Review difficult subjects right before concluding your day.\n` +
        `3. **Targeted Focus**: Right now you have ${pendingCount} pending task(s). Split them into 25-minute Pomodoro sprints.\n\n` +
        `Would you like me to generate a structured daily study plan for you?`;
    }
  }
  // Intent 2: Focus & Productivity
  else if (intent === "focus") {
    category = "focus";
    responseContent = `Here are tailored techniques to sharpen your focus today:\n\n` +
      `• **Pomodoro Method**: Work for 25 minutes with complete focus, followed by a 5-minute break.\n` +
      `• **Environment Setup**: Eliminate phone notifications and close irrelevant browser tabs.\n` +
      `• **Single-Tasking**: Focus on one pending task out of your ${pendingCount} tasks instead of multitasking.\n\n` +
      `You can launch a **Focus Timer** session anytime using the Quick Actions panel on the right!`;
  }
  // Intent 3: Emotional Wellness & Stress Support
  else if (intent === "wellness") {
    category = "wellness";

    if (p.includes("stress") || p.includes("overwhelmed") || p.includes("anxious") || p.includes("sad")) {
      responseContent = `It sounds like you're having a difficult moment right now, and that is completely okay.\n\n` +
        `Here are a few quick steps you can try right now:\n` +
        `1. **Slow Box Breathing**: Inhale deeply for 4 seconds, hold for 4 seconds, exhale for 4 seconds.\n` +
        `2. **Pace Yourself**: With ${pendingCount} pending tasks, pick just ONE small task or step to focus on.\n` +
        `3. **Take a Brief Break**: Step away from the screen for 5 minutes and drink a glass of water.\n\n` +
        `Remember, your emotional well-being comes first. If you ever feel in distress, please talk to a trusted friend, family member, or counselor.`;
    } else if (p.includes("motivation")) {
      responseContent = `🌟 **NeuroSync Daily Motivation**\n\n` +
        `"Small, consistent steps lead to massive results."\n\n` +
        `You've already logged your check-in today with a mood of **${currentMood}**. Keep pushing forward on **${topGoal}** — every study block you complete moves you closer to success!`;
    } else {
      responseContent = `Checking in on your emotional well-being is essential for effective learning.\n\n` +
        `• **Current Mood Logged**: ${currentMood}\n` +
        `• **Stress Index**: ${stressLevel}/10\n\n` +
        `Maintaining balance between your studies and rest will boost your mental energy. Try a short relaxation exercise or log your thoughts in your Journal.`;
    }
  }
  // Intent 4: Goals
  else if (intent === "goals") {
    category = "goals";
    responseContent = `Let's work on your goals!\n\n` +
      `• **Active Goals Count**: ${activeGoalsCount}\n` +
      `• **Main Target**: ${topGoal}\n\n` +
      `To reach large milestones easily:\n` +
      `1. Break ${topGoal} into 3 smaller weekly milestones.\n` +
      `2. Assign dedicated 45-minute focus sessions to work on each sub-task.\n` +
      `3. Track your daily completion rate in the **Goals** module!`;
  }
  // Intent 5: General & Conversation
  else {
    category = "general";
    if (p.includes("hello") || p.includes("hi") || p.includes("hey")) {
      responseContent = `Hello! 👋 I'm your NeuroSync AI Companion. I'm here to support your cognitive growth, study sessions, focus, and emotional well-being.\n\n` +
        `How can I assist you today? You can ask me to help plan your study session, give focus techniques, or support your daily goals!`;
    } else if (p.includes("who are you") || p.includes("what can you do")) {
      responseContent = `I'm NeuroSync AI, your personal cognitive, emotional, and study companion.\n\n` +
        `I can help you with:\n` +
        `• **Study Planning & Task Schedules**\n` +
        `• **Focus & Pomodoro Productivity**\n` +
        `• **Stress Support & Wellness Exercises**\n` +
        `• **Goal Tracking & Actionable Milestones**`;
    } else {
      responseContent = `I understand you're asking about "${prompt}".\n\n` +
        `Based on your NeuroSync context (Mood: **${currentMood}**, Pending Tasks: **${pendingCount}**, Active Goals: **${activeGoalsCount}**), ` +
        `I can assist you with optimizing your study plan, boosting your focus, or guiding you through a stress reduction exercise. How would you like to proceed?`;
    }
  }

  return {
    content: responseContent,
    category,
    suggestedTasks,
  };
}

/**
 * Main AI response generator function.
 * Uses Gemini/AI API key if configured in process.env, or contextual fallback logic.
 */
async function generateAIResponse({ userPrompt, userContext, history = [] }) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      // Build context summary for system prompt
      const contextSummary = `
Student NeuroSync Live Context:
- Current Mood: ${userContext.mood?.mood || userContext.checkIn?.feeling || "Not recorded"}
- Stress Level: ${userContext.checkIn?.stressLevel || "Not recorded"}/10
- Sleep & Rest: ${userContext.checkIn?.sleepHours || "Not recorded"}
- Energy Level: ${userContext.checkIn?.energyLevel || "Not recorded"}
- Pending Study Tasks: ${userContext.studyTasks?.pendingCount || 0}
- Active Goals: ${userContext.goals?.activeCount || 0}
- Top Goal: ${userContext.goals?.goals[0]?.title || userContext.checkIn?.mainGoal || "Academic success"}
`;

      const systemPrompt = `You are NeuroSync AI Companion, a personal cognitive, emotional, and study companion for students.
Your guidelines:
1. Be concise, friendly, student-focused, supportive, and action-oriented.
2. Use bullet points and clean markdown formatting where useful.
3. NEVER claim to be a doctor, therapist, or human. Do NOT diagnose mental health conditions. Use supportive language like "It sounds like you're having a difficult moment."
4. Incorporate the student's NeuroSync context naturally when relevant.
5. If the student asks to create a study plan or schedule for today, suggest 2-3 specific study sessions with subjects and time durations (e.g., "1. DBMS — 45 min", "2. Java — 30 min"). Ask if they want to add them to their Study Planner.

${contextSummary}
`;

      // Make request to Gemini REST API endpoint
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const contentsArray = [];
      // Include system prompt as first context
      contentsArray.push({
        role: "user",
        parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` }],
      });
      contentsArray.push({
        role: "model",
        parts: [{ text: "Understood. I am NeuroSync AI, ready to assist the student." }],
      });

      // Append last 6 history messages
      history.slice(-6).forEach((msg) => {
        contentsArray.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });

      // Append current user prompt
      contentsArray.push({
        role: "user",
        parts: [{ text: userPrompt }],
      });

      const fetchRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: contentsArray }),
      });

      if (fetchRes.ok) {
        const data = await fetchRes.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResponse) {
          const intent = classifyIntent(userPrompt);
          let suggestedTasks = null;

          if (userPrompt.toLowerCase().includes("plan") || userPrompt.toLowerCase().includes("schedule")) {
            // Check if study tasks were suggested
            const tasksList = [];
            if (userContext.studyTasks?.tasks?.length > 0) {
              userContext.studyTasks.tasks.slice(0, 3).forEach((t, idx) => {
                tasksList.push({
                  title: t.title,
                  subject: t.subject || "Study",
                  duration: idx === 0 ? "45 min" : idx === 1 ? "30 min" : "60 min",
                  priority: t.priority || "High",
                  category: t.category || "Study",
                });
              });
            } else {
              tasksList.push(
                { title: "Core Subject Revision", subject: "DBMS", duration: "45 min", priority: "High", category: "Revision" },
                { title: "Practical Code Practice", subject: "Java Programming", duration: "30 min", priority: "Medium", category: "Study" },
                { title: "Project Review", subject: "NeuroSync Project", duration: "60 min", priority: "High", category: "Project" }
              );
            }
            suggestedTasks = tasksList;
          }

          return {
            content: textResponse,
            category: intent,
            suggestedTasks: suggestedTasks,
          };
        }
      }
    } catch (err) {
      console.warn("External AI call error, switching to contextual fallback:", err.message);
    }
  }

  // Fallback to contextual natural language generator
  return generateContextualFallback(userPrompt, userContext);
}

module.exports = {
  getUserContext,
  generateAIResponse,
  classifyIntent,
};
