import React, { useMemo } from "react";
import { FiCpu, FiAlertTriangle, FiHeart, FiMessageSquare, FiCheckCircle } from "react-icons/fi";

const motivationalQuotes = [
  "Every day is a new opportunity to grow.",
  "Small progress is still progress.",
  "Take one step at a time.",
  "Your mental well-being matters.",
];

const getRecommendationForMood = (mood) => {
  const normalized = (mood || "").trim().toLowerCase();

  if (normalized === "very happy" || normalized === "happy") {
    return {
      title: "🎉 Great Mood!",
      message:
        "You seem to be in a positive mood today. Keep following your study routine, stay hydrated, and continue your healthy habits.",
      badgeColor: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      borderColor: "rgba(16, 185, 129, 0.25)",
    };
  }

  if (normalized === "neutral") {
    return {
      title: "🙂 Balanced Mood",
      message:
        "Your mood seems stable today. Try taking short breaks between study sessions and keep yourself engaged.",
      badgeColor: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.25)",
    };
  }

  if (normalized === "sad") {
    return {
      title: "💙 Take Care",
      message:
        "You seem a little low today. Consider talking to a friend, taking a short walk, or doing something you enjoy.",
      badgeColor: "#6366F1",
      bgColor: "rgba(99, 102, 241, 0.1)",
      borderColor: "rgba(99, 102, 241, 0.25)",
    };
  }

  if (normalized === "stressed") {
    return {
      title: "😣 Stress Detected",
      message:
        "Your recent mood indicates stress. Try deep breathing, take a 10-minute break, and avoid studying continuously for long hours.",
      badgeColor: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.1)",
      borderColor: "rgba(245, 158, 11, 0.25)",
    };
  }

  if (normalized === "angry") {
    return {
      title: "😠 Calm Down",
      message:
        "Take a few minutes to relax before returning to your work. Listening to calming music or taking a short walk may help.",
      badgeColor: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      borderColor: "rgba(239, 68, 68, 0.25)",
    };
  }

  if (normalized === "tired") {
    return {
      title: "😴 Rest Recommended",
      message:
        "You seem tired today. Proper sleep and short breaks can improve your concentration and productivity.",
      badgeColor: "#8B5CF6",
      bgColor: "rgba(139, 92, 246, 0.1)",
      borderColor: "rgba(139, 92, 246, 0.25)",
    };
  }

  if (normalized === "anxious") {
    return {
      title: "😟 Anxiety Support",
      message:
        "Try slow breathing exercises and focus on one task at a time. If this feeling continues frequently, consider talking to someone you trust.",
      badgeColor: "#EC4899",
      bgColor: "rgba(236, 72, 153, 0.1)",
      borderColor: "rgba(236, 72, 153, 0.25)",
    };
  }

  // Fallback for default / unspecified mood
  return {
    title: "✨ Personal Guidance",
    message:
      "Keep listening to your body and mind. Practice mindfulness and stay consistent with your self-care goals.",
    badgeColor: "#A78BFA",
    bgColor: "rgba(167, 139, 250, 0.1)",
    borderColor: "rgba(167, 139, 250, 0.25)",
  };
};

function AIMoodRecommendationCard({ latestMood }) {
  // Pick a random quote consistently when component renders or latestMood changes
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  }, [latestMood?._id || latestMood?.createdAt]);

  const rec = latestMood ? getRecommendationForMood(latestMood.mood) : null;
  const isHighIntensity = latestMood && Number(latestMood.intensity) >= 8;

  return (
    <div className="ns-card mt-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 p-2 d-flex align-items-center justify-content-center"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25))",
              color: "#A78BFA",
            }}
          >
            <FiCpu size={22} />
          </div>
          <h2 className="mb-0 text-white fw-bold fs-5 d-flex align-items-center gap-2">
            🤖 AI Recommendation
          </h2>
        </div>
        {latestMood && (
          <span
            className="badge rounded-pill px-3 py-1 text-white"
            style={{
              background: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              fontSize: "0.75rem",
            }}
          >
            Real-time Insights
          </span>
        )}
      </div>

      {latestMood ? (
        <div className="d-flex flex-column gap-3">
          {/* Main Recommendation Banner */}
          <div
            className="p-3 rounded-4"
            style={{
              background: rec.bgColor,
              border: `1px solid ${rec.borderColor}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <h4 className="fw-bold mb-0 fs-6" style={{ color: rec.badgeColor }}>
                {rec.title}
              </h4>
            </div>
            <p className="mb-0 text-white-50" style={{ fontSize: "0.92rem", lineHeight: 1.5 }}>
              {rec.message}
            </p>
          </div>

          {/* High Intensity Warning Alert (If Intensity >= 8) */}
          {isHighIntensity && (
            <div
              className="p-3 rounded-4 d-flex align-items-start gap-3"
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#FCA5A5",
              }}
            >
              <FiAlertTriangle size={24} className="text-danger flex-shrink-0 mt-1" />
              <div>
                <h5 className="fw-bold mb-1 fs-6 text-white d-flex align-items-center gap-1">
                  ⚠️ High Mood Intensity Detected
                </h5>
                <p className="mb-0 text-white-50" style={{ fontSize: "0.88rem" }}>
                  Your mood intensity is high today ({latestMood.intensity}/10). Take extra care of yourself and avoid unnecessary stress.
                </p>
              </div>
            </div>
          )}

          {/* Positive Closing Quote */}
          <div
            className="p-3 rounded-3 text-center position-relative"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px dashed rgba(255, 255, 255, 0.12)",
            }}
          >
            <FiMessageSquare className="text-secondary opacity-50 me-2" size={16} />
            <span className="fst-italic text-white-50" style={{ fontSize: "0.88rem" }}>
              "{randomQuote}"
            </span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-4 px-2">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <FiHeart size={32} className="text-muted" />
          </div>
          <p className="text-muted mb-0 mx-auto" style={{ maxWidth: "280px", fontSize: "0.85rem" }}>
            Log your current mood above to unlock personalized AI wellness recommendations and study advice.
          </p>
        </div>
      )}
    </div>
  );
}

export default AIMoodRecommendationCard;
