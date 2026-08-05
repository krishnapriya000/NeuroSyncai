import React from "react";
import { Link } from "react-router-dom";
import { 
  FiSmile, 
  FiMoon, 
  FiZap, 
  FiBook, 
  FiActivity, 
  FiTarget, 
  FiHeart, 
  FiRefreshCw, 
  FiInfo, 
  FiPlusCircle,
  FiCheckCircle 
} from "react-icons/fi";

// --- Scoring Logic ---
const getMoodScore = (mood) => {
  if (!mood) return 15;
  const m = String(mood).trim().toLowerCase();
  if (m.includes("very happy")) return 25;
  if (m.includes("happy")) return 20;
  if (m.includes("neutral")) return 15;
  if (m.includes("stressed")) return 8;
  if (m.includes("sad")) return 5;
  return 15;
};

const getSleepScore = (sleep) => {
  if (!sleep) return 15;
  const s = String(sleep).trim().toLowerCase();
  if (s.includes("more than 8") || s.includes("> 8") || s.includes(">8")) return 25;
  if (s.includes("6–8") || s.includes("6-8")) return 20;
  if (s.includes("4–6") || s.includes("4-6")) return 12;
  if (s.includes("less than 4") || s.includes("< 4") || s.includes("<4")) return 5;
  return 15;
};

const getStressScore = (stress) => {
  const s = Number(stress);
  if (isNaN(s)) return 15;
  if (s >= 1 && s <= 3) return 25;
  if (s >= 4 && s <= 6) return 15;
  if (s >= 7 && s <= 10) return 5;
  return 15;
};

const getMotivationScore = (motivation) => {
  const m = Number(motivation);
  if (isNaN(m)) return 15;
  if (m >= 8 && m <= 10) return 25;
  if (m >= 5 && m <= 7) return 15;
  if (m >= 1 && m <= 4) return 5;
  return 15;
};

const getWellnessStatus = (score) => {
  if (score >= 80) {
    return { label: "Excellent", emoji: "🟢", color: "#10B981", badgeClass: "bg-success" };
  }
  if (score >= 60) {
    return { label: "Good", emoji: "🟡", color: "#F59E0B", badgeClass: "bg-warning" };
  }
  if (score >= 40) {
    return { label: "Moderate", emoji: "🟠", color: "#F97316", badgeClass: "bg-orange text-white" };
  }
  return { label: "Needs Attention", emoji: "🔴", color: "#EF4444", badgeClass: "bg-danger" };
};

const getRecommendation = (data, score) => {
  const stress = Number(data.stressLevel);
  const sleep = String(data.sleepHours || "").toLowerCase();

  if (!isNaN(stress) && stress >= 7) {
    return "You seem stressed today. Take short breaks, drink enough water, and try a 5-minute breathing exercise.";
  }
  if (sleep.includes("less than 4") || sleep.includes("< 4") || sleep.includes("<4")) {
    return "You didn't get enough sleep. Try to rest well before long study sessions.";
  }
  if (score >= 80) {
    return "Great job! Maintain your healthy routine and stay consistent.";
  }
  if (score >= 60) {
    return "You're doing well today! Keep up your study pace and remember to stay hydrated.";
  }
  return "Take it easy today. Focus on essential tasks and prioritize resting your mind.";
};

