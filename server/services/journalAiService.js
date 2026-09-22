/**
 * Journal AI Service
 * Handles AI-powered reflective journal analysis (Emotion, Sentiment, Themes, Reflection, Suggestion)
 * using Gemini API if configured, or intelligent contextual NLP fallback logic.
 */

/**
 * Fallback AI analysis engine when external API key is missing or fails.
 */
function generateJournalFallback(title, content) {
  const text = `${title} ${content}`.toLowerCase();

  // Emotion & Sentiment Detection
  let emotion = "Neutral";
  let sentiment = "Neutral";

  const stressKeywords = ["stress", "stressed", "overwhelmed", "pressure", "deadline", "burden", "load", "panic", "exhausted", "hard", "tough", "cannot cope", "struggling", "hard time"];
  const anxietyKeywords = ["anxious", "anxiety", "worried", "worry", "fear", "nervous", "scared", "dread", "uncertain", "fail"];
  const sadKeywords = ["sad", "depressed", "lonely", "down", "unhappy", "cry", "crying", "hurt", "hopeless", "miss", "gloomy"];
  const happyKeywords = ["happy", "great", "awesome", "good", "excited", "proud", "yay", "joy", "wonderful", "delighted", "satisfied", "accomplished", "love"];
  const calmKeywords = ["calm", "peace", "relaxed", "tranquil", "quiet", "steady", "content", "at ease"];
  const tiredKeywords = ["tired", "sleepy", "exhausted", "fatigue", "no energy", "drained", "burnout", "sleep"];

  let stressScore = stressKeywords.filter(k => text.includes(k)).length;
  let anxietyScore = anxietyKeywords.filter(k => text.includes(k)).length;
  let sadScore = sadKeywords.filter(k => text.includes(k)).length;
  let happyScore = happyKeywords.filter(k => text.includes(k)).length;
  let calmScore = calmKeywords.filter(k => text.includes(k)).length;
  let tiredScore = tiredKeywords.filter(k => text.includes(k)).length;

  if (stressScore > 0 || anxietyScore > 0 || sadScore > 0 || tiredScore > 0) {
    sentiment = "Negative";
    if (stressScore >= Math.max(anxietyScore, sadScore, tiredScore)) emotion = "Stressed";
    else if (anxietyScore >= Math.max(sadScore, tiredScore)) emotion = "Anxious";
    else if (sadScore >= tiredScore) emotion = "Sad";
    else emotion = "Tired";
  } else if (happyScore > 0 || calmScore > 0) {
    sentiment = "Positive";
    if (happyScore >= calmScore) emotion = "Happy";
    else emotion = "Calm";
  } else {
    emotion = "Neutral";
    sentiment = "Neutral";
  }

  // Key Themes Extraction
  const themes = [];
  if (text.includes("study") || text.includes("exam") || text.includes("test") || text.includes("assignment") || text.includes("homework") || text.includes("grade") || text.includes("class") || text.includes("marks") || text.includes("submission")) {
    themes.push("Academic pressure");
  }
  if (text.includes("workload") || text.includes("busy") || text.includes("tasks") || text.includes("project") || text.includes("time") || text.includes("due")) {
    themes.push("Workload management");
  }
  if (text.includes("focus") || text.includes("concentrat") || text.includes("distract") || text.includes("attention")) {
    themes.push("Concentration");
  }
  if (text.includes("friend") || text.includes("family") || text.includes("parent") || text.includes("relationship") || text.includes("people") || text.includes("peer")) {
    themes.push("Interpersonal relationships");
  }
  if (text.includes("sleep") || text.includes("rest") || text.includes("health") || text.includes("headache") || text.includes("sick")) {
    themes.push("Physical well-being");
  }

  if (themes.length === 0) {
    themes.push("Daily reflection");
    themes.push("Personal growth");
  }

  // AI Reflection (strictly non-medical)
  let reflection = "";
  if (sentiment === "Negative") {
    reflection = `Your journal entry suggests that you may be navigating heightened pressure related to ${themes.join(" and ").toLowerCase()}. Expressing your feelings here is a healthy step towards processing them.`;
  } else if (sentiment === "Positive") {
    reflection = `The text indicates positive moments and a constructive mindset regarding ${themes.join(" and ").toLowerCase()}. Capturing these reflections can reinforce healthy coping mechanisms.`;
  } else {
    reflection = `Your reflection highlights steady observations around ${themes.join(" and ").toLowerCase()}. Documenting daily thoughts helps foster mindfulness and ongoing self-awareness.`;
  }

  // Suggested Action (strictly non-medical)
  let suggestion = "";
  if (emotion === "Stressed" || emotion === "Anxious") {
    suggestion = "Consider breaking larger academic or daily tasks into smaller micro-goals and using your NeuroSync Focus Timer with short breaks.";
  } else if (emotion === "Tired") {
    suggestion = "Try setting a clear boundary between study hours and rest tonight, allowing your mind time to recharge.";
  } else if (emotion === "Sad") {
    suggestion = "Engage in a brief relaxing activity you enjoy, such as listening to music or stepping outside for fresh air.";
  } else if (sentiment === "Positive") {
    suggestion = "Keep this positive momentum going by acknowledging your recent efforts and maintaining your balanced study routine.";
  } else {
    suggestion = "Take a short moment to plan your next priority, keeping your study schedule manageable and structured.";
  }

  return {
    emotion,
    sentiment,
    themes,
    reflection,
    suggestion,
  };
}

