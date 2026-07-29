import React, { useState } from "react";
import { FiTrendingUp, FiActivity, FiClock, FiTarget } from "react-icons/fi";

function WeeklyProgressCard() {
  const [activeView, setActiveView] = useState("mood"); // mood | hours | goals

  return (
    <div className="ns-card h-100">
      {/* Header with Tabs */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <FiActivity className="text-primary fs-5" />
          <h5 className="mb-0 text-white fw-bold fs-6">Weekly Progress</h5>
        </div>

        {/* Tab Controls */}
        <div className="d-flex align-items-center gap-1 bg-dark p-1 rounded-3 border border-secondary border-opacity-25">
          <button
            className={`ns-chart-tab-btn ${activeView === "mood" ? "active" : ""}`}
            onClick={() => setActiveView("mood")}
          >
            Mood Trend
          </button>
          <button
            className={`ns-chart-tab-btn ${activeView === "hours" ? "active" : ""}`}
            onClick={() => setActiveView("hours")}
          >
            Study Hours
          </button>
          <button
            className={`ns-chart-tab-btn ${activeView === "goals" ? "active" : ""}`}
            onClick={() => setActiveView("goals")}
          >
            Goal Completion
          </button>
        </div>
      </div>

      {/* Chart Visual Container Placeholder */}
      <div className="ns-chart-container p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
        {activeView === "mood" && (
          <div className="w-100 text-center">
            <div className="d-flex justify-content-between align-items-center mb-2 px-2 text-muted" style={{ fontSize: "0.78rem" }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            {/* SVG Glowing Line Chart Placeholder */}
            <svg viewBox="0 0 500 150" className="w-100" style={{ maxHeight: "160px" }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              {/* Area fill */}
              <polygon points="10,120 80,90 150,110 220,40 290,65 360,30 430,50 490,20 490,140 10,140" fill="url(#moodGradient)" />
              {/* Spline Line */}
              <path d="M10,120 Q80,90 150,110 T290,65 T430,50 T490,20" fill="none" stroke="url(#lineGrad)" strokeWidth="3" />
              {/* Highlight Nodes */}
              <circle cx="220" cy="40" r="5" fill="#3B82F6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="360" cy="30" r="5" fill="#8B5CF6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="490" cy="20" r="5" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div className="mt-2 text-muted" style={{ fontSize: "0.75rem" }}>
              <FiTrendingUp className="text-success me-1" /> Peak emotional wellness recorded on Saturday (88% positivity score).
            </div>
          </div>
        )}

        {activeView === "hours" && (
          <div className="w-100 text-center">
            {/* SVG Bar Chart Graphic Placeholder */}
            <div className="d-flex justify-content-between align-items-end px-3 py-2" style={{ height: "140px" }}>
              {[
                { day: "Mon", hrs: "3.5h", pct: 60 },
                { day: "Tue", hrs: "4.0h", pct: 75 },
                { day: "Wed", hrs: "5.2h", pct: 90 },
                { day: "Thu", hrs: "2.8h", pct: 45 },
                { day: "Fri", hrs: "4.5h", pct: 80 },
                { day: "Sat", hrs: "6.0h", pct: 100 },
                { day: "Sun", hrs: "3.0h", pct: 50 },
              ].map((item, idx) => (
                <div key={idx} className="d-flex flex-column align-items-center gap-1" style={{ width: "12%" }}>
                  <span className="text-white fw-bold" style={{ fontSize: "0.72rem" }}>{item.hrs}</span>
                  <div className="w-100 bg-dark rounded-top position-relative" style={{ height: "90px" }}>
                    <div 
                      className="w-100 rounded-top position-absolute bottom-0"
                      style={{ 
                        height: `${item.pct}%`, 
                        background: idx === 5 ? "linear-gradient(180deg, #8B5CF6, #3B82F6)" : "rgba(59, 130, 246, 0.4)",
                        boxShadow: idx === 5 ? "0 0 12px rgba(139, 92, 246, 0.5)" : "none"
                      }}
                    />
                  </div>
                  <span className="text-muted" style={{ fontSize: "0.75rem" }}>{item.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 text-muted" style={{ fontSize: "0.75rem" }}>
              <FiClock className="text-primary me-1" /> Total study time this week: <strong>29.0 Hours</strong> (Avg 4.1h/day)
            </div>
          </div>
        )}

        {activeView === "goals" && (
          <div className="w-100 d-flex flex-column flex-sm-row align-items-center justify-content-around gap-3 py-2">
            {/* Donut Chart Visual Placeholder */}
            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "120px", height: "120px" }}>
              <svg viewBox="0 0 36 36" className="w-100 h-100">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#goalGrad)"
                  strokeWidth="3.8"
                  strokeDasharray="80, 100"
                />
                <defs>
                  <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="position-absolute text-center">
                <div className="fw-extrabold text-white fs-4 lh-1">80%</div>
                <div className="text-muted" style={{ fontSize: "0.65rem" }}>COMPLETED</div>
              </div>
            </div>

            <div className="text-start">
              <div className="mb-2">
                <span className="text-white fw-bold">12 of 15 Goals Achieved</span>
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>3 micro-goals remaining for this sprint</div>
              </div>
              <div className="d-flex flex-column gap-1" style={{ fontSize: "0.78rem" }}>
                <div className="text-success"><FiTarget className="me-1" /> DBMS Module 4 Completed</div>
                <div className="text-success"><FiTarget className="me-1" /> 7-Day Focus Streak Hit</div>
                <div className="text-warning"><FiTarget className="me-1" /> Pending: Java Exception Handling</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-2">
        <span className="text-muted" style={{ fontSize: "0.72rem" }}>
          * Integrated visualization container ready for Chart.js / Recharts binding.
        </span>
      </div>
    </div>
  );
}

export default WeeklyProgressCard;
