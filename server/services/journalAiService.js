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

module.exports = {
  analyzeJournalText,
  generateJournalFallback,
};