/**
 * Analyzes a student journal entry text using Gemini or fallback generator
 */
async function analyzeJournalText(title, content) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const systemPrompt = `You are an AI wellbeing reflection assistant for students in the NeuroSync app.
Your task is to analyze the student's journal entry title and content and provide structured emotional insights.

CRITICAL SAFETY & NON-MEDICAL DIRECTIVES:
1. Do NOT make medical diagnoses or claim the student has clinical depression, anxiety, or any mental illness.
2. Use supportive, non-medical reflection phrasing such as: "Your entry suggests...", "The text indicates...", "Possible emotional pattern...", "This may be related to...".
3. Return ONLY valid raw JSON with NO markdown codeblocks or extra text.

JSON FORMAT REQUIRED:
{
  "emotion": "Stressed" | "Happy" | "Sad" | "Anxious" | "Tired" | "Calm" | "Neutral",
  "sentiment": "Positive" | "Negative" | "Neutral",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "reflection": "A 1-2 sentence empathetic non-medical reflection",
  "suggestion": "A 1-2 sentence non-medical practical wellbeing suggestion"
}`;

      const userPrompt = `Journal Title: "${title}"\nJournal Content:\n"${content}"`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const fetchRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` }] },
            { role: "model", parts: [{ text: "Understood. I will provide raw JSON analysis following all non-medical guidelines." }] },
            { role: "user", parts: [{ text: userPrompt }] }
          ]
        }),
      });

      if (fetchRes.ok) {
        const data = await fetchRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          // Clean potential markdown fences
          const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed.emotion && parsed.sentiment && Array.isArray(parsed.themes) && parsed.reflection && parsed.suggestion) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("External AI call failed for journal analysis, falling back to NLP engine:", err.message);
    }
  }

  // Fallback
  return generateJournalFallback(title, content);
}

/**
 * Fallback engine for multi-entry journal analysis when AI API key is missing or fails.
 */
function generateMultiJournalFallback(entries = [], analyses = []) {
  if (!entries || entries.length === 0) {
    return {
      hasData: false,
      totalEntries: 0,
      dominantEmotion: "None",
      commonEmotions: [],
      emotionalTrend: [],
      commonThemes: [],
      recurringThemes: [],
      recurringPattern: {
        title: "🔍 Recurring Pattern",
        patternText: "No journal entries created yet. Write your first reflection!",
      },
      overallSentimentTrend: "Neutral",
      aiInsight: "Start writing journal reflections to unlock personalized AI insights across your history.",
      personalizedRecommendation: "Take a quiet moment today to log how your study session went.",
    };
  }

  // Build analysis map by journal entry ID
  const analysisMap = {};
  analyses.forEach((a) => {
    if (a.journalEntryId) {
      analysisMap[a.journalEntryId.toString()] = a;
    }
  });

  // Track emotion, sentiment, theme frequencies, and chronological trend
  const emotionCounts = {};
  const sentimentCounts = {};
  const themeCounts = {};
  const trendItems = [];

  // Sort entries chronologically (oldest to newest) for trend progression
  const sortedChrono = [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  sortedChrono.forEach((entry) => {
    const singleAnalysis = analysisMap[entry._id?.toString()];
    let itemEmotion = singleAnalysis?.emotion || entry.mood || "Neutral";
    let itemSentiment = singleAnalysis?.sentiment || "Neutral";

    if (!singleAnalysis && entry.content) {
      const fb = generateJournalFallback(entry.title || "", entry.content);
      itemEmotion = fb.emotion;
      itemSentiment = fb.sentiment;
      fb.themes.forEach((t) => {
        themeCounts[t] = (themeCounts[t] || 0) + 1;
      });
    } else if (singleAnalysis?.themes) {
      singleAnalysis.themes.forEach((t) => {
        if (t) themeCounts[t] = (themeCounts[t] || 0) + 1;
      });
    }

    if (!itemEmotion || itemEmotion === "") itemEmotion = "Neutral";
    emotionCounts[itemEmotion] = (emotionCounts[itemEmotion] || 0) + 1;
    sentimentCounts[itemSentiment] = (sentimentCounts[itemSentiment] || 0) + 1;
    trendItems.push(itemEmotion);
  });

  // Dominant emotion
  let dominantEmotion = "Neutral";
  let maxEmoCount = 0;
  Object.entries(emotionCounts).forEach(([emo, count]) => {
    if (count > maxEmoCount) {
      maxEmoCount = count;
      dominantEmotion = emo;
    }
  });

  // Common emotions (top unique emotions)
  const commonEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emo]) => emo)
    .slice(0, 4);

  // Overall sentiment trend
  let overallSentimentTrend = "Neutral";
  const posCount = sentimentCounts["Positive"] || 0;
  const negCount = sentimentCounts["Negative"] || 0;
  const neuCount = sentimentCounts["Neutral"] || 0;

  if (posCount > negCount && posCount > neuCount) overallSentimentTrend = "Positive";
  else if (negCount > posCount && negCount > neuCount) overallSentimentTrend = "Negative";
  else if (posCount > 0 && negCount > 0) overallSentimentTrend = "Mixed";
  else overallSentimentTrend = "Neutral";

  // Recurring themes
  const recurringThemes = Object.entries(themeCounts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);

  const commonThemes = recurringThemes.map((r) => r.theme).slice(0, 4);
  if (commonThemes.length === 0) {
    commonThemes.push("Academic pressure", "Workload management", "Daily reflection");
  }

  // Emotional Trend representation (recent 6 items max for visual flow)
  const emotionalTrend = trendItems.slice(-6);

  // Recurring Pattern Detection based on co-occurrence
  const topTheme = commonThemes[0] || "Academic workload";
  let patternText = "";

  if (dominantEmotion === "Stressed" || dominantEmotion === "Anxious") {
    patternText = `${topTheme} frequently appears alongside ${dominantEmotion.toLowerCase()} feelings in your recent journal entries.`;
  } else if (dominantEmotion === "Tired") {
    patternText = `${topTheme} frequently appears alongside tiredness in your recent journal entries.`;
  } else if (dominantEmotion === "Happy" || dominantEmotion === "Calm") {
    patternText = `${topTheme} consistently coincides with positive mood and steady goal completion.`;
  } else {
    patternText = `${topTheme} and general reflections show a balanced emotional rhythm across your entries.`;
  }

  // AI Insight
  let aiInsight = "";
  if (overallSentimentTrend === "Negative" || dominantEmotion === "Stressed" || dominantEmotion === "Tired") {
    aiInsight = `Your recent entries indicate that ${topTheme.toLowerCase()} frequently coincides with ${dominantEmotion.toLowerCase()} periods. Documenting these patterns helps you recognize when you need extra rest or support.`;
  } else if (overallSentimentTrend === "Positive") {
    aiInsight = `Your reflections show a consistent positive trend, where active engagement with ${topTheme.toLowerCase()} fosters confidence and emotional clarity.`;
  } else {
    aiInsight = `Your recent journal history shows steady reflection habits, balancing academic responsibilities with thoughtful personal check-ins.`;
  }

  // Personalized Recommendation
  let personalizedRecommendation = "";
  if (dominantEmotion === "Stressed" || dominantEmotion === "Anxious") {
    personalizedRecommendation = "Consider breaking larger study tasks into smaller sessions and scheduling regular 5-minute breathing breaks.";
  } else if (dominantEmotion === "Tired") {
    personalizedRecommendation = "Try establishing a clear evening shutdown routine to separate study commitments from restful sleep.";
  } else if (overallSentimentTrend === "Positive") {
    personalizedRecommendation = "Maintain your current positive momentum by celebrating small wins and maintaining structured study hours.";
  } else {
    personalizedRecommendation = "Keep up your journaling routine by taking 5 minutes every evening to reflect on one key highlight of your day.";
  }

  return {
    hasData: true,
    totalEntries: entries.length,
    dominantEmotion,
    commonEmotions,
    emotionalTrend,
    commonThemes,
    recurringThemes,
    recurringPattern: {
      title: "🔍 Recurring Pattern",
      patternText,
    },
    overallSentimentTrend,
    aiInsight,
    personalizedRecommendation,
  };
}

/**
 * Analyzes multiple historical journal entries using Gemini or fallback generator
 */
async function analyzeMultiJournalText(entries = [], analyses = []) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey && entries.length > 0) {
    try {
      const formattedEntries = entries.slice(0, 15).map((e, idx) => {
        const d = new Date(e.createdAt).toISOString().split("T")[0];
        return `Entry #${idx + 1} (${d}): Title: "${e.title}", Mood: "${e.mood || "None"}", Content: "${e.content.slice(0, 300)}"`;
      }).join("\n");

      const systemPrompt = `You are an AI wellbeing analysis engine for the NeuroSync app.
Your task is to analyze multiple historical journal entries of a student and identify emotional patterns, themes, trends, insights, and recommendations across their journal history.

CRITICAL SAFETY & NON-MEDICAL DIRECTIVES:
1. Do NOT make medical or psychiatric diagnoses.
2. Use supportive, reflective, non-medical phrasing ("Your entries indicate...", "A recurring pattern suggests...").
3. Return ONLY valid raw JSON with NO markdown codeblocks.

JSON FORMAT REQUIRED:
{
  "dominantEmotion": "Stressed" | "Happy" | "Sad" | "Anxious" | "Tired" | "Calm" | "Neutral",
  "commonEmotions": ["Emotion 1", "Emotion 2"],
  "emotionalTrend": ["Emotion 1", "Emotion 2", "Emotion 3", "Emotion 4"],
  "commonThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "recurringThemes": [{"theme": "Theme 1", "count": 3}],
  "recurringPattern": {
    "title": "🔍 Recurring Pattern",
    "patternText": "A 1-2 sentence description of a detected repeated pattern across entries (e.g. Academic pressure frequently appears alongside tiredness in your recent journal entries.)"
  },
  "overallSentimentTrend": "Positive" | "Negative" | "Neutral" | "Mixed",
  "aiInsight": "A 1-2 sentence concise personalized reflection based on multiple journal entries",
  "personalizedRecommendation": "A 1-2 sentence practical, supportive, non-diagnostic wellbeing recommendation"
}`;

      const userPrompt = `Student Historical Journal Entries (${entries.length} total entries):\n${formattedEntries}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const fetchRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` }] },
            { role: "model", parts: [{ text: "Understood. I will provide raw JSON multi-entry analysis following all non-medical guidelines." }] },
            { role: "user", parts: [{ text: userPrompt }] }
          ]
        }),
      });

      if (fetchRes.ok) {
        const data = await fetchRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed.dominantEmotion && parsed.recurringPattern && parsed.aiInsight && parsed.personalizedRecommendation) {
            return {
              hasData: true,
              totalEntries: entries.length,
              dominantEmotion: parsed.dominantEmotion,
              commonEmotions: Array.isArray(parsed.commonEmotions) ? parsed.commonEmotions : [parsed.dominantEmotion],
              emotionalTrend: Array.isArray(parsed.emotionalTrend) ? parsed.emotionalTrend : [parsed.dominantEmotion],
              commonThemes: Array.isArray(parsed.commonThemes) ? parsed.commonThemes : ["Academic pressure"],
              recurringThemes: Array.isArray(parsed.recurringThemes) ? parsed.recurringThemes : [],
              recurringPattern: parsed.recurringPattern,
              overallSentimentTrend: parsed.overallSentimentTrend || "Neutral",
              aiInsight: parsed.aiInsight,
              personalizedRecommendation: parsed.personalizedRecommendation,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Multi-entry AI call failed, using fallback engine:", err.message);
    }
  }

  return generateMultiJournalFallback(entries, analyses);
}

