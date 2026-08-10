import React from "react";
import { FiZap, FiActivity, FiMoon, FiAward, FiTrendingDown } from "react-icons/fi";

function ProfessionalStatCards({ 
  focusTime = "5h 30m",
  focusGoal = "of 8h daily goal",
  focusProgress = 69,
  stressLevel = "Low",
  stressScore = "28/100 stress score",
  sleepTime = "7h 15m",
  sleepQuality = "Good quality",
  wellnessScore = 82,
  wellnessSubtitle = "Great job!"
}) {
  return (
    <div className="row g-3 mb-4">
      {/* CARD 1: Work Focus */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="ns-card h-100 d-flex flex-column justify-content-between">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="ns-stat-label">Work Focus</span>
            <div 
              className="ns-stat-icon-wrapper focus"
              style={{ width: "42px", height: "42px", fontSize: "1.2rem", borderRadius: "12px" }}
            >
              <FiZap />
            </div>
          </div>
          <div className="mb-2">
            <div className="ns-stat-value">{focusTime}</div>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>{focusGoal}</div>
          </div>
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.72rem" }}>
              <span className="text-muted">Progress</span>
              <span className="text-primary fw-bold">{focusProgress}%</span>
            </div>
            <div className="progress" style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: "4px" }}>
              <div 
                className="progress-bar"
                role="progressbar"
                style={{ 
                  width: `${focusProgress}%`,
                  background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
                  borderRadius: "4px"
                }}
                aria-valuenow={focusProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Stress Level */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="ns-card h-100 d-flex flex-column justify-content-between">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="ns-stat-label">Stress Level</span>
            <div 
              className="ns-stat-icon-wrapper mood"
              style={{ width: "42px", height: "42px", fontSize: "1.2rem", borderRadius: "12px" }}
            >
              <FiActivity />
            </div>
          </div>
          <div>
            <div className="ns-stat-value text-emerald-400 d-flex align-items-center gap-2">
              {stressLevel}
              <span 
                className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-30 rounded-pill font-normal"
                style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
              >
                <FiTrendingDown className="me-1" /> -4%
              </span>
            </div>
            <div className="text-muted mt-1" style={{ fontSize: "0.78rem" }}>{stressScore}</div>
          </div>
          <div className="mt-2 text-success" style={{ fontSize: "0.75rem" }}>
            Optimal workplace resilience
          </div>
        </div>
      </div>

      {/* CARD 3: Sleep Last Night */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="ns-card h-100 d-flex flex-column justify-content-between">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="ns-stat-label">Sleep Last Night</span>
            <div 
              className="ns-stat-icon-wrapper streak"
              style={{ width: "42px", height: "42px", fontSize: "1.2rem", borderRadius: "12px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))", color: "#a78bfa" }}
            >
              <FiMoon />
            </div>
          </div>
          <div>
            <div className="ns-stat-value">{sleepTime}</div>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>{sleepQuality}</div>
          </div>
          <div className="mt-2 text-info d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
            <span>🌙 Restorative sleep schedule</span>
          </div>
        </div>
      </div>

      {/* CARD 4: Wellness Score */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="ns-card h-100 d-flex align-items-center justify-content-between">
          <div>
            <span className="ns-stat-label">Wellness Score</span>
            <div className="ns-stat-value mt-1">{wellnessScore} <span className="fs-6 text-muted fw-normal">/ 100</span></div>
            <div className="text-success fw-semibold mt-1" style={{ fontSize: "0.78rem" }}>{wellnessSubtitle}</div>
          </div>
          
          {/* Circular Progress Ring */}
          <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "64px", height: "64px" }}>
            <svg viewBox="0 0 36 36" className="w-100 h-100">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#wellnessScoreGrad)"
                strokeWidth="3.5"
                strokeDasharray={`${wellnessScore}, 100`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="wellnessScoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="position-absolute text-center">
              <FiAward className="text-primary" style={{ fontSize: "1.1rem" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalStatCards;