function TodaysWellnessSummaryCard({ loading, error, data, onRetry }) {
  // 1. Loading State
  if (loading) {
    return (
      <div 
        className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          background: "#0F172A",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <div className="d-flex align-items-center justify-content-center py-4 gap-3 text-secondary">
          <div className="spinner-border text-primary spinner-border-sm" role="status" />
          <span className="fw-medium">Analyzing today's survey response...</span>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div 
        className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          background: "#0F172A",
          border: "1px solid rgba(239, 68, 68, 0.2)"
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 text-danger">
            <span>⚠️</span>
            <span className="fw-medium">{error}</span>
          </div>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
            >
              <FiRefreshCw size={14} /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Empty State (No check-in found for today)
  if (!data || !data.hasData) {
    return (
      <div 
        className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)"
        }}
      >
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-warning bg-opacity-20 text-warning px-2.5 py-1 rounded-pill border border-warning border-opacity-30">
                Action Required
              </span>
              <h5 className="fw-bold mb-0 text-white fs-6">Today's Wellness Summary</h5>
            </div>
            <p className="text-secondary small mb-0">
              No Daily Check-in recorded for today yet. Complete your 1-minute daily survey to generate your personalized wellness score & recommendations.
            </p>
          </div>

          <Link 
            to="/student/checkin" 
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap shadow-sm"
          >
            <FiPlusCircle /> Complete Check-in
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Overall Wellness Score
  const moodScore = getMoodScore(data.mood || data.feeling);
  const sleepScore = getSleepScore(data.sleepHours);
  const stressScore = getStressScore(data.stressLevel);
  const motivationScore = getMotivationScore(data.motivationLevel);

  const overallScore = moodScore + sleepScore + stressScore + motivationScore;
  const status = getWellnessStatus(overallScore);
  const recommendation = getRecommendation(data, overallScore);

  // SVG Gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div 
      className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Header Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center text-primary"
            style={{ width: "40px", height: "40px", background: "rgba(59, 130, 246, 0.15)" }}
          >
            <FiHeart size={22} className="text-danger" />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-white fs-5">Today's Wellness Summary</h5>
            <span className="text-secondary small" style={{ fontSize: "0.78rem" }}>
              AI-driven analysis of your latest Daily Check-in responses
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${status.badgeClass} px-3 py-2 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1`}>
            <span>{status.emoji}</span> {status.label}
          </span>
        </div>
      </div>

      {/* Hero Score & Recommendation Row */}
      <div className="row align-items-center g-4 mb-4">
        {/* Circular Progress Gauge */}
        <div className="col-12 col-md-4 text-center border-end-md border-secondary border-opacity-25">
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div className="position-relative d-inline-flex align-items-center justify-content-center mb-2">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={status.color}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 1s ease-in-out",
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                  }}
                />
              </svg>
              <div className="position-absolute text-center">
                <span className="fs-2 fw-bold text-white leading-none">{overallScore}%</span>
                <div className="text-secondary fw-semibold" style={{ fontSize: "0.7rem", marginTop: "-4px" }}>Wellness</div>
              </div>
            </div>
            <div className="fw-semibold text-white small">
              Overall Wellness Score
            </div>
          </div>
        </div>

        {/* Personalized Recommendation Banner */}
        <div className="col-12 col-md-8">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-center"
            style={{ 
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
              border: "1px solid rgba(59, 130, 246, 0.2)"
            }}
          >
            <div className="d-flex align-items-center gap-2 text-warning mb-2">
              <FiInfo size={20} />
              <span className="fw-bold text-white small uppercase tracking-wide">Personalized Recommendation</span>
            </div>
            <p className="text-white-80 mb-0 fs-6" style={{ lineHeight: "1.5" }}>
              "{recommendation}"
            </p>
          </div>
        </div>
      </div>

      {/* 6 Required Display Items Grid */}
      <div className="row g-3">
        {/* 1. 😊 Mood */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2 text-warning">
                <FiSmile size={18} />
                <span className="small text-secondary fw-semibold">Mood</span>
              </div>
              <span className="badge bg-secondary bg-opacity-20 text-secondary small" style={{ fontSize: "0.7rem" }}>
                Score: {moodScore}/25
              </span>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              😊 {data.mood || data.feeling || "Neutral"}
            </div>
          </div>
        </div>

        {/* 2. 😴 Sleep Hours */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2 text-info">
                <FiMoon size={18} />
                <span className="small text-secondary fw-semibold">Sleep Hours</span>
              </div>
              <span className="badge bg-secondary bg-opacity-20 text-secondary small" style={{ fontSize: "0.7rem" }}>
                Score: {sleepScore}/25
              </span>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              😴 {data.sleepHours || "6–8 hours"}
            </div>
          </div>
        </div>

        {/* 3. ⚡ Energy Level */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2 text-success">
                <FiZap size={18} />
                <span className="small text-secondary fw-semibold">Energy Level</span>
              </div>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              ⚡ {data.energyLevel || "Moderate"}
            </div>
          </div>
        </div>

        {/* 4. 📚 Motivation Level */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2 text-primary">
                <FiBook size={18} />
                <span className="small text-secondary fw-semibold">Motivation Level</span>
              </div>
              <span className="badge bg-secondary bg-opacity-20 text-secondary small" style={{ fontSize: "0.7rem" }}>
                Score: {motivationScore}/25
              </span>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              📚 {data.motivationLevel !== undefined ? `${data.motivationLevel} / 10` : "N/A"}
            </div>
          </div>
        </div>

        {/* 5. 😌 Stress Level */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2 text-danger">
                <FiActivity size={18} />
                <span className="small text-secondary fw-semibold">Stress Level</span>
              </div>
              <span className="badge bg-secondary bg-opacity-20 text-secondary small" style={{ fontSize: "0.7rem" }}>
                Score: {stressScore}/25
              </span>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              😌 {data.stressLevel !== undefined ? `${data.stressLevel} / 10` : "N/A"}
            </div>
          </div>
        </div>

        {/* 6. 🎯 Today's Goal */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2 text-indigo-400">
                <FiTarget size={18} />
                <span className="small text-secondary fw-semibold">Today's Goal</span>
              </div>
            </div>
            <div className="fs-6 fw-bold text-white mb-1 text-truncate" title={data.goal || data.mainGoal}>
              🎯 {data.goal || data.mainGoal || "Focus on Study"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodaysWellnessSummaryCard;
