import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import "../styles/studentDashboard.css";
import {
  FiTrendingUp,
  FiActivity,
  FiBookOpen,
  FiCalendar,
  FiTarget,
  FiClock,
  FiSmile,
  FiZap,
  FiRefreshCw,
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
  FiCpu,
  FiArrowUp,
  FiArrowDown,
  FiInfo,
} from "react-icons/fi";

function StudentProgress() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  const [period, setPeriod] = useState("week"); // week | month | 3months
  const [activeTrendMetric, setActiveTrendMetric] = useState("study"); // study | focus | goals | wellness

  const [progressState, setProgressState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const fetchProgressData = async (selectedPeriod) => {
    setProgressState({ loading: true, error: null, data: null });
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setProgressState({
        loading: false,
        error: "Authentication required. Please log in.",
        data: null,
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/progress?period=${selectedPeriod}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setProgressState({
          loading: false,
          error: json.message || "Failed to load progress analytics.",
          data: null,
        });
        return;
      }

      setProgressState({
        loading: false,
        error: null,
        data: json.data,
      });
    } catch (err) {
      console.error("Fetch Progress Error:", err);
      setProgressState({
        loading: false,
        error: "Cannot connect to server. Please check your connection.",
        data: null,
      });
    }
  };

  useEffect(() => {
    fetchProgressData(period);
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Excellent":
        return "bg-success text-white";
      case "Good":
        return "bg-info text-dark";
      case "Improving":
        return "bg-primary text-white";
      case "Needs Attention":
      default:
        return "bg-warning text-dark";
    }
  };

  const periodLabel = period === "week" ? "last week" : period === "month" ? "last month" : "last 3 months";

  const { loading, error, data } = progressState;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        activeTab="progress"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Top Navbar */}
      <TopNavbar
        studentName={studentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="ns-main-content">
        {/* 1. PAGE HEADER */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
              <FiTrendingUp className="text-primary" /> Your Progress
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              Track your learning, productivity, emotional wellness and personal growth.
            </p>
          </div>

          {/* Time Filter Tabs */}
          <div className="d-flex align-items-center gap-1 bg-dark p-1 rounded-3 border border-secondary border-opacity-25 align-self-start align-self-md-center">
            <button
              className={`ns-chart-tab-btn ${period === "week" ? "active" : ""}`}
              onClick={() => handlePeriodChange("week")}
            >
              This Week
            </button>
            <button
              className={`ns-chart-tab-btn ${period === "month" ? "active" : ""}`}
              onClick={() => handlePeriodChange("month")}
            >
              This Month
            </button>
            <button
              className={`ns-chart-tab-btn ${period === "3months" ? "active" : ""}`}
              onClick={() => handlePeriodChange("3months")}
            >
              Last 3 Months
            </button>
          </div>
        </div>

        {/* LOADING STATE SKELETON */}
        {loading && (
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="ns-card p-5 text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-white">Calculating your analytics score...</h5>
                <p className="text-muted small mb-0">Analyzing study tasks, focus sessions, mood logs, and goals.</p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="ns-card p-4 text-center my-4 border-danger border-opacity-50">
            <FiAlertCircle size={40} className="text-danger mb-2" />
            <h5 className="text-white fw-bold mb-2">Unable to Load Progress</h5>
            <p className="text-muted mb-3">{error}</p>
            <button
              className="ns-btn-primary px-4 py-2"
              onClick={() => fetchProgressData(period)}
            >
              <FiRefreshCw className="me-2" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* EMPTY STATE */}
            {!data.hasData && (
              <div className="ns-card p-4 mb-4 text-center border-primary border-opacity-25" style={{ background: "rgba(30, 41, 59, 0.4)" }}>
                <FiInfo size={36} className="text-primary mb-2" />
                <h5 className="text-white fw-bold mb-1">No progress data available yet.</h5>
                <p className="text-muted mb-3" style={{ maxWidth: "600px", margin: "0 auto", fontSize: "0.9rem" }}>
                  Complete your first daily check-in, study task or focus session to start building your personal growth and productivity analytics.
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => navigate("/student/checkin")}>
                    Daily Check-in
                  </button>
                  <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => navigate("/student/study-planner")}>
                    Study Planner
                  </button>
                  <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => navigate("/student/focus-timer")}>
                    Focus Timer
                  </button>
                </div>
              </div>
            )}

            {/* 2. OVERALL PROGRESS SCORE CARD */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="ns-card p-4 position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
                  <div className="row align-items-center g-4">
                    <div className="col-lg-7 col-md-8">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge rounded-pill bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 px-3 py-1" style={{ fontSize: "0.8rem" }}>
                          OVERALL GROWTH METRIC
                        </span>
                        <span className={`badge rounded-pill ${getStatusBadgeClass(data.status)} px-3 py-1`} style={{ fontSize: "0.8rem" }}>
                          {data.status}
                        </span>
                      </div>
                      <h3 className="text-white fw-extrabold mb-2">Overall Progress</h3>
                      <p className="text-white-50 mb-3" style={{ fontSize: "0.92rem", maxWidth: "580px" }}>
                        Weighted index calculated from your study completion (30%), goal milestones (20%), focus sessions (20%), mood consistency (15%), journaling (10%), and daily check-ins (5%).
                      </p>

                      {/* Comparison Trend */}
                      <div className="d-flex align-items-center gap-2">
                        <span className={`d-inline-flex align-items-center gap-1 fw-bold ${data.isImprovement ? "text-success" : "text-danger"}`} style={{ fontSize: "0.95rem" }}>
                          {data.isImprovement ? <FiArrowUp /> : <FiArrowDown />} {data.improvementPercentage}%
                        </span>
                        <span className="text-muted" style={{ fontSize: "0.88rem" }}>
                          compared with {periodLabel} (Previous: {data.previousPeriodProgress}%)
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Gauge / Score Badge */}
                    <div className="col-lg-5 col-md-4 text-center">
                      <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: "160px", height: "160px" }}>
                        <svg viewBox="0 0 36 36" className="w-100 h-100">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="3.2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#overallScoreGrad)"
                            strokeWidth="3.8"
                            strokeDasharray={`${data.overallProgress}, 100`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="overallScoreGrad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="position-absolute text-center">
                          <div className="display-5 fw-extrabold text-white lh-1">{data.overallProgress}%</div>
                          <div className="text-muted fw-semibold mt-1" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>
                            PROGRESS SCORE
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. QUICK STATISTICS CARDS (4 CARDS) */}
            <div className="row g-3 mb-4">
              {/* Card 1: Study Completion */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Study Completion</span>
                    <div className="ns-stat-icon-wrapper sm study">
                      <FiCalendar size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white fw-bold mb-0">
                      {data.study.completed} / {data.study.total}
                    </h3>
                    <div className="text-primary fw-semibold small mt-1">
                      {data.study.completionRate}% completed
                    </div>
                  </div>
                  <div className="progress mt-3 bg-dark border border-secondary border-opacity-25" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-primary rounded"
                      style={{ width: `${data.study.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Goal Progress */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Goal Progress</span>
                    <div className="ns-stat-icon-wrapper sm goals">
                      <FiTarget size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white fw-bold mb-0">
                      {data.goals.completed} / {data.goals.total}
                    </h3>
                    <div className="text-success fw-semibold small mt-1">
                      {data.goals.active} Active Goals ({data.goals.overallProgress}% total rate)
                    </div>
                  </div>
                  <div className="progress mt-3 bg-dark border border-secondary border-opacity-25" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-success rounded"
                      style={{ width: `${data.goals.overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Focus Time */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Focus Time</span>
                    <div className="ns-stat-icon-wrapper sm focus">
                      <FiClock size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white fw-bold mb-0">{data.focus.totalHours} hrs</h3>
                    <div className="text-purple-300 fw-semibold small mt-1" style={{ color: "#c084fc" }}>
                      {data.focus.sessionCount} Sessions (Avg {data.focus.avgDuration} min)
                    </div>
                  </div>
                  <div className="progress mt-3 bg-dark border border-secondary border-opacity-25" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-purple-500 rounded"
                      style={{ width: `${Math.min(100, (data.focus.totalHours / 15) * 100)}%`, backgroundColor: "#8b5cf6" }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Journal Streak */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Journal Streak</span>
                    <div className="ns-stat-icon-wrapper sm streak">
                      <FiZap size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white fw-bold mb-0">{data.journal.currentStreak} Days 🔥</h3>
                    <div className="text-warning fw-semibold small mt-1">
                      {data.journal.totalEntriesAllTime} Total Entries (Best: {data.journal.longestStreak} days)
                    </div>
                  </div>
                  <div className="progress mt-3 bg-dark border border-secondary border-opacity-25" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-warning rounded"
                      style={{ width: `${Math.min(100, (data.journal.currentStreak / 7) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. WEEKLY / MONTHLY PROGRESS TREND CHART */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="ns-card p-4">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <FiActivity className="text-primary fs-5" />
                      <h5 className="mb-0 text-white fw-bold">Progress Trend</h5>
                    </div>

                    {/* Metric Toggle Tabs */}
                    <div className="d-flex align-items-center gap-1 bg-dark p-1 rounded-3 border border-secondary border-opacity-25">
                      <button
                        className={`ns-chart-tab-btn ${activeTrendMetric === "study" ? "active" : ""}`}
                        onClick={() => setActiveTrendMetric("study")}
                      >
                        Study (%)
                      </button>
                      <button
                        className={`ns-chart-tab-btn ${activeTrendMetric === "focus" ? "active" : ""}`}
                        onClick={() => setActiveTrendMetric("focus")}
                      >
                        Focus (Hours)
                      </button>
                      <button
                        className={`ns-chart-tab-btn ${activeTrendMetric === "goals" ? "active" : ""}`}
                        onClick={() => setActiveTrendMetric("goals")}
                      >
                        Goals (%)
                      </button>
                      <button
                        className={`ns-chart-tab-btn ${activeTrendMetric === "wellness" ? "active" : ""}`}
                        onClick={() => setActiveTrendMetric("wellness")}
                      >
                        Wellness (%)
                      </button>
                    </div>
                  </div>

                  {/* SVG Chart Container */}
                  <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-center">
                    {data.trends && data.trends.length > 0 ? (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2 px-2 text-muted" style={{ fontSize: "0.78rem" }}>
                          {data.trends.map((t, idx) => (
                            <span key={idx}>{t.label}</span>
                          ))}
                        </div>

                        {/* Interactive Dynamic SVG Area Chart */}
                        <svg viewBox="0 0 600 160" className="w-100" style={{ maxHeight: "180px" }}>
                          <defs>
                            <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
                            </linearGradient>
                            <linearGradient id="trendLineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Grid lines */}
                          <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                          <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                          <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

                          {/* Dynamic Points Calculation */}
                          {(() => {
                            const len = data.trends.length;
                            const maxVal = activeTrendMetric === "focus"
                              ? Math.max(3, ...data.trends.map((t) => t.focus))
                              : 100;

                            const points = data.trends.map((t, idx) => {
                              const val = t[activeTrendMetric] || 0;
                              const x = 20 + (idx / Math.max(1, len - 1)) * 560;
                              const y = 140 - (val / maxVal) * 110;
                              return { x, y, val };
                            });

                            const pointsPathStr = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                            const areaPathStr = `${pointsPathStr} L${points[points.length - 1].x},140 L${points[0].x},140 Z`;

                            return (
                              <g>
                                <path d={areaPathStr} fill="url(#trendAreaGrad)" />
                                <path d={pointsPathStr} fill="none" stroke="url(#trendLineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                {points.map((p, i) => (
                                  <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5" fill="#3B82F6" stroke="#ffffff" strokeWidth="2" />
                                    <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                                      {activeTrendMetric === "focus" ? `${p.val}h` : `${p.val}%`}
                                    </text>
                                  </g>
                                ))}
                              </g>
                            );
                          })()}
                        </svg>
                        <div className="mt-2 text-muted small">
                          Showing breakdown of {activeTrendMetric.toUpperCase()} progress across selected {periodLabel}.
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-muted">No trend data available for this range.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. STUDY PERFORMANCE & 6. GOAL ACHIEVEMENT SECTIONS */}
            <div className="row g-4 mb-4">
              {/* 5. STUDY PERFORMANCE */}
              <div className="col-lg-6">
                <div className="ns-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                      <FiCalendar className="text-primary" /> Study Performance
                    </h5>
                    <button className="btn btn-sm btn-link text-primary text-decoration-none p-0" onClick={() => navigate("/student/study-planner")}>
                      View Planner →
                    </button>
                  </div>

                  <div className="row g-3 mb-3 text-center">
                    <div className="col-3">
                      <div className="p-2 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-white fw-bold fs-5">{data.study.total}</div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>Planned</div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-2 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-success fw-bold fs-5">{data.study.completed}</div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>Completed</div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-2 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-warning fw-bold fs-5">{data.study.pending}</div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>Pending</div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-2 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-danger fw-bold fs-5">{data.study.overdue}</div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>Overdue</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Display */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.85rem" }}>
                      <span className="text-white fw-semibold">Completion Rate</span>
                      <span className="text-primary fw-bold">{data.study.completionRate}%</span>
                    </div>
                    <div className="progress bg-dark border border-secondary border-opacity-25" style={{ height: "12px" }}>
                      <div className="progress-bar bg-gradient-primary rounded" style={{ width: `${data.study.completionRate}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-25 text-white-50" style={{ fontSize: "0.85rem" }}>
                    <FiInfo className="text-primary me-2" />
                    {data.study.overdue > 0
                      ? `${data.study.overdue} task(s) are overdue. Reschedule or clear them to boost your overall completion score.`
                      : `All scheduled study tasks are on track!`}
                  </div>
                </div>
              </div>

              {/* 6. GOAL ACHIEVEMENT */}
              <div className="col-lg-6">
                <div className="ns-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                      <FiTarget className="text-success" /> Goal Achievement
                    </h5>
                    <button className="btn btn-sm btn-link text-success text-decoration-none p-0" onClick={() => navigate("/student/goals")}>
                      Manage Goals →
                    </button>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-3 p-3 rounded bg-dark border border-secondary border-opacity-25">
                    <div>
                      <div className="text-white fw-bold fs-5">{data.goals.completed} of {data.goals.total} Achieved</div>
                      <div className="text-muted small">{data.goals.active} Active Goals in progress</div>
                    </div>
                    <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 fs-6 px-3 py-2">
                      {data.goals.overallProgress}% Done
                    </span>
                  </div>

                  {/* Active Goals Individual Progress List */}
                  <h6 className="text-white-50 fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Active Goals Progress</h6>
                  {data.goals.activeGoalsList && data.goals.activeGoalsList.length > 0 ? (
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: "160px", overflowY: "auto" }}>
                      {data.goals.activeGoalsList.map((goal) => (
                        <div key={goal.id} className="p-2 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                          <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.82rem" }}>
                            <span className="text-white fw-medium text-truncate" style={{ maxWidth: "200px" }}>{goal.title}</span>
                            <span className="text-success fw-bold">{goal.progress}%</span>
                          </div>
                          <div className="progress bg-dark" style={{ height: "6px" }}>
                            <div className="progress-bar bg-success rounded" style={{ width: `${goal.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small py-3 text-center">No active goals currently logged.</div>
                  )}
                </div>
              </div>
            </div>

            {/* 7. FOCUS / PRODUCTIVITY & 8. EMOTIONAL WELLNESS SECTIONS */}
            <div className="row g-4 mb-4">
              {/* 7. FOCUS / PRODUCTIVITY */}
              <div className="col-lg-6">
                <div className="ns-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                      <FiClock className="text-purple-400" style={{ color: "#a855f7" }} /> Focus & Productivity
                    </h5>
                    <button className="btn btn-sm btn-link text-purple-300 text-decoration-none p-0" style={{ color: "#c084fc" }} onClick={() => navigate("/student/focus-timer")}>
                      Focus Timer →
                    </button>
                  </div>

                  <div className="row g-3 text-center mb-3">
                    <div className="col-6">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-white fw-bold fs-4">{data.focus.totalHours} hrs</div>
                        <div className="text-muted small">Total Focus Time</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-purple-300 fw-bold fs-4" style={{ color: "#c084fc" }}>{data.focus.sessionCount}</div>
                        <div className="text-muted small">Sessions Completed</div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-25" style={{ fontSize: "0.85rem" }}>
                    <span className="text-muted">Average Session: <strong className="text-white">{data.focus.avgDuration} mins</strong></span>
                    <span className="text-muted">Longest Session: <strong className="text-white">{data.focus.longestSession} mins</strong></span>
                  </div>
                </div>
              </div>

              {/* 8. EMOTIONAL WELLNESS */}
              <div className="col-lg-6">
                <div className="ns-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                      <FiSmile className="text-info" /> Emotional Wellness
                    </h5>
                    <button className="btn btn-sm btn-link text-info text-decoration-none p-0" onClick={() => navigate("/student/mood-tracker")}>
                      Mood Tracker →
                    </button>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <div className="col-6 text-center">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="display-6 fw-bold text-info">{data.mood.avgScore} / 5</div>
                        <div className="text-muted small">Average Mood Score</div>
                      </div>
                    </div>
                    <div className="col-6 text-center">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-white fw-bold fs-5">{data.mood.mostFrequent}</div>
                        <div className="text-muted small">Most Frequent Mood</div>
                      </div>
                    </div>
                  </div>

                  {/* Mood Distribution */}
                  <div className="p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                    <div className="text-muted small mb-2">Mood Log Count: <strong>{data.mood.totalEntries} entries</strong></div>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(data.mood.distribution || {}).map(([moodKey, count]) =>
                        count > 0 ? (
                          <span key={moodKey} className="badge bg-secondary bg-opacity-30 text-white border border-secondary border-opacity-30 px-2 py-1" style={{ fontSize: "0.78rem" }}>
                            {moodKey}: {count}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. JOURNAL INSIGHTS */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="ns-card p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                      <FiBookOpen className="text-warning" /> Journaling Activity
                    </h5>
                    <button className="btn btn-sm btn-link text-warning text-decoration-none p-0" onClick={() => navigate("/student/journal")}>
                      Open Journal →
                    </button>
                  </div>

                  <div className="row g-3 text-center">
                    <div className="col-md-3 col-6">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-white fw-bold fs-4">{data.journal.currentStreak} Days</div>
                        <div className="text-muted small">Current Streak</div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-warning fw-bold fs-4">{data.journal.longestStreak} Days</div>
                        <div className="text-muted small">Longest Streak</div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-white fw-bold fs-4">{data.journal.totalEntries}</div>
                        <div className="text-muted small">Entries in Period</div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                        <div className="text-info fw-bold fs-4">{data.journal.totalEntriesAllTime}</div>
                        <div className="text-muted small">Total All-Time Entries</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. AI PROGRESS INSIGHT CARD */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="ns-card p-4" style={{ background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(88, 28, 135, 0.25) 100%)", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="ns-brand-icon p-2 rounded-circle bg-purple-500 bg-opacity-20 text-purple-300">
                      <FiCpu size={22} style={{ color: "#c084fc" }} />
                    </div>
                    <div>
                      <h5 className="text-white fw-bold mb-0">NeuroSync AI Progress Insight</h5>
                      <span className="text-muted small">Generated from your live database activity</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 mb-3 text-white-50" style={{ fontSize: "0.92rem", lineHeight: "1.6" }}>
                    "{data.insights.summary}"
                  </div>

                  <div>
                    <h6 className="text-purple-300 fw-bold mb-1" style={{ color: "#c084fc", fontSize: "0.88rem" }}>
                      Recommended Action:
                    </h6>
                    <p className="text-white mb-0" style={{ fontSize: "0.9rem" }}>
                      👉 {data.insights.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

export default StudentProgress;
