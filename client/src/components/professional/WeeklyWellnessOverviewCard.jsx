import React, { useState } from "react";
import { FiActivity, FiTrendingUp, FiArrowRight } from "react-icons/fi";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const metricData = {
  stress: [
    { day: "Mon", val: "35", pct: 35, label: "Moderate" },
    { day: "Tue", val: "42", pct: 42, label: "Moderate" },
    { day: "Wed", val: "28", pct: 28, label: "Low" },
    { day: "Thu", val: "30", pct: 30, label: "Low" },
    { day: "Fri", val: "25", pct: 25, label: "Low" },
    { day: "Sat", val: "18", pct: 18, label: "Very Low" },
    { day: "Sun", val: "20", pct: 20, label: "Very Low" },
  ],
  mood: [
    { day: "Mon", val: "72%", pct: 72, label: "Good" },
    { day: "Tue", val: "68%", pct: 68, label: "Fair" },
    { day: "Wed", val: "85%", pct: 85, label: "Great" },
    { day: "Thu", val: "80%", pct: 80, label: "Good" },
    { day: "Fri", val: "88%", pct: 88, label: "Great" },
    { day: "Sat", val: "92%", pct: 92, label: "Optimal" },
    { day: "Sun", val: "90%", pct: 90, label: "Optimal" },
  ],
  focus: [
    { day: "Mon", val: "5.0h", pct: 62, label: "Focus" },
    { day: "Tue", val: "6.2h", pct: 78, label: "High Focus" },
    { day: "Wed", val: "5.5h", pct: 69, label: "Deep Work" },
    { day: "Thu", val: "4.8h", pct: 60, label: "Focus" },
    { day: "Fri", val: "5.5h", pct: 69, label: "Deep Work" },
    { day: "Sat", val: "2.0h", pct: 25, label: "Light Work" },
    { day: "Sun", val: "1.5h", pct: 18, label: "Rest Day" },
  ],
  sleep: [
    { day: "Mon", val: "6.8h", pct: 68, label: "Fair" },
    { day: "Tue", val: "7.0h", pct: 70, label: "Good" },
    { day: "Wed", val: "7.5h", pct: 75, label: "Good" },
    { day: "Thu", val: "6.5h", pct: 65, label: "Fair" },
    { day: "Fri", val: "7.8h", pct: 78, label: "Good" },
    { day: "Sat", val: "8.2h", pct: 82, label: "Deep Sleep" },
    { day: "Sun", val: "8.0h", pct: 80, label: "Deep Sleep" },
  ]
};