/**
 * Fallback engine for Weekly Journal Reflection when AI API key is missing or fails.
 */
function generateWeeklyReflectionFallback(entries = [], analyses = []) {
  if (!entries || entries.length === 0) {
    return {
      hasSufficientData: false,
      entryCount: 0,
      dominantEmotion: "None",
      commonThemes: [],
      positivePattern: "No entries logged this week.",
      areaToWatch: "No active trends detected.",
      weeklyReflection: "Write journal entries this week to unlock your AI weekly reflection insights!",
      suggestedAction: "Start by logging how your day went in a short entry.",
    };
  }

  const multi = generateMultiJournalFallback(entries, analyses);

  let positivePattern = "";
  let areaToWatch = "";

  if (multi.overallSentimentTrend === "Positive" || multi.dominantEmotion === "Happy" || multi.dominantEmotion === "Calm") {
    positivePattern = "Consistent emotional resilience and proactive workload management.";
    areaToWatch = "Maintaining regular rest breaks during peak study periods.";
  } else if (multi.dominantEmotion === "Stressed" || multi.dominantEmotion === "Anxious") {
    positivePattern = "Active self-expression and daily reflection during challenging days.";
    areaToWatch = "Heightened academic workload and impending assignment deadlines.";
  } else if (multi.dominantEmotion === "Tired") {
    positivePattern = "Ongoing awareness of personal fatigue boundaries.";
    areaToWatch = "Sleep balance and evening study-rest separation.";
  } else {
    positivePattern = "Steady journaling rhythm and balanced self-awareness.";
    areaToWatch = "Structuring daily priorities to prevent mid-week burnout.";
  }

  return {
    hasSufficientData: true,
    entryCount: entries.length,
    dominantEmotion: multi.dominantEmotion,
    commonThemes: multi.commonThemes,
    positivePattern,
    areaToWatch,
    weeklyReflection: `Your journal entries this week show ${multi.commonThemes[0] ? multi.commonThemes[0].toLowerCase() : "academic activities"} as a key focus, accompanied by a predominantly ${multi.dominantEmotion.toLowerCase()} emotional tone.`,
    suggestedAction: multi.personalizedRecommendation,
  };
}

