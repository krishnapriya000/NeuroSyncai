import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import "../styles/studentDashboard.css";
import {
  FiCompass,
  FiClock,
  FiZap,
  FiSmile,
  FiTarget,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiCalendar,
  FiCpu,
  FiCoffee,
  FiAward,
  FiActivity,
  FiArrowRight,
} from "react-icons/fi";

function ProfessionalWorkLifeBalance() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profName, setProfName] = useState("Professional User");

  const [period, setPeriod] = useState("week"); // week | month | 3months
  const [activeTrendMetric, setActiveTrendMetric] = useState("balanceScore");

  const [analyticsState, setAnalyticsState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setProfName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const fetchAnalytics = async (selectedPeriod = period) => {
    setAnalyticsState((prev) => ({ ...prev, loading: true, error: null }));
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setAnalyticsState({
        loading: false,
        error: "Authentication token missing. Please log in.",
        data: null,
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/professional/work-life-balance?period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        setAnalyticsState({
          loading: false,
          error: json.message || "Failed to load Work-Life Balance analytics.",
          data: null,
        });
        return;
      }

      setAnalyticsState({
        loading: false,
        error: null,
        data: json,
      });
    } catch (err) {
      console.error("Fetch Work-Life Analytics Error:", err);
      setAnalyticsState({
        loading: false,
        error: "Unable to connect to server. Please check your connection.",
        data: null,
      });
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const { loading, error, data } = analyticsState;

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent Balance":
        return "#10B981";
      case "Good Balance":
        return "#3B82F6";
      case "Moderate Balance":
        return "#F59E0B";
      default:
        return "#EF4444";
    }
  };

  return (
    <div className="dashboard-container" style={{ background: "#0B0F19", color: "#F8FAFC" }}>
      {/* Sidebar */}
      <ProfessionalSidebar
        activeTab="balance"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Top Navbar */}
      <ProfessionalNavbar
        userName={profName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="ns-main-content">
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60A5FA",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  fontSize: "0.78rem",
                }}
              >
                <FiCompass className="me-1" /> Work-Life Balance & Productivity Analytics
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">Work-Life Balance</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Understand your work patterns and maintain a healthier balance between productivity and personal well-being.
            </p>
          </div>

          {/* Time Period Filter */}
          <div className="d-flex align-items-center gap-2">
            {[
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "3months", label: "Last 3 Months" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold transition-all ${
                  period === p.id
                    ? "btn-primary text-white shadow-sm"
                    : "btn-outline-secondary text-white-50 border-secondary border-opacity-25"
                }`}
                style={{ fontSize: "0.84rem" }}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}

            <button
              className="btn btn-dark btn-sm rounded-circle p-2 border-secondary border-opacity-25 text-white-50 ms-1"
              onClick={() => fetchAnalytics(period)}
              title="Refresh Analytics"
            >
              <FiRefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="d-flex flex-column gap-4 my-4">
            <div className="ns-card p-4 rounded-4 placeholder-wave opacity-75">
              <div className="bg-secondary bg-opacity-30 rounded mb-3" style={{ width: "200px", height: "24px" }} />
              <div className="bg-secondary bg-opacity-20 rounded" style={{ width: "100%", height: "120px" }} />
            </div>
            <div className="row g-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-12 col-md-3">
                  <div className="ns-card p-3 rounded-4 placeholder-wave opacity-75" style={{ height: "100px" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="ns-card p-5 text-center my-4 border-danger border-opacity-50">
            <FiAlertCircle size={44} className="text-danger mb-3" />
            <h4 className="text-white fw-bold mb-2">Unable to load work-life data</h4>
            <p className="text-muted mb-4">{error}</p>
            <button className="ns-btn-primary px-4 py-2" onClick={() => fetchAnalytics(period)}>
              <FiRefreshCw className="me-2" /> Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE (0 Check-ins) */}
        {!loading && !error && data && data.totalCheckIns === 0 && (
          <div className="ns-card p-5 text-center my-4 border-secondary border-opacity-25 rounded-4">
            <div className="p-3 rounded-circle bg-primary bg-opacity-10 d-inline-block mb-3 border border-primary border-opacity-30">
              <FiCompass size={48} className="text-primary" />
            </div>
            <h3 className="text-white fw-bold mb-2">Start tracking your work-life balance</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "480px", fontSize: "0.95rem" }}>
              Complete a few Daily Check-ins to see your work patterns, stress, energy, break consistency, and personalized insights here.
            </p>
            <button
              type="button"
              className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-inline-flex align-items-center gap-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none" }}
              onClick={() => navigate("/professional/checkin")}
            >
              <span>Complete Daily Check-in</span>
              <FiArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ANALYTICS DASHBOARD CONTENT (When data exists) */}
        {!loading && !error && data && data.totalCheckIns > 0 && (
          <>
            {/* INSUFFICIENT DATA NOTICE FOR < 3 CHECK-INS */}
            {data.totalCheckIns < 3 && (
              <div
                className="alert d-flex align-items-center justify-content-between rounded-4 p-3 mb-4 border-0"
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  borderLeft: "4px solid #F59E0B",
                  color: "#FDE68A",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <FiAlertCircle size={20} className="text-warning flex-shrink-0" />
                  <span className="small">
                    More check-ins are needed to identify reliable work-stress patterns. Complete a few more daily check-ins for detailed trend predictions!
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning text-warning border-warning border-opacity-30 rounded-pill px-3 ms-2"
                  onClick={() => navigate("/professional/checkin")}
                >
                  Check In Now
                </button>
              </div>
            )}

            {/* 1. OVERALL WORK-LIFE BALANCE SCORE CARD */}
            <div
              className="ns-card p-4 mb-4 rounded-4 position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)",
                border: `1px solid ${getStatusColor(data.status)}40`,
              }}
            >
              <div className="row g-4 align-items-center">
                <div className="col-12 col-md-7 col-lg-8">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge rounded-pill px-3 py-1 text-uppercase fw-bold" style={{ background: `${getStatusColor(data.status)}25`, color: getStatusColor(data.status), border: `1px solid ${getStatusColor(data.status)}50`, fontSize: "0.75rem" }}>
                      {data.status}
                    </span>
                    <span className="text-muted small">Based on {data.totalCheckIns} check-in entries ({data.period})</span>
                  </div>

                  <h3 className="text-white fw-bold mb-2">Work-Life Balance Score</h3>
                  <p className="text-white-50 mb-3" style={{ fontSize: "0.92rem", maxWidth: "600px" }}>
                    Calculated from your reported working hours, stress levels, energy, focus, sleep, and break consistency.
                  </p>

                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="d-flex align-items-center gap-2 fs-6">
                      {data.scoreChange >= 0 ? (
                        <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1">
                          <FiTrendingUp /> ↑ {data.scoreChange}% from previous period
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30 px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1">
                          <FiTrendingDown /> ↓ {Math.abs(data.scoreChange)}% from previous period
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-5 col-lg-4 text-center">
                  <div
                    className="rounded-circle d-inline-flex flex-column align-items-center justify-content-center p-4 shadow-lg"
                    style={{
                      width: "140px",
                      height: "140px",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: `4px solid ${getStatusColor(data.status)}`,
                      boxShadow: `0 0 25px ${getStatusColor(data.status)}30`,
                    }}
                  >
                    <span className="fw-extrabold text-white" style={{ fontSize: "2.4rem", lineHeight: "1" }}>
                      {data.overallScore}
                    </span>
                    <span className="text-muted small mt-1">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KEY STATS CARDS GRID */}
            <div className="row g-3 mb-4">
              {/* Avg Working Hours */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="ns-card p-3.5 rounded-4 h-100 border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">AVG WORKING HOURS</span>
                    <div className="p-2 rounded-circle bg-primary bg-opacity-15 text-primary">
                      <FiClock size={18} />
                    </div>
                  </div>
                  <h3 className="text-white fw-bold mb-1">{data.keyStats.avgWorkingHours} <span className="fs-6 fw-normal text-muted">hrs/day</span></h3>
                  <div className="text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                    Total: {data.keyStats.totalWorkingHours} hrs in period
                  </div>
                </div>
              </div>

              {/* Avg Stress */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="ns-card p-3.5 rounded-4 h-100 border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">AVERAGE STRESS</span>
                    <div className="p-2 rounded-circle bg-danger bg-opacity-15 text-danger">
                      <FiActivity size={18} />
                    </div>
                  </div>
                  <h3 className="text-white fw-bold mb-1">{data.keyStats.avgStress} <span className="fs-6 fw-normal text-muted">/ 5</span></h3>
                  <div className="progress rounded-pill bg-dark" style={{ height: "6px" }}>
                    <div
                      className={`progress-bar ${data.keyStats.avgStress > 3.5 ? "bg-danger" : "bg-warning"}`}
                      style={{ width: `${(data.keyStats.avgStress / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Avg Energy */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="ns-card p-3.5 rounded-4 h-100 border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">AVERAGE ENERGY</span>
                    <div className="p-2 rounded-circle bg-success bg-opacity-15 text-success">
                      <FiZap size={18} />
                    </div>
                  </div>
                  <h3 className="text-white fw-bold mb-1">{data.keyStats.avgEnergy} <span className="fs-6 fw-normal text-muted">/ 5</span></h3>
                  <div className="progress rounded-pill bg-dark" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${(data.keyStats.avgEnergy / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Break Pattern */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="ns-card p-3.5 rounded-4 h-100 border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">BREAK PATTERN</span>
                    <div className="p-2 rounded-circle bg-info bg-opacity-15 text-info">
                      <FiCoffee size={18} />
                    </div>
                  </div>
                  <h3 className="text-white fw-bold mb-1 fs-5 text-truncate" title={data.keyStats.breakPattern}>
                    {data.keyStats.breakPattern}
                  </h3>
                  <div className="text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                    Break Consistency: {data.keyStats.breakConsistency}%
                  </div>
                </div>
              </div>
            </div>

            {/* 3. WORK HOURS ANALYSIS & BAR CHART */}
            <div className="ns-card p-4 mb-4 rounded-4 border border-secondary border-opacity-25">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
                <div>
                  <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                    <FiClock className="text-primary" /> Work Hours Analysis
                  </h5>
                  <p className="text-muted small mb-0">Daily distribution of your reported working hours</p>
                </div>
                <div className="d-flex align-items-center gap-3 text-muted small">
                  <span>Longest: <strong className="text-white">{data.workHoursAnalysis.longestWorkday}h</strong></span>
                  <span>Extended Days (&gt;8.5h): <strong className="text-warning">{data.workHoursAnalysis.extendedHoursDays}</strong></span>
                  <span>Manageable Days: <strong className="text-success">{data.workHoursAnalysis.manageableHoursDays}</strong></span>
                </div>
              </div>

              {/* Working Hours Bar Visualization */}
              <div className="d-flex align-items-end gap-2 pt-3 pb-2 overflow-auto" style={{ minHeight: "180px" }}>
                {data.workHoursAnalysis.workingHoursByDay.map((item) => {
                  const barHeightPct = Math.min(100, Math.max(15, (item.workingHours / 14) * 100));
                  const isLong = item.workingHours > 8.5;

                  return (
                    <div key={item.date} className="flex-grow-1 d-flex flex-column align-items-center gap-2" style={{ minWidth: "45px" }}>
                      <span className="text-white-50 extra-small fw-bold">{item.workingHours}h</span>
                      <div
                        className={`w-100 rounded-3 transition-all ${isLong ? "bg-warning bg-opacity-75" : "bg-primary bg-opacity-75"}`}
                        style={{
                          height: `${barHeightPct}%`,
                          minHeight: "20px",
                          boxShadow: isLong ? "0 0 10px rgba(245, 158, 11, 0.3)" : "0 0 10px rgba(59, 130, 246, 0.3)",
                        }}
                        title={`${item.dayLabel}: ${item.workingHours} hours worked`}
                      />
                      <span className="text-muted extra-small text-nowrap" style={{ fontSize: "0.72rem" }}>
                        {item.dayLabel.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. STRESS VS WORK HOURS & BREAK RECOVERY ROW */}
            <div className="row g-4 mb-4">
              {/* Stress vs Work Hours Correlation */}
              <div className="col-12 col-lg-7">
                <div className="ns-card p-4 rounded-4 h-100 border border-secondary border-opacity-25">
                  <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                    <FiActivity className="text-danger" /> Work Hours vs Stress Level
                  </h5>
                  <p className="text-muted small mb-3">Comparing daily working hours against reported stress</p>

                  <div className="d-flex flex-column gap-2 mb-3">
                    {data.stressVsWorkHours.map((item) => (
                      <div
                        key={item.date}
                        className="d-flex align-items-center justify-content-between p-2.5 rounded-3"
                        style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
                      >
                        <span className="text-white-50 small fw-medium" style={{ width: "120px" }}>
                          {item.dayLabel}
                        </span>

                        <div className="flex-grow-1 mx-3 d-flex align-items-center gap-3">
                          <div className="w-50">
                            <span className="extra-small text-muted d-block">Work: {item.workingHours}h</span>
                            <div className="progress rounded-pill bg-dark" style={{ height: "5px" }}>
                              <div className="progress-bar bg-primary" style={{ width: `${(item.workingHours / 12) * 100}%` }} />
                            </div>
                          </div>
                          <div className="w-50">
                            <span className="extra-small text-muted d-block">Stress: {item.stressLevel}/5</span>
                            <div className="progress rounded-pill bg-dark" style={{ height: "5px" }}>
                              <div className={`progress-bar ${item.stressLevel > 3.5 ? "bg-danger" : "bg-warning"}`} style={{ width: `${(item.stressLevel / 5) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Correlation Statement */}
                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-white-50 small">
                    <strong className="text-white me-1">Observation:</strong> {data.stressCorrelationInsight}
                  </div>
                </div>
              </div>

              {/* Break & Recovery + Work vs Personal Time */}
              <div className="col-12 col-lg-5">
                <div className="d-flex flex-column gap-4 h-100">
                  {/* Break Analysis */}
                  <div className="ns-card p-4 rounded-4 border border-secondary border-opacity-25 flex-grow-1">
                    <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                      <FiCoffee className="text-info" /> Break &amp; Recovery
                    </h5>
                    <p className="text-muted small mb-3">Break consistency and rest interval habits</p>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-white-50 small fw-semibold">Break Consistency</span>
                        <span className="text-info fw-bold">{data.breakAnalysis.breakConsistency}%</span>
                      </div>
                      <div className="progress rounded-pill bg-dark" style={{ height: "8px" }}>
                        <div className="progress-bar bg-info" style={{ width: `${data.breakAnalysis.breakConsistency}%` }} />
                      </div>
                    </div>

                    <p className="text-white-50 small mb-0">{data.breakAnalysis.breakAdvice}</p>
                  </div>

                  {/* Work vs Personal Time */}
                  <div className="ns-card p-4 rounded-4 border border-secondary border-opacity-25 flex-grow-1">
                    <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                      <FiTarget className="text-success" /> Work vs Personal Time
                    </h5>
                    <p className="text-muted small mb-3">Estimated daily time allocation ratio</p>

                    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 mb-2">
                      <div className="text-center">
                        <div className="text-primary fw-bold fs-4">{data.workVSFreeTime.avgWorkHours}h</div>
                        <span className="text-muted extra-small">Avg Work</span>
                      </div>
                      <span className="text-muted fw-bold">VS</span>
                      <div className="text-center">
                        <div className="text-success fw-bold fs-4">{data.workVSFreeTime.avgPersonalTime}h</div>
                        <span className="text-muted extra-small">Est Personal Time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. NEUROSYNC AI INSIGHT & RECOMMENDED ACTIONS */}
            <div
              className="ns-card p-4 mb-4 rounded-4 position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(88, 28, 135, 0.3) 100%)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className="badge rounded-pill px-3 py-1"
                  style={{
                    background: "rgba(168, 85, 247, 0.2)",
                    color: "#C084FC",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    fontSize: "0.75rem",
                  }}
                >
                  <FiCpu className="me-1" /> Automated Data Analysis
                </span>
              </div>

              <h4 className="text-white fw-bold mb-2">NeuroSync Insight</h4>

              <blockquote className="blockquote text-white-50 mb-4" style={{ fontSize: "0.96rem", lineHeight: "1.6" }}>
                "{data.aiInsight}"
              </blockquote>

              {data.recommendations && data.recommendations.length > 0 && (
                <div className="pt-3 border-top border-purple border-opacity-25">
                  <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                    <FiCheckCircle className="text-success" /> Recommended Actions
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    {data.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-start gap-2.5 p-2.5 rounded-3"
                        style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.07)", fontSize: "0.9rem" }}
                      >
                        <span className="badge rounded-circle bg-purple-500 text-white p-1 mt-0.5" style={{ width: "18px", height: "18px", fontSize: "0.65rem" }}>
                          {idx + 1}
                        </span>
                        <span className="text-white-50">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6. RECENT CHECK-INS TABLE */}
            <div className="ns-card p-4 rounded-4 border border-secondary border-opacity-25 mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                  <FiCalendar className="text-primary" /> Recent Work-Life Check-ins
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary text-white-50 rounded-pill px-3"
                  onClick={() => navigate("/professional/checkin")}
                >
                  View All / Check In →
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
                  <thead>
                    <tr className="text-muted extra-small text-uppercase border-secondary border-opacity-25">
                      <th>Date</th>
                      <th>Work Hours</th>
                      <th>Stress</th>
                      <th>Energy</th>
                      <th>Focus</th>
                      <th>Balance</th>
                      <th>Breaks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentCheckIns.map((row) => (
                      <tr key={row._id} className="border-secondary border-opacity-25" style={{ fontSize: "0.88rem" }}>
                        <td className="fw-semibold text-white">{row.date}</td>
                        <td>{row.workingHours} hrs</td>
                        <td>
                          <span className={`badge ${row.stressLevel > 3 ? "bg-danger" : "bg-warning"} bg-opacity-20 text-white border border-opacity-30`}>
                            {row.stressLevel}/5
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30">
                            {row.energyLevel}/5
                          </span>
                        </td>
                        <td>{row.focusLevel}/5</td>
                        <td>{row.workLifeBalance}/5</td>
                        <td>
                          <span className="badge bg-dark border border-secondary border-opacity-25 text-white-50">
                            {row.breaksTaken}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default ProfessionalWorkLifeBalance;