function WeeklyWellnessOverviewCard({ onViewAnalytics }) {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "stress" | "mood" | "focus" | "sleep"

  return (
    <div className="ns-card h-100">
      {/* Header with Metrics Tabs */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary">
            <FiActivity className="fs-5" />
          </div>
          <div>
            <h5 className="mb-0 text-white fw-bold fs-6">Weekly Wellness Overview</h5>
            <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
              Workplace performance & health trends across 7 days
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="d-flex align-items-center gap-1 bg-dark p-1 rounded-3 border border-secondary border-opacity-25 flex-wrap">
          <button
            className={`ns-chart-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Combined Trend
          </button>
          <button
            className={`ns-chart-tab-btn ${activeTab === "stress" ? "active" : ""}`}
            onClick={() => setActiveTab("stress")}
          >
            Stress
          </button>
          <button
            className={`ns-chart-tab-btn ${activeTab === "mood" ? "active" : ""}`}
            onClick={() => setActiveTab("mood")}
          >
            Mood
          </button>
          <button
            className={`ns-chart-tab-btn ${activeTab === "focus" ? "active" : ""}`}
            onClick={() => setActiveTab("focus")}
          >
            Focus
          </button>
          <button
            className={`ns-chart-tab-btn ${activeTab === "sleep" ? "active" : ""}`}
            onClick={() => setActiveTab("sleep")}
          >
            Sleep
          </button>
        </div>
      </div>

      {/* Chart Visual Container */}
      <div className="ns-chart-container p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
        {activeTab === "all" && (
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-center mb-2 px-2 text-muted" style={{ fontSize: "0.78rem" }}>
              {days.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Combined SVG Glowing Multi-Line Chart */}
            <svg viewBox="0 0 500 160" className="w-100" style={{ maxHeight: "170px" }}>
              <defs>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

              {/* Focus Area Fill & Spline (Blue) */}
              <polygon points="20,80 90,50 160,65 235,90 310,65 385,130 460,140 460,150 20,150" fill="url(#focusGrad)" />
              <path d="M20,80 Q90,50 160,65 T310,65 T460,140" fill="none" stroke="#3B82F6" strokeWidth="3" />

              {/* Mood Line (Green) */}
              <path d="M20,60 Q90,75 160,35 T310,30 T460,25" fill="none" stroke="#10B981" strokeWidth="3" />

              {/* Stress Line (Amber/Orange) */}
              <path d="M20,110 Q90,95 160,130 T310,135 T460,140" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5,5" />

              {/* Sleep Line (Purple) */}
              <path d="M20,70 Q90,65 160,55 T310,48 T460,40" fill="none" stroke="#8B5CF6" strokeWidth="2.5" />

              {/* Highlight Nodes */}
              <circle cx="160" cy="35" r="4" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
              <circle cx="310" cy="65" r="4" fill="#3B82F6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="460" cy="40" r="4" fill="#8B5CF6" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Legend Indicators */}
            <div className="d-flex align-items-center justify-content-center gap-4 mt-2" style={{ fontSize: "0.76rem" }}>
              <span className="d-flex align-items-center gap-1 text-info"><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3B82F6" }}></span> Focus</span>
              <span className="d-flex align-items-center gap-1 text-success"><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981" }}></span> Mood</span>
              <span className="d-flex align-items-center gap-1 text-warning"><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }}></span> Stress</span>
              <span className="d-flex align-items-center gap-1 text-purple-300" style={{ color: "#a78bfa" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#8B5CF6" }}></span> Sleep</span>
            </div>
          </div>
        )}

        {activeTab !== "all" && (
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-end px-2 py-2" style={{ height: "140px" }}>
              {metricData[activeTab].map((item, idx) => (
                <div key={idx} className="d-flex flex-column align-items-center gap-1" style={{ width: "12%" }}>
                  <span className="text-white fw-bold" style={{ fontSize: "0.72rem" }}>{item.val}</span>
                  <div className="w-100 bg-dark rounded-top position-relative" style={{ height: "90px" }}>
                    <div 
                      className="w-100 rounded-top position-absolute bottom-0"
                      style={{ 
                        height: `${item.pct}%`, 
                        background: activeTab === "stress" 
                          ? "linear-gradient(180deg, #F59E0B, #EF4444)" 
                          : activeTab === "mood" 
                          ? "linear-gradient(180deg, #10B981, #3B82F6)" 
                          : activeTab === "focus" 
                          ? "linear-gradient(180deg, #3B82F6, #8B5CF6)" 
                          : "linear-gradient(180deg, #8B5CF6, #6366F1)",
                        boxShadow: idx === 5 ? "0 0 10px rgba(59, 130, 246, 0.5)" : "none"
                      }}
                    />
                  </div>
                  <span className="text-muted" style={{ fontSize: "0.75rem" }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-25">
        <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
          <FiTrendingUp className="text-success" /> Weekly trend indicates +14% focus efficiency & low workplace stress.
        </div>
        <button
          className="btn btn-link text-primary text-decoration-none p-0 fw-semibold d-flex align-items-center gap-1"
          style={{ fontSize: "0.83rem" }}
          onClick={onViewAnalytics}
        >
          View Full Analytics <FiArrowRight />
        </button>
      </div>
    </div>
  );
}

export default WeeklyWellnessOverviewCard;