/**
 * Analyzes Weekly Journal Reflection using Gemini or fallback generator
 */
async function analyzeWeeklyReflectionText(entries = [], analyses = []) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey && entries.length > 0) {
    try {
      const formattedEntries = entries.map((e, idx) => {
        const d = new Date(e.createdAt).toISOString().split("T")[0];
        return `Entry #${idx + 1} (${d}): Title: "${e.title}", Mood: "${e.mood || "None"}", Content: "${e.content.slice(0, 250)}"`;
      }).join("\n");

      const systemPrompt = `You are a weekly AI wellbeing reflection assistant for students in NeuroSync.
Analyze the student's journal entries from the past 7 days and generate a supportive weekly summary reflection.

CRITICAL SAFETY & NON-MEDICAL DIRECTIVES:
1. Do NOT make medical or psychiatric diagnoses.
2. Return ONLY valid raw JSON with NO markdown codeblocks.

JSON FORMAT REQUIRED:
{
  "dominantEmotion": "Stressed" | "Happy" | "Sad" | "Anxious" | "Tired" | "Calm" | "Neutral",
  "commonThemes": ["Theme 1", "Theme 2"],
  "positivePattern": "A short 1-sentence positive highlight observed this week",
  "areaToWatch": "A short 1-sentence supportive area to watch for balance",
  "weeklyReflection": "A 1-2 sentence empathetic weekly summary reflection",
  "suggestedAction": "A 1-2 sentence non-medical practical action suggestion"
}`;

      const userPrompt = `Student Weekly Journal Entries (${entries.length} entries in last 7 days):\n${formattedEntries}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const fetchRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` }] },
            { role: "model", parts: [{ text: "Understood. I will provide raw JSON weekly reflection following non-medical guidelines." }] },
            { role: "user", parts: [{ text: userPrompt }] }
          ]
        }),
      });

      if (fetchRes.ok) {
        const data = await fetchRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed.dominantEmotion && parsed.weeklyReflection && parsed.suggestedAction) {
            return {
              hasSufficientData: true,
              entryCount: entries.length,
              dominantEmotion: parsed.dominantEmotion,
              commonThemes: Array.isArray(parsed.commonThemes) ? parsed.commonThemes : ["Academic reflection"],
              positivePattern: parsed.positivePattern || "Steady journaling rhythm this week.",
              areaToWatch: parsed.areaToWatch || "Balancing study sessions with adequate rest.",
              weeklyReflection: parsed.weeklyReflection,
              suggestedAction: parsed.suggestedAction,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Weekly AI call failed, using fallback engine:", err.message);
    }
  }

  return generateWeeklyReflectionFallback(entries, analyses);
}

module.exports = {
  analyzeJournalText,
  generateJournalFallback,
  analyzeMultiJournalText,
  generateMultiJournalFallback,
  analyzeWeeklyReflectionText,
  generateWeeklyReflectionFallback,
};

