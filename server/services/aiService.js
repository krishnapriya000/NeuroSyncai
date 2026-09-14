const DailyCheckIn = require("../models/DailyCheckIn");
const MoodTracker = require("../models/MoodTracker");
const StudyTask = require("../models/StudyTask");
const Goal = require("../models/Goal");
const Journal = require("../models/Journal");
const User = require("../models/User");
const ProfessionalCheckIn = require("../models/ProfessionalCheckIn");
const ProfessionalProfile = require("../models/ProfessionalProfile");
const FocusSession = require("../models/FocusSession");
const SeniorDailyCheckIn = require("../models/SeniorDailyCheckIn");
const SeniorHealthActivity = require("../models/SeniorHealthActivity");
const SeniorMedication = require("../models/SeniorMedication");
const SeniorFamilyContact = require("../models/SeniorFamilyContact");

/**
 * Retrieves authenticated user context safely for AI personalized responses.
 * Detects whether the user is a Working Professional, Senior Citizen, or Student and builds appropriate context.
 */
async function getUserContext(userId) {
  try {
    const user = await User.findById(userId).select("fullName email role").lean();
    const isProfessional = user?.role === "Working Professional";
    const isSenior = user?.role === "Senior Citizen" || (user?.role || "").toLowerCase().includes("senior");

    if (isSenior) {
      const [latestSeniorCheckIn, latestSeniorHealth, medications, familyContacts, latestMood] = await Promise.all([
        SeniorDailyCheckIn.findOne({ userId }).sort({ createdAt: -1 }).lean(),
        SeniorHealthActivity.findOne({ userId }).sort({ createdAt: -1 }).lean(),
        SeniorMedication.find({ userId, status: "active" }).lean(),
        SeniorFamilyContact.find({ userId }).lean(),
        MoodTracker.findOne({ studentId: userId }).sort({ createdAt: -1 }).lean(),
      ]);

      return {
        role: "Senior Citizen",
        userName: user?.fullName || "Senior Citizen",
        seniorCheckIn: latestSeniorCheckIn
          ? {
              feeling: latestSeniorCheckIn.feeling,
              sleepQuality: latestSeniorCheckIn.sleepQuality,
              activityLevel: latestSeniorCheckIn.activityLevel,
              energyLevel: latestSeniorCheckIn.energyLevel,
              routineCompleted: latestSeniorCheckIn.routineCompleted,
              notes: latestSeniorCheckIn.notes,
              date: latestSeniorCheckIn.date,
            }
          : null,
        seniorHealth: latestSeniorHealth
          ? {
              steps: latestSeniorHealth.steps,
              sleepHours: latestSeniorHealth.sleepHours,
              waterGlasses: latestSeniorHealth.waterGlasses,
              energyLevel: latestSeniorHealth.energyLevel,
            }
          : null,
        medicationCount: medications.length,
        medicationList: medications.map((m) => `${m.medicineName} (${m.time})`),
        emergencyContactCount: familyContacts.filter((c) => c.isEmergencyContact).length,
        mood: latestMood ? latestMood.mood : "Calm",
      };
    }

    if (isProfessional) {
      const todayStr = new Date().toISOString().split("T")[0];

      const [latestProfCheckIn, profProfile, focusSessions, recentJournals] = await Promise.all([
        ProfessionalCheckIn.findOne({ userId }).sort({ createdAt: -1 }).lean(),
        ProfessionalProfile.findOne({ userId }).lean(),
        FocusSession.find({ userId }).sort({ createdAt: -1 }).lean(),
        Journal.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
      ]);

      const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
      const sessionCount = focusSessions.length;
      const avgDuration = sessionCount > 0 ? Math.round(totalFocusMinutes / sessionCount) : 0;

      return {
        role: "Working Professional",
        userName: user?.fullName || "Professional",
        profCheckIn: latestProfCheckIn
          ? {
              mood: latestProfCheckIn.mood,
              stressLevel: latestProfCheckIn.stressLevel,
              energyLevel: latestProfCheckIn.energyLevel,
              focusLevel: latestProfCheckIn.focusLevel,
              workingHours: latestProfCheckIn.workingHours,
              breaksTaken: latestProfCheckIn.breaksTaken,
              workLifeBalance: latestProfCheckIn.workLifeBalance,
              workPressure: latestProfCheckIn.workPressure,
              sleepHours: latestProfCheckIn.sleepHours,
              date: latestProfCheckIn.date,
            }
          : null,
        profProfile: profProfile
          ? {
              jobTitle: profProfile.jobTitle,
              company: profProfile.company,
              workType: profProfile.workType,
              wellnessGoal: profProfile.wellnessGoal,
              dailyFocusGoal: profProfile.dailyFocusGoal,
              preferredBreakDuration: profProfile.preferredBreakDuration,
              avgSleepHours: profProfile.avgSleepHours,
            }
          : null,
        focusStats: {
          totalMinutes: totalFocusMinutes,
          sessionCount: sessionCount,
          avgDurationMinutes: avgDuration,
          recentSessions: focusSessions.slice(0, 5).map((s) => ({
            taskName: s.taskName,
            duration: s.durationMinutes,
            date: s.date,
          })),
        },
        recentJournalMoods: recentJournals.map((j) => j.mood).filter(Boolean),
      };
    }

    // Default: Student Context
    const [latestCheckIn, latestMood, pendingTasks, activeGoals, recentJournals] = await Promise.all([
      DailyCheckIn.findOne({ studentId: userId }).sort({ createdAt: -1 }).lean(),
      MoodTracker.findOne({ studentId: userId }).sort({ createdAt: -1 }).lean(),
      StudyTask.find({ userId, status: "pending" }).sort({ createdAt: -1 }).lean(),
      Goal.find({ userId, status: "active" }).sort({ createdAt: -1 }).lean(),
      Journal.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    return {
      role: "Student",
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
    console.error("Error building AI user context:", error);
    return {
      role: "Unknown",
      checkIn: null,
      mood: null,
    };
  }
}

/**
 * Detects topic category from prompt
 */
function classifyIntent(prompt) {
  const p = prompt.toLowerCase();

  if (
    p.includes("workday") ||
    p.includes("plan") ||
    p.includes("schedule") ||
    p.includes("task") ||
    p.includes("priorit") ||
    p.includes("agenda") ||
    p.includes("organize")
  ) {
    return "planning";
  }

  if (
    p.includes("focus") ||
    p.includes("concentrat") ||
    p.includes("deep work") ||
    p.includes("distract") ||
    p.includes("pomodoro") ||
    p.includes("productiv")
  ) {
    return "focus";
  }

  if (
    p.includes("stress") ||
    p.includes("anxious") ||
    p.includes("burnout") ||
    p.includes("overwhelmed") ||
    p.includes("pressure") ||
    p.includes("tired") ||
    p.includes("exhausted")
  ) {
    return "wellness";
  }

  if (
    p.includes("balance") ||
    p.includes("break") ||
    p.includes("rest") ||
    p.includes("work-life") ||
    p.includes("pause") ||
    p.includes("shutdown")
  ) {
    return "balance";
  }

  if (
    p.includes("analyze") ||
    p.includes("analytics") ||
    p.includes("progress") ||
    p.includes("score") ||
    p.includes("history") ||
    p.includes("week")
  ) {
    return "analytics";
  }

  return "general";
}

/**
 * Intelligent Fallback Engine for Working Professionals when AI API key is not configured.
 */
function generateProfessionalFallback(prompt, context) {
  const p = prompt.toLowerCase();
  const intent = classifyIntent(prompt);

  const mood = context.profCheckIn?.mood || "Balanced";
  const stressLevel = context.profCheckIn?.stressLevel || 2;
  const energyLevel = context.profCheckIn?.energyLevel || 4;
  const focusLevel = context.profCheckIn?.focusLevel || 4;
  const workLifeBalance = context.profCheckIn?.workLifeBalance || 4;
  const workingHours = context.profCheckIn?.workingHours || 8;
  const totalFocusMins = context.focusStats?.totalMinutes || 0;
  const sessionCount = context.focusStats?.sessionCount || 0;
  const jobTitle = context.profProfile?.jobTitle || "Professional";
  const wellnessGoal = context.profProfile?.wellnessGoal || "Maintain Work-Life Balance";

  let responseContent = "";

  if (p.includes("plan my workday") || p.includes("plan my day") || (intent === "planning" && p.includes("plan"))) {
    responseContent = `Here is a structured workday plan tailored to your profile (${jobTitle}) and current energy level (${energyLevel}/5):\n\n` +
      `🌅 **Morning Peak Focus Block (9:00 AM - 11:30 AM)**\n` +
      `• Dedicate your highest mental energy to top-priority projects or high-friction deliverables.\n` +
      `• Minimize email & chat notifications during this 2.5-hour block.\n\n` +
      `🥗 **Midday Reset & Recharge (12:30 PM - 1:30 PM)**\n` +
      `• Step away from your workspace for lunch.\n` +
      `• Take a 15-minute outdoors walk or screen-free rest break.\n\n` +
      `💻 **Afternoon Execution & Meetings (2:00 PM - 4:30 PM)**\n` +
      `• Handle collaborative tasks, team syncs, and administrative work.\n` +
      `• Run a 25-minute NeuroSync Focus Session for remaining tasks.\n\n` +
      `📊 **End-of-Day Shutdown Ritual (4:45 PM - 5:00 PM)**\n` +
      `• Review completed milestones and clear your desk to protect your work-life balance.\n\n` +
      `Would you like me to adjust this plan based on specific meetings you have scheduled today?`;
  } else if (p.includes("focus") || intent === "focus") {
    responseContent = `To elevate your focus and concentration today:\n\n` +
      `• **Current Focus Activity**: You have completed **${sessionCount} focus session(s)** totaling **${totalFocusMins} minutes**.\n` +
      `• **Focus Rating Logged**: ${focusLevel}/5\n\n` +
      `**Recommended Deep Work Strategy:**\n` +
      `1. **Single-Tasking**: Focus on ONE key milestone without context switching.\n` +
      `2. **Timeboxing**: Launch a 25-minute or 45-minute NeuroSync Focus Session.\n` +
      `3. **Environment Prep**: Put phone notifications on silent and close non-essential browser tabs.\n\n` +
      `Your recent activity shows stronger productivity during the morning. I'd suggest using your first focus block for your highest-priority task, followed by a short break!`;
  } else if (p.includes("stress") || intent === "wellness") {
    responseContent = `I understand work can feel overwhelming at times, and I'm here to support you.\n\n` +
      `• **Logged Stress Level**: ${stressLevel}/5 (${stressLevel >= 4 ? "High Stress" : stressLevel === 3 ? "Moderate Stress" : "Low Stress"})\n` +
      `• **Current Mood**: ${mood}\n\n` +
      `**Immediate Stress Relief Sprints:**\n` +
      `1. **Box Breathing**: Inhale deeply for 4s, hold for 4s, exhale for 4s. Repeat 3 times.\n` +
      `2. **Simplify & De-scope**: Pick just ONE urgent task to focus on; delegate or postpone less critical items.\n` +
      `3. **Hydration & Movement**: Step away from your desk for 5 minutes and grab a glass of water.\n\n` +
      `*Note: Your wellbeing comes first. If work stress persists or becomes severe, consider speaking with a trusted colleague, manager, or professional counselor.*`;
  } else if (p.includes("balance") || p.includes("break") || intent === "balance") {
    responseContent = `Maintaining a healthy work-life balance is crucial for long-term productivity and avoiding burnout.\n\n` +
      `• **Work-Life Balance Score**: ${workLifeBalance}/5\n` +
      `• **Logged Working Hours**: ${workingHours} hours\n` +
      `• **Primary Goal**: ${wellnessGoal}\n\n` +
      `**Actionable Recommendations:**\n` +
      `• **Micro-Breaks**: Take a 5-minute movement break for every 50 minutes of continuous computer work.\n` +
      `• **Hard Boundary**: Set a strict log-off time this evening to disconnect from work communications.\n` +
      `• **Unwind Ritual**: Plan an evening activity completely detached from work (exercise, reading, family time).\n\n` +
      `Should I remind you to take your next scheduled break?`;
  } else if (p.includes("prioritize") || p.includes("tasks") || (intent === "planning" && p.includes("priorit"))) {
    responseContent = `Let's streamline your workload using the Eisenhower Matrix:\n\n` +
      `1. **Urgent & Important (Do First)**: High-impact deadlines due today. Run a dedicated Focus Session for these.\n` +
      `2. **Important, Not Urgent (Schedule)**: Strategic planning and deep work. Block time on your calendar.\n` +
      `3. **Urgent, Not Important (Delegate/Streamline)**: Quick status updates and routine communications.\n` +
      `4. **Neither (Eliminate)**: Non-essential meetings or low-value tasks.\n\n` +
      `Which task on your plate right now feels like the biggest roadblock? We can break it down together!`;
  } else if (p.includes("analyze") || p.includes("productivity") || intent === "analytics") {
    responseContent = `Here is your personalized workplace productivity & wellbeing synthesis based on your activity data:\n\n` +
      `• **Focus Session Time**: ${totalFocusMins} minutes across ${sessionCount} completed session(s)\n` +
      `• **Energy Rating**: ${energyLevel}/5\n` +
      `• **Focus Rating**: ${focusLevel}/5\n` +
      `• **Stress Index**: ${stressLevel}/5\n` +
      `• **Work-Life Balance Rating**: ${workLifeBalance}/5\n\n` +
      `**Key Insight**: Your recent activity shows consistent focus during structured sessions. To maximize productivity without increasing fatigue, maintain regular micro-breaks between deep work sprints.`;
  } else if (p.includes("hello") || p.includes("hi") || p.includes("hey")) {
    responseContent = `Hello! 👋 I'm your NeuroSync AI Companion.\n\n` +
      `I'm here to help you work smarter while maintaining a healthy work-life balance. How can I support you today? You can ask me to help plan your workday, optimize your focus, manage workplace stress, or analyze your productivity!`;
  } else {
    responseContent = `Thank you for sharing. Based on your NeuroSync profile (${jobTitle}, Stress Level: ${stressLevel}/5, Focus Rating: ${focusLevel}/5):\n\n` +
      `I can help you optimize your workload, design a deep work schedule, or guide you through a stress-reduction strategy.\n\n` +
      `Would you like to focus on **daily planning**, **focus enhancement**, or **work-life balance** today?`;
  }

  return {
    content: responseContent,
    category: intent,
  };
}

/**
 * Intelligent Fallback Engine for Senior Citizens.
 */
function generateSeniorFallback(prompt, context) {
  const p = prompt.toLowerCase();
  const intent = classifyIntent(prompt);

  const mood = context.mood || "Calm";
  const feeling = context.seniorCheckIn?.feeling || "Good";
  const sleepQuality = context.seniorCheckIn?.sleepQuality || "Restful";
  const energyLevel = context.seniorCheckIn?.energyLevel || "Normal";
  const medCount = context.medicationCount || 0;
  const medList = (context.medicationList || []).join(", ");

  let responseContent = "";

  if (p.includes("exercise") || p.includes("mobility") || p.includes("activity") || p.includes("walk")) {
    responseContent = `Here are some safe, gentle physical activity suggestions for your daily routine:\n\n` +
      `🌿 **Morning Light Stretch (10-15 minutes)**\n` +
      `• Gentle seated ankle rolls, shoulder rolls, and slow neck turns.\n` +
      `• Seated leg lifts to promote joint mobility and circulation.\n\n` +
      `🚶‍♂️ **Gentle Garden or Neighborhood Walk**\n` +
      `• A relaxing 15-20 minute walk in comfortable shoes during morning sunshine.\n` +
      `• Rest whenever needed and carry a bottle of water.\n\n` +
      `🧘‍♀️ **Breathing & Balance Exercise**\n` +
      `• Stand near a sturdy chair for balance support and perform slow heel-to-toe raises.\n\n` +
      `*Remember to listen to your body and rest if you feel fatigued!*`;
  } else if (p.includes("medication") || p.includes("pill") || p.includes("reminder") || p.includes("medicine")) {
    responseContent = `Managing medications consistently is key to your peace of mind.\n\n` +
      `• **Your Active Reminders**: ${medCount > 0 ? `${medCount} medicine(s) logged: ${medList}` : "No active medication reminders logged yet."}\n\n` +
      `**Best Practices for Medication Safety:**\n` +
      `1. **Daily Pill Organizer**: Use a clear 7-day pill box labeled with morning, afternoon, and evening slots.\n` +
      `2. **NeuroSync Reminders**: Log your daily doses under **Medication & Reminders** tab to receive automatic prompts.\n` +
      `3. **Water & Food**: Always take pills with a full glass of water, and check if food is required.\n\n` +
      `*Note: If you have questions about dosages or side effects, please consult your prescribing physician or pharmacist.*`;
  } else if (p.includes("sleep") || p.includes("rest") || p.includes("routine") || p.includes("night")) {
    responseContent = `Good sleep quality nourishes your mind and restores your daily energy.\n\n` +
      `• **Recent Sleep Quality**: ${sleepQuality}\n` +
      `• **Logged Energy**: ${energyLevel}\n\n` +
      `**Tips for Restful Sleep:**\n` +
      `1. **Consistent Bedtime**: Go to bed and wake up at the same hour every day.\n` +
      `2. **Relaxing Evening Wind-down**: Sip warm herbal tea, listen to soothing music, or read a book.\n` +
      `3. **Comfortable Environment**: Keep your bedroom cool, dark, and quiet.\n` +
      `4. **Limit Evening Screen Time**: Turn off bright screens 1 hour before sleeping.`;
  } else if (p.includes("memory") || p.includes("mind") || p.includes("brain") || p.includes("cognitive")) {
    responseContent = `Keeping your brain active is a wonderful way to maintain cognitive vitality!\n\n` +
      `**Recommended Brain & Memory Activities:**\n` +
      `1. **Daily Puzzles**: Solve crosswords, Sudoku, or word search puzzles.\n` +
      `2. **Storytelling & Memory Recall**: Browse old photo albums and recount stories from your youth.\n` +
      `3. **Learn Something New**: Try learning a new song, recipe, or hobby.\n` +
      `4. **NeuroSync Memory Exercises**: Try our Student Memory Exercises module to challenge your mind!\n\n` +
      `Would you like me to recommend a fun daily memory trivia exercise?`;
  } else if (p.includes("family") || p.includes("connected") || p.includes("grandchild") || p.includes("children")) {
    responseContent = `Staying connected with family brings joy and warmth to every day ❤️\n\n` +
      `• **Emergency Contacts**: You have ${context.emergencyContactCount || 0} trusted emergency contacts saved in NeuroSync.\n\n` +
      `**Ways to Stay Close:**\n` +
      `1. **Scheduled Video Calls**: Pick a set time each week for a video call with your children or grandchildren.\n` +
      `2. **Share Memories**: Send a short voice note or message recalling a family story.\n` +
      `3. **Family Journal**: Record your thoughts in the **Journal** section and share highlights with family.`;
  } else if (p.includes("lonely") || p.includes("anxious") || p.includes("sad") || p.includes("stressed")) {
    responseContent = `I am here with you, and it is completely natural to feel this way sometimes ❤️\n\n` +
      `• **Current Mood**: ${mood}\n\n` +
      `**Gentle Steps for Comfort:**\n` +
      `1. **Deep Slow Breathing**: Inhale gently through your nose for 4 seconds, and exhale slowly for 4 seconds.\n` +
      `2. **Comforting Cup of Tea**: Enjoy a warm drink while listening to relaxing music or nature sounds.\n` +
      `3. **Reach Out**: Call a family member or friend for a warm chat.\n\n` +
      `*Remember: You are valued, loved, and never alone.*`;
  } else if (p.includes("hello") || p.includes("hi") || p.includes("hey")) {
    responseContent = `Hello! 🌿 I am your NeuroSync Senior AI Companion.\n\n` +
      `I am here to assist you with daily routines, health & medication reminders, family connections, emotional wellbeing, and gentle conversation. How can I help you today?`;
  } else {
    responseContent = `Thank you for reaching out! 🌿\n\n` +
      `As your Senior AI Companion, I am here to support your daily health, medication schedules, memory exercises, and emotional well-being.\n\n` +
      `Feel free to ask me about **gentle daily exercises**, **sleep tips**, **medication reminders**, or **ideas to stay connected with family**!`;
  }

  return {
    content: responseContent,
    category: intent,
  };
}

/**
 * Intelligent Fallback Engine for Students.
 */
function generateContextualFallback(prompt, context) {
  if (context.role === "Working Professional") {
    return generateProfessionalFallback(prompt, context);
  }
  if (context.role === "Senior Citizen") {
    return generateSeniorFallback(prompt, context);
  }

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

  if (intent === "planning" || p.includes("study") || p.includes("plan my study")) {
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
    } else {
      responseContent = `To optimize your study session today:\n\n` +
        `1. **Active Recall**: Quiz yourself on key concepts instead of passive reading.\n` +
        `2. **Spaced Repetition**: Review difficult subjects right before concluding your day.\n` +
        `3. **Targeted Focus**: Right now you have ${pendingCount} pending task(s). Split them into 25-minute Pomodoro sprints.`;
    }
  } else if (intent === "focus") {
    category = "focus";
    responseContent = `Here are tailored techniques to sharpen your focus today:\n\n` +
      `• **Pomodoro Method**: Work for 25 minutes with complete focus, followed by a 5-minute break.\n` +
      `• **Environment Setup**: Eliminate phone notifications and close irrelevant browser tabs.\n` +
      `• **Single-Tasking**: Focus on one pending task out of your ${pendingCount} tasks instead of multitasking.`;
  } else if (intent === "wellness") {
    category = "wellness";
    responseContent = `It sounds like you're having a difficult moment right now, and that is completely okay.\n\n` +
      `Here are a few quick steps you can try right now:\n` +
      `1. **Slow Box Breathing**: Inhale deeply for 4 seconds, hold for 4 seconds, exhale for 4 seconds.\n` +
      `2. **Pace Yourself**: Pick just ONE small task or step to focus on.\n` +
      `3. **Take a Brief Break**: Step away from the screen for 5 minutes and drink a glass of water.\n\n` +
      `Remember, your well-being comes first.`;
  } else {
    category = "general";
    responseContent = `Hello! 👋 I'm your NeuroSync AI Companion.\n\n` +
      `How can I assist you today? You can ask me to help plan your day, give focus techniques, or support your daily goals!`;
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
      const isProf = userContext.role === "Working Professional";
      const isSenior = userContext.role === "Senior Citizen";

      let systemPrompt = "";

      if (isProf) {
        systemPrompt = `You are NeuroSync AI Companion, a supportive AI assistant designed specifically for working professionals.

Help users with:
- workplace productivity
- focus and concentration
- task prioritization
- time management
- work-life balance
- break management
- workplace stress
- workload organization
- daily planning
- productivity habits
- motivation
- focus sessions

Be conversational, supportive, practical and concise.
Do not behave like a generic chatbot.
Use the user's NeuroSync activity data when available to personalize your responses.

Never diagnose medical or mental-health conditions.
If a user describes serious distress or an emergency, encourage them to seek appropriate professional or emergency support.

Do not judge the user.
Ask useful follow-up questions when additional context would improve the advice.

Working Professional NeuroSync Live Context:
- User Name: ${userContext.userName || "Professional"}
- Job Title: ${userContext.profProfile?.jobTitle || "Working Professional"}
- Company: ${userContext.profProfile?.company || "Not specified"}
- Work Type: ${userContext.profProfile?.workType || "Office"}
- Latest Logged Mood: ${userContext.profCheckIn?.mood || "Not recorded today"}
- Stress Level: ${userContext.profCheckIn?.stressLevel || "Not recorded"}/5
- Energy Level: ${userContext.profCheckIn?.energyLevel || "Not recorded"}/5
- Focus Level: ${userContext.profCheckIn?.focusLevel || "Not recorded"}/5
- Work-Life Balance: ${userContext.profCheckIn?.workLifeBalance || "Not recorded"}/5
- Working Hours Today: ${userContext.profCheckIn?.workingHours || "Not recorded"}h
- Sleep Hours: ${userContext.profCheckIn?.sleepHours || context.profProfile?.avgSleepHours || "7.5"}h
- Completed Focus Sessions: ${userContext.focusStats?.sessionCount || 0} session(s) (${userContext.focusStats?.totalMinutes || 0} total focus minutes)
- Wellness Goal: ${userContext.profProfile?.wellnessGoal || "Maintain Work-Life Balance"}
`;
      } else if (isSenior) {
        systemPrompt = `You are NeuroSync Senior AI Companion, a warm, supportive, respectful AI companion designed specifically for senior citizens.

Guidelines:
1. Be extremely clear, warm, patient, encouraging, and easy to read.
2. Provide practical wellness advice on:
   - Gentle physical activities & mobility
   - Sleep routine & relaxation
   - Medication organization & reminder tips
   - Staying connected with family, friends, and community
   - Fun ways to keep the mind and memory active
   - Emotional wellbeing, overcoming loneliness or anxiety
3. NEVER provide clinical medical diagnoses, prescribe medications, or alter dosages.
4. Always remind seniors to consult their healthcare provider or trusted family member for medical decisions.

Senior Citizen NeuroSync Context:
- Name: ${userContext.userName || "Senior"}
- Current Mood: ${userContext.mood || "Calm"}
- Recent Daily Check-in Feeling: ${userContext.seniorCheckIn?.feeling || "Good"}
- Sleep Quality: ${userContext.seniorCheckIn?.sleepQuality || "Restful"}
- Activity Level: ${userContext.seniorCheckIn?.activityLevel || "Moderate"}
- Active Medications: ${userContext.medicationCount || 0} (${(userContext.medicationList || []).join(", ") || "None"})
`;
      } else {
        systemPrompt = `You are NeuroSync AI Companion, a personal cognitive, emotional, and study companion for students.
Guidelines:
1. Be concise, friendly, student-focused, supportive, and action-oriented.
2. Use bullet points and clean markdown formatting where useful.
3. NEVER claim to be a doctor, therapist, or human. Do NOT diagnose mental health conditions.
4. Incorporate the student's NeuroSync context naturally when relevant.

Student Context:
- Mood: ${userContext.mood?.mood || userContext.checkIn?.feeling || "Not recorded"}
- Stress Level: ${userContext.checkIn?.stressLevel || "Not recorded"}/10
- Pending Tasks: ${userContext.studyTasks?.pendingCount || 0}
`;
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const contentsArray = [];
      contentsArray.push({
        role: "user",
        parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` }],
      });
      contentsArray.push({
        role: "model",
        parts: [{ text: "Understood. I am NeuroSync AI Companion, ready to assist." }],
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
          return {
            content: textResponse,
            category: intent,
          };
        }
      }
    } catch (err) {
      console.warn("External AI call error, switching to contextual fallback:", err.message);
    }
  }

  // Fallback to contextual generator
  if (userContext.role === "Working Professional") {
    return generateProfessionalFallback(userPrompt, userContext);
  }
  if (userContext.role === "Senior Citizen") {
    return generateSeniorFallback(userPrompt, userContext);
  }
  return generateContextualFallback(userPrompt, userContext);
}

module.exports = {
  getUserContext,
  generateAIResponse,
  classifyIntent,
};

