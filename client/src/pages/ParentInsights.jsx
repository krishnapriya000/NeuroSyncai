import { API_BASE_URL } from "../utils/apiConfig.js";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiBarChart2,
  FiTrendingUp,
  FiPieChart,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiCalendar,
  FiUser,
  FiInfo,
  FiChevronRight,
  FiSmile,
  FiFrown,
  FiMeh,
  FiEye,
  FiClock,
  FiHeart,
  FiArrowUpRight,
  FiArrowDownRight,
  FiMinus,
  FiZap,
  FiCamera
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentInsights() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("insights");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");

  // Filter States
  const [selectedChild, setSelectedChild] = useState("all");
  const [dateRange, setDateRange] = useState("7days"); // today | 7days | 30days

  // Data & API States
  const [insightsData, setInsightsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Interactive Chart States
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState(null);
  const [hoveredEmotion, setHoveredEmotion] = useState(null);
  const [selectedActivityDay, setSelectedActivityDay] = useState(null);

  // Modal States
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedCheckInDetail, setSelectedCheckInDetail] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const fetchInsights = useCallback(async (isRefreshCall = false) => {
    if (isRefreshCall) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage("");

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setErrorMessage("Authentication token missing. Please log in again.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const url = `http://localhost:5000/api/parent/insights?childId=${selectedChild}&range=${dateRange}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setInsightsData(data);
      } else {
        setErrorMessage(data.message || "Failed to load parenting insights.");
      }
    } catch (err) {
      console.error("Fetch insights error:", err);
      setErrorMessage("Unable to connect to backend server. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedChild, dateRange]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Handle Child Dropdown Change
  const handleChildChange = (e) => {
    setSelectedChild(e.target.value);
  };

  // Handle Date Range Change
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  // Color mapper for dominant emotion icons
  const getEmotionBadgeColor = (emotion) => {
    const emo = (emotion || "").toLowerCase();
    if (emo.includes("happy") || emo.includes("joy")) return "text-primary bg-primary";
    if (emo.includes("calm") || emo.includes("focus")) return "text-success bg-success";
    if (emo.includes("neutral")) return "text-info bg-info";
    if (emo.includes("tired")) return "text-warning bg-warning";
    if (emo.includes("stress") || emo.includes("anxious") || emo.includes("sad")) return "text-danger bg-danger";
    return "text-indigo-400 bg-indigo-500";
  };

  const getEmotionIcon = (emotion) => {
    const emo = (emotion || "").toLowerCase();
    if (emo.includes("happy") || emo.includes("joy")) return <FiSmile className="fs-5" />;
    if (emo.includes("calm") || emo.includes("focus")) return <FiHeart className="fs-5" />;
    if (emo.includes("neutral")) return <FiMeh className="fs-5" />;
    if (emo.includes("tired")) return <FiClock className="fs-5" />;
    if (emo.includes("stress") || emo.includes("sad")) return <FiFrown className="fs-5" />;
    return <FiActivity className="fs-5" />;
  };

  // Helper for trend badge
  const renderTrendBadge = (wellnessTrend) => {
    if (wellnessTrend === "Improving") {
      return (
        <span className="badge rounded-pill bg-success bg-opacity-20 text-success border border-success border-opacity-40 d-inline-flex align-items-center gap-1 px-2.5 py-1">
          <FiArrowUpRight /> Improving
        </span>
      );
    }
    if (wellnessTrend === "Needs Attention") {
      return (
        <span className="badge rounded-pill bg-warning bg-opacity-20 text-warning border border-warning border-opacity-40 d-inline-flex align-items-center gap-1 px-2.5 py-1">
          <FiAlertCircle /> Needs Attention
        </span>
      );
    }
    return (
      <span className="badge rounded-pill bg-info bg-opacity-20 text-info border border-info border-opacity-40 d-inline-flex align-items-center gap-1 px-2.5 py-1">
        <FiMinus /> Stable
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={parentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* SECTION 1: HEADER & FILTERS */}
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
          <div>
            <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30 d-inline-flex align-items-center gap-1">
              <FiBarChart2 className="text-indigo-400" /> Parenting Insights & Family Analytics
            </span>
            <h1 className="fw-bold text-white fs-3 mb-1">Parenting Insights & Family Analytics</h1>
            <p className="text-secondary small mb-0">Understand your child's emotional and behavioural patterns.</p>
          </div>

          {/* Filter Controls Bar */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Child Selector Dropdown */}
            <div className="d-flex align-items-center gap-1.5 bg-dark p-1 px-2 rounded-pill border border-secondary border-opacity-25">
              <FiUser className="text-primary small ms-1" />
              <select
                className="form-select form-select-sm bg-transparent text-white border-0 py-1 pe-4 shadow-none"
                style={{ fontSize: "0.85rem", cursor: "pointer", width: "auto" }}
                value={selectedChild}
                onChange={handleChildChange}
                disabled={isLoading}
              >
                <option value="all" className="bg-dark text-white">All Children</option>
                {insightsData?.children?.map((child) => (
                  <option key={child.id} value={child.id} className="bg-dark text-white">
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="d-flex align-items-center gap-1.5 bg-dark p-1 px-2 rounded-pill border border-secondary border-opacity-25">
              <FiCalendar className="text-info small ms-1" />
              <select
                className="form-select form-select-sm bg-transparent text-white border-0 py-1 pe-4 shadow-none"
                style={{ fontSize: "0.85rem", cursor: "pointer", width: "auto" }}
                value={dateRange}
                onChange={handleDateRangeChange}
                disabled={isLoading}
              >
                <option value="today" className="bg-dark text-white">Today</option>
                <option value="7days" className="bg-dark text-white">Last 7 Days</option>
                <option value="30days" className="bg-dark text-white">Last 30 Days</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center border border-secondary border-opacity-25 shadow-sm"
              onClick={() => fetchInsights(true)}
              disabled={isLoading || isRefreshing}
              title="Refresh Insights"
              style={{ width: "38px", height: "38px" }}
            >
              <FiRefreshCw className={`text-light ${isRefreshing ? "spin-animation" : ""}`} />
            </button>
          </div>
        </div>

        {/* SECTION 12: ERROR STATE */}
        {errorMessage && (
          <div className="p-4 rounded-4 bg-danger bg-opacity-15 border border-danger border-opacity-30 text-white mb-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-danger bg-opacity-25 p-3 text-danger d-flex align-items-center justify-content-center">
                <FiAlertCircle size={24} />
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-white">Unable to load insights</h6>
                <p className="text-secondary small mb-0">{errorMessage}</p>
              </div>
            </div>
            <button
              className="btn btn-outline-danger btn-sm rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => fetchInsights()}
            >
              <FiRefreshCw /> Retry
            </button>
          </div>
        )}

        {/* SECTION 11: LOADING STATE (SKELETON LOADERS) */}
        {isLoading ? (
          <div>
            {/* Overview Skeleton */}
            <div className="row g-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-12 col-sm-6 col-xl-3">
                  <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-center">
                    <div className="skeleton-line w-50 mb-3 mx-auto" style={{ height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.06)" }} />
                    <div className="skeleton-line w-75 mb-2 mx-auto" style={{ height: "28px", borderRadius: "6px", background: "rgba(255,255,255,0.1)" }} />
                    <div className="skeleton-line w-35 mx-auto" style={{ height: "12px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="row g-4 mb-4">
              <div className="col-lg-8">
                <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25" style={{ height: "300px" }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="skeleton-line w-30" style={{ height: "20px", background: "rgba(255,255,255,0.08)" }} />
                    <div className="skeleton-line w-20" style={{ height: "16px", background: "rgba(255,255,255,0.05)" }} />
                  </div>
                  <div className="d-flex align-items-center justify-content-center h-75">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                    <span className="text-secondary small">Calculating dynamic wellness trends...</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25" style={{ height: "300px" }}>
                  <div className="skeleton-line w-50 mb-4" style={{ height: "20px", background: "rgba(255,255,255,0.08)" }} />
                  <div className="rounded-circle mx-auto mb-3" style={{ width: "120px", height: "120px", background: "rgba(255,255,255,0.05)" }} />
                </div>
              </div>
            </div>
          </div>
        ) : insightsData && (
          <div>
            {/* SECTION 10: FRIENDLY EMPTY STATE (If no data recorded) */}
            {insightsData.overview.totalCheckInsRecorded === 0 ? (
              <div className="p-5 text-center rounded-4 border border-dashed border-secondary border-opacity-25 mb-4 bg-dark bg-opacity-30">
                <div className="fs-1 mb-3 text-info">📊</div>
                <h4 className="fw-bold text-white mb-2">No insights available yet.</h4>
                <p className="text-secondary small mb-4" style={{ maxWidth: "480px", margin: "0 auto" }}>
                  Complete a few daily check-ins to generate meaningful family wellness insights, emotional breakdown, and AI observations.
                </p>
                <button
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                  onClick={() => navigate("/parent/check-in")}
                >
                  <FiCheckCircle /> Go to Daily Check-in
                </button>
              </div>
            ) : null}

            {/* SECTION 2: OVERVIEW CARDS (4 DYNAMIC CARDS) */}
            <div className="row g-3 mb-4">
              {/* Card A: Mood Score */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div
                  className="p-3.5 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between position-relative overflow-hidden"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-secondary fw-semibold">Mood Score</span>
                      <div className="p-2 rounded-circle bg-primary bg-opacity-20 text-primary">
                        <FiSmile />
                      </div>
                    </div>
                    <div className="d-flex align-items-baseline gap-2 mb-1">
                      <span className="fs-3 fw-extrabold text-white">{insightsData.overview.moodScore}</span>
                      <span className="text-secondary extra-small">/ 10</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1 extra-small">
                    {insightsData.overview.moodScoreChange > 0 ? (
                      <span className="text-success fw-semibold d-inline-flex align-items-center">
                        <FiArrowUpRight /> +{insightsData.overview.moodScoreChange}
                      </span>
                    ) : insightsData.overview.moodScoreChange < 0 ? (
                      <span className="text-danger fw-semibold d-inline-flex align-items-center">
                        <FiArrowDownRight /> {insightsData.overview.moodScoreChange}
                      </span>
                    ) : (
                      <span className="text-info fw-semibold d-inline-flex align-items-center">
                        <FiMinus /> 0.0
                      </span>
                    )}
                    <span className="text-secondary">vs previous period</span>
                  </div>
                </div>
              </div>

              {/* Card B: Check-in Completion */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div
                  className="p-3.5 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between position-relative overflow-hidden"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-secondary fw-semibold">Check-in Completion</span>
                      <div className="p-2 rounded-circle bg-info bg-opacity-20 text-info">
                        <FiCheckCircle />
                      </div>
                    </div>
                    <div className="d-flex align-items-baseline gap-2 mb-1">
                      <span className="fs-3 fw-extrabold text-white">
                        {insightsData.overview.completedCheckIns} / {insightsData.overview.expectedCheckIns}
                      </span>
                      <span className="text-secondary extra-small">check-ins</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between extra-small">
                    <span className="text-info fw-semibold">{insightsData.overview.checkInCompletionRate}% Rate</span>
                    <div className="progress bg-dark w-50" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-info"
                        style={{ width: `${insightsData.overview.checkInCompletionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card C: Dominant Emotion */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div
                  className="p-3.5 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between position-relative overflow-hidden"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-secondary fw-semibold">Dominant Emotion</span>
                      <div className={`p-2 rounded-circle ${getEmotionBadgeColor(insightsData.overview.dominantEmotion)} bg-opacity-20`}>
                        {getEmotionIcon(insightsData.overview.dominantEmotion)}
                      </div>
                    </div>
                    <div className="fs-3 fw-extrabold text-white mb-1">
                      {insightsData.overview.dominantEmotion}
                    </div>
                  </div>
                  <div className="extra-small text-secondary">
                    Detected across face analysis & check-in logs
                  </div>
                </div>
              </div>

              {/* Card D: Wellness Trend */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div
                  className="p-3.5 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between position-relative overflow-hidden"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-secondary fw-semibold">Wellness Trend</span>
                      <div className="p-2 rounded-circle bg-warning bg-opacity-20 text-warning">
                        <FiTrendingUp />
                      </div>
                    </div>
                    <div className="mb-2">
                      {renderTrendBadge(insightsData.overview.wellnessTrend)}
                    </div>
                  </div>
                  <div className="extra-small text-secondary">
                    Rule-based observational trajectory
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3 & SECTION 4: MOOD TREND LINE CHART & EMOTIONAL DISTRIBUTION */}
            <div className="row g-4 mb-4">
              {/* SECTION 3: MOOD TREND LINE CHART */}
              <div className="col-12 col-lg-7 col-xl-8">
                <div
                  className="p-4 rounded-4 text-white h-100 shadow-sm position-relative d-flex flex-column justify-content-between"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div>
                      <h5 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                        <FiActivity className="text-primary" /> Dynamic Mood Trend
                      </h5>
                      <p className="text-secondary extra-small mb-0">Daily mood trajectory based on actual check-ins.</p>
                    </div>
                    <span className="badge bg-dark border border-secondary border-opacity-25 text-secondary extra-small px-3 py-1 rounded-pill">
                      0-10 Scale
                    </span>
                  </div>

                  {/* Line Chart Render */}
                  <div className="w-100 position-relative py-2">
                    {insightsData.dailyMoodTrend?.length > 0 ? (
                      <div>
                        <svg viewBox="0 0 600 180" className="w-100" style={{ maxHeight: "200px" }}>
                          <defs>
                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="trendLineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="50%" stopColor="#8B5CF6" />
                              <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="20" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                          <line x1="20" y1="75" x2="580" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                          <line x1="20" y1="130" x2="580" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                          {/* Compute Points */}
                          {(() => {
                            const points = insightsData.dailyMoodTrend.map((item, idx) => {
                              const step = (580 - 40) / Math.max(1, insightsData.dailyMoodTrend.length - 1);
                              const x = 20 + idx * step;
                              const scoreVal = item.moodScore !== null ? item.moodScore : 6.0;
                              const y = 140 - (scoreVal / 10) * 110;
                              return { x, y, item, idx };
                            });

                            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            const areaD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                            return (
                              <>
                                {/* Gradient Area Fill */}
                                <polygon points={`${points.map((p) => `${p.x},${p.y}`).join(' ')} ${points[points.length - 1].x},150 ${points[0].x},150`} fill="url(#trendGradient)" />

                                {/* Line Path */}
                                <path d={pathD} fill="none" stroke="url(#trendLineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Interactive Nodes */}
                                {points.map((p) => (
                                  <g key={p.idx} style={{ cursor: "pointer" }} onMouseEnter={() => setHoveredTrendPoint(p.item)} onMouseLeave={() => setHoveredTrendPoint(null)}>
                                    <circle
                                      cx={p.x}
                                      cy={p.y}
                                      r={hoveredTrendPoint?.date === p.item.date ? "7" : "4.5"}
                                      fill={p.item.hasData ? (hoveredTrendPoint?.date === p.item.date ? "#10B981" : "#3B82F6") : "#64748B"}
                                      stroke="#ffffff"
                                      strokeWidth="2"
                                    />
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                        </svg>

                        {/* X-Axis Day Labels */}
                        <div className="d-flex justify-content-between px-2 mt-1 text-secondary extra-small">
                          {insightsData.dailyMoodTrend.map((item, idx) => (
                            <span key={idx} className={hoveredTrendPoint?.date === item.date ? "text-white fw-bold" : ""}>
                              {item.dayName}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-secondary small">No trend data available for selected period.</div>
                    )}
                  </div>

                  {/* Tooltip detail bar for hovered node */}
                  {hoveredTrendPoint && (
                    <div className="mt-2 p-2.5 rounded-3 bg-dark border border-primary border-opacity-30 text-white extra-small d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-sm">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-primary">{hoveredTrendPoint.displayDate} ({hoveredTrendPoint.dayName})</span>
                        <span className="badge bg-primary bg-opacity-20 text-primary">Score: {hoveredTrendPoint.moodScore !== null ? `${hoveredTrendPoint.moodScore}/10` : "No Check-in"}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3 text-secondary">
                        <span>Mood: <strong className="text-white">{hoveredTrendPoint.mood}</strong></span>
                        {hoveredTrendPoint.stress !== null && <span>Stress: <strong className="text-warning">{hoveredTrendPoint.stress}/10</strong></span>}
                        <span>Energy: <strong className="text-info">{hoveredTrendPoint.energy}</strong></span>
                        <span>Sleep: <strong className="text-success">{hoveredTrendPoint.sleepHours}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: EMOTIONAL DISTRIBUTION DONUT CHART */}
              <div className="col-12 col-lg-5 col-xl-4">
                <div
                  className="p-4 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                    <FiPieChart className="text-info" /> Emotional Distribution
                  </h5>

                  {/* Donut Graphic */}
                  <div className="d-flex align-items-center justify-content-center py-2">
                    <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "160px", height: "160px" }}>
                      <svg viewBox="0 0 200 200" className="w-100 h-100">
                        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="22" />
                        {(() => {
                          const dist = insightsData.emotionalDistribution || [];
                          const colors = {
                            Calm: "#10B981",
                            Happy: "#3B82F6",
                            Neutral: "#8B5CF6",
                            Tired: "#F59E0B",
                            Stressed: "#EF4444",
                          };

                          let accumulatedPct = 0;
                          const circ = 2 * Math.PI * 70; // 439.82

                          return dist.map((item, i) => {
                            if (item.percentage === 0) return null;
                            const strokeDash = (item.percentage / 100) * circ;
                            const strokeOffset = circ - (accumulatedPct / 100) * circ;
                            accumulatedPct += item.percentage;
                            const color = colors[item.emotion] || "#EC4899";

                            return (
                              <circle
                                key={i}
                                cx="100"
                                cy="100"
                                r="70"
                                fill="none"
                                stroke={color}
                                strokeWidth={hoveredEmotion === item.emotion ? "26" : "22"}
                                strokeDasharray={`${strokeDash} ${circ}`}
                                strokeDashoffset={strokeOffset}
                                transform="rotate(-90 100 100)"
                                style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                                onMouseEnter={() => setHoveredEmotion(item.emotion)}
                                onMouseLeave={() => setHoveredEmotion(null)}
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="position-absolute text-center">
                        <div className="fw-extrabold text-white fs-4 lh-1">
                          {hoveredEmotion
                            ? `${insightsData.emotionalDistribution.find((e) => e.emotion === hoveredEmotion)?.percentage || 0}%`
                            : `${insightsData.overview.dominantEmotion}`}
                        </div>
                        <div className="text-secondary extra-small mt-1" style={{ fontSize: "0.7rem" }}>
                          {hoveredEmotion ? hoveredEmotion.toUpperCase() : "DOMINANT"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emotion Breakdown List */}
                  <div className="d-flex flex-column gap-2 mt-2">
                    {insightsData.emotionalDistribution?.map((item, idx) => {
                      const colors = {
                        Calm: "bg-success",
                        Happy: "bg-primary",
                        Neutral: "bg-purple",
                        Tired: "bg-warning",
                        Stressed: "bg-danger",
                      };
                      const barClass = colors[item.emotion] || "bg-info";

                      return (
                        <div
                          key={idx}
                          className={`p-1.5 px-2 rounded.3 d-flex align-items-center justify-content-between extra-small transition-all ${
                            hoveredEmotion === item.emotion ? "bg-dark border border-secondary border-opacity-50" : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() => setHoveredEmotion(item.emotion)}
                          onMouseLeave={() => setHoveredEmotion(null)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className={`rounded-circle d-inline-block ${barClass}`} style={{ width: "10px", height: "10px" }} />
                            <span className="text-white fw-semibold">{item.emotion}</span>
                          </div>
                          <span className="text-secondary fw-bold">{item.percentage}% ({item.count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5 & SECTION 6: WEEKLY CHECK-IN ACTIVITY & FACE EMOTION TREND */}
            <div className="row g-4 mb-4">
              {/* SECTION 5: WEEKLY CHECK-IN ACTIVITY BAR CHART */}
              <div className="col-12 col-lg-6">
                <div
                  className="p-4 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <h5 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                      <FiCalendar className="text-success" /> Check-in Activity
                    </h5>
                    <p className="text-secondary extra-small mb-3">Number of completed check-ins per day.</p>

                    {/* Bar Chart Container */}
                    <div className="d-flex justify-content-between align-items-end px-2 py-3 bg-dark bg-opacity-40 rounded-3 border border-secondary border-opacity-25" style={{ height: "130px" }}>
                      {insightsData.weeklyCheckInActivity?.map((item, idx) => {
                        const maxCnt = Math.max(1, ...insightsData.weeklyCheckInActivity.map((i) => i.completedCount));
                        const pct = Math.round((item.completedCount / maxCnt) * 100);
                        const isSelected = selectedActivityDay?.date === item.date;

                        return (
                          <div
                            key={idx}
                            className="d-flex flex-column align-items-center gap-1 h-100 justify-content-end"
                            style={{ width: `${100 / insightsData.weeklyCheckInActivity.length}%`, cursor: "pointer" }}
                            onClick={() => setSelectedActivityDay(isSelected ? null : item)}
                          >
                            <span className="text-white extra-small fw-bold">{item.completedCount}</span>
                            <div className="w-75 bg-dark rounded-top position-relative" style={{ height: "80px" }}>
                              <div
                                className="w-100 rounded-top position-absolute bottom-0"
                                style={{
                                  height: item.completedCount > 0 ? `${Math.max(15, pct)}%` : "0%",
                                  background: isSelected
                                    ? "linear-gradient(180deg, #10B981, #059669)"
                                    : "linear-gradient(180deg, #3B82F6, #1D4ED8)",
                                  boxShadow: isSelected ? "0 0 10px rgba(16, 185, 129, 0.6)" : "none",
                                }}
                              />
                            </div>
                            <span className={`extra-small ${isSelected ? "text-success fw-bold" : "text-secondary"}`}>
                              {item.dayName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity Details for selected day */}
                  {selectedActivityDay ? (
                    <div className="mt-3 p-3 rounded-3 bg-dark border border-success border-opacity-30 extra-small">
                      <div className="fw-bold text-white mb-1 d-flex justify-content-between">
                        <span>Check-ins on {selectedActivityDay.date}</span>
                        <span className="text-success">{selectedActivityDay.completedCount} Record(s)</span>
                      </div>
                      {selectedActivityDay.details?.length > 0 ? (
                        selectedActivityDay.details.map((d, i) => (
                          <div key={i} className="text-secondary border-top border-secondary border-opacity-25 pt-1.5 mt-1">
                            <strong className="text-white">{d.childName}</strong> • {d.type} • Mood: <span className="text-info">{d.mood}</span>
                            {d.notes && <div className="fst-italic text-secondary extra-small mt-0.5">"{d.notes}"</div>}
                          </div>
                        ))
                      ) : (
                        <div className="text-secondary">No check-in entries logged on this day.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-secondary extra-small text-center mt-2">
                      Click a bar to inspect detailed check-ins for that day.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 6: FACE EMOTION TREND */}
              <div className="col-12 col-lg-6">
                <div
                  className="p-4 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <h5 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                      <FiCamera className="text-purple" /> Face Emotion Timeline
                    </h5>
                    <p className="text-secondary extra-small mb-3">Detected facial expression records over time.</p>

                    {insightsData.faceEmotionTrend?.length > 0 ? (
                      <div className="d-flex flex-column gap-2 overflow-y-auto pe-1" style={{ maxHeight: "170px" }}>
                        {insightsData.faceEmotionTrend.map((record, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25 d-flex align-items-center justify-content-between extra-small"
                          >
                            <div className="d-flex align-items-center gap-2.5">
                              <div className={`p-2 rounded-circle ${getEmotionBadgeColor(record.expression)} bg-opacity-20`}>
                                {getEmotionIcon(record.expression)}
                              </div>
                              <div>
                                <div className="fw-bold text-white">{record.expression}</div>
                                <span className="text-secondary extra-small">{record.childName} • {record.dateStr}</span>
                              </div>
                            </div>
                            <span className="badge bg-indigo-500 bg-opacity-20 text-indigo-300 border border-indigo-500 border-opacity-30">
                              {record.confidence}% Confidence
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 my-auto">
                        <FiCamera className="fs-3 text-secondary mb-2" />
                        <div className="text-white fw-semibold small mb-1">No face analysis records in selected period.</div>
                        <p className="text-secondary extra-small mb-0">Use the Parent Check-in modal to perform face analysis scans.</p>
                      </div>
                    )}
                  </div>
                  <div className="text-secondary extra-small pt-2">
                    Visual timeline sourced strictly from recorded face scans.
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 7 & SECTION 8: AI PARENT INSIGHT & ATTENTION PATTERNS */}
            <div className="row g-4 mb-4">
              {/* SECTION 7: AI PARENT INSIGHT */}
              <div className="col-12 col-lg-8">
                <div
                  className="p-4 rounded-4 text-white h-100 shadow-sm border border-indigo-500 border-opacity-30 position-relative overflow-hidden"
                  style={{ background: "linear-gradient(145deg, #0F172A 0%, #1E1B4B 100%)" }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge bg-indigo-500 bg-opacity-30 text-indigo-200 px-3 py-1 rounded-pill border border-indigo-400 border-opacity-40 d-inline-flex align-items-center gap-1">
                      <FiZap className="text-warning" /> AI Parent Insights
                    </span>
                    <span className="text-secondary extra-small">Non-medical observation</span>
                  </div>

                  <div className="p-3 rounded-3 mb-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                    <div className="fw-bold text-white small mb-1">📊 Period Summary</div>
                    <p className="text-secondary small mb-0">{insightsData.aiParentInsight?.summary}</p>
                  </div>

                  <div className="p-3 rounded-3 mb-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                    <div className="fw-bold text-white small mb-1">🔍 Observed Pattern</div>
                    <p className="text-secondary small mb-0">{insightsData.aiParentInsight?.observedPattern}</p>
                  </div>

                  <div className="p-3 rounded-3 bg-indigo-900 bg-opacity-40 border border-indigo-400 border-opacity-30">
                    <div className="fw-bold text-indigo-200 small mb-1">💡 Suggested Parent Action</div>
                    <p className="text-indigo-100 small mb-0">{insightsData.aiParentInsight?.suggestedAction}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 8: ATTENTION PATTERNS */}
              <div className="col-12 col-lg-4">
                <div
                  className="p-4 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2 fs-6">
                        <FiAlertCircle className="text-warning" /> Attention Patterns
                      </h5>
                      {insightsData.attentionPatterns?.hasPattern ? (
                        <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-40">Flagged</span>
                      ) : (
                        <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-40">Clear</span>
                      )}
                    </div>

                    {insightsData.attentionPatterns?.hasPattern ? (
                      <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 mb-3">
                        <h6 className="fw-bold text-warning small mb-1">{insightsData.attentionPatterns.patternTitle}</h6>
                        <p className="text-secondary extra-small mb-3">{insightsData.attentionPatterns.description}</p>
                        <button
                          className="btn btn-warning btn-sm rounded-pill px-3 py-1 fw-semibold text-dark w-100 d-inline-flex align-items-center justify-content-center gap-1"
                          onClick={() => setShowPatternModal(true)}
                        >
                          <FiEye /> View Details
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 mb-3">
                        <FiCheckCircle className="fs-2 text-success mb-2" />
                        <div className="fw-bold text-white small mb-1">No unusual pattern detected.</div>
                        <p className="text-secondary extra-small mb-0">Wellness scores and check-in regularity are in healthy ranges.</p>
                      </div>
                    )}
                  </div>

                  <div className="text-secondary extra-small">
                    Data-driven pattern detection without medical risk labels.
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 9: RECENT CHECK-INS TABLE */}
            <div className="p-4 rounded-4 text-white shadow-sm mb-4" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2 fs-6">
                  <FiClock className="text-primary" /> Recent Child Check-ins
                </h5>
                <span className="text-secondary extra-small">{insightsData.recentCheckIns?.length || 0} Record(s)</span>
              </div>

              {insightsData.recentCheckIns?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0 extra-small" style={{ background: "transparent" }}>
                    <thead>
                      <tr className="text-secondary border-bottom border-secondary border-opacity-25">
                        <th scope="col">Date</th>
                        <th scope="col">Child Name</th>
                        <th scope="col">Mood / Feeling</th>
                        <th scope="col">Check-in Type</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insightsData.recentCheckIns.map((ci) => (
                        <tr key={ci.id} className="border-bottom border-secondary border-opacity-10">
                          <td className="fw-semibold text-white">{ci.date}</td>
                          <td className="text-white">{ci.childName}</td>
                          <td>
                            <span className="badge bg-dark border border-secondary border-opacity-25 text-white">
                              {ci.mood}
                            </span>
                          </td>
                          <td className="text-secondary">{ci.type}</td>
                          <td>
                            <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-40">
                              Completed
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-outline-light btn-sm rounded-pill px-3 py-1"
                              style={{ fontSize: "0.75rem" }}
                              onClick={() => {
                                setSelectedCheckInDetail(ci);
                                setShowCheckInModal(true);
                              }}
                            >
                              <FiEye /> Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-secondary small">No recent check-in records available.</div>
              )}
            </div>
          </div>
        )}

        {/* MODAL 1: ATTENTION PATTERN DETAILS */}
        {showPatternModal && insightsData?.attentionPatterns && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-white rounded-4 shadow-lg" style={{ background: "#0F172A", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
                <div className="modal-header border-secondary border-opacity-25">
                  <h5 className="modal-title fw-bold text-warning d-flex align-items-center gap-2 fs-6">
                    <FiAlertCircle /> {insightsData.attentionPatterns.patternTitle}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowPatternModal(false)} />
                </div>
                <div className="modal-body p-4">
                  <p className="text-secondary small mb-3">{insightsData.attentionPatterns.description}</p>

                  <div className="d-flex flex-column gap-2 mb-3">
                    {insightsData.attentionPatterns.details?.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 extra-small">
                        <div className="fw-bold text-white mb-1">{item.date} {item.childName ? `• ${item.childName}` : ""}</div>
                        <div className="text-secondary">{item.note}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-3 bg-indigo-950 border border-indigo-800 text-indigo-200 extra-small">
                    <strong>💡 Parental Guidance:</strong> Maintain a calm, open channel of communication. Encourage adequate rest and supportive conversation.
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button className="btn btn-outline-secondary text-white rounded-pill px-4 w-100" onClick={() => setShowPatternModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: RECENT CHECK-IN DETAILS */}
        {showCheckInModal && selectedCheckInDetail && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-white rounded-4 shadow-lg" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <div className="modal-header border-secondary border-opacity-25">
                  <h5 className="modal-title fw-bold text-white fs-6">
                    Check-in Details — {selectedCheckInDetail.childName} ({selectedCheckInDetail.date})
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowCheckInModal(false)} />
                </div>
                <div className="modal-body p-4">
                  <div className="p-3 rounded-3 bg-dark bg-opacity-60 mb-3 border border-secondary border-opacity-25">
                    <div className="row g-2 text-secondary extra-small">
                      <div className="col-6">Type: <strong className="text-white d-block">{selectedCheckInDetail.type}</strong></div>
                      <div className="col-6">Mood: <strong className="text-info d-block">{selectedCheckInDetail.mood}</strong></div>

                      {selectedCheckInDetail.details?.wellbeingScore && (
                        <div className="col-6 mt-2">Wellbeing Score: <strong className="text-success d-block">{selectedCheckInDetail.details.wellbeingScore} / 5</strong></div>
                      )}
                      {selectedCheckInDetail.details?.energy && (
                        <div className="col-6 mt-2">Energy: <strong className="text-white d-block">{selectedCheckInDetail.details.energy}</strong></div>
                      )}
                      {selectedCheckInDetail.details?.socialInteraction && (
                        <div className="col-6 mt-2">Social Interaction: <strong className="text-white d-block">{selectedCheckInDetail.details.socialInteraction}</strong></div>
                      )}
                      {selectedCheckInDetail.details?.sleepHours && (
                        <div className="col-6 mt-2">Sleep Hours: <strong className="text-white d-block">{selectedCheckInDetail.details.sleepHours}</strong></div>
                      )}
                      {selectedCheckInDetail.details?.stressLevel !== undefined && (
                        <div className="col-6 mt-2">Stress Level: <strong className="text-warning d-block">{selectedCheckInDetail.details.stressLevel} / 10</strong></div>
                      )}
                    </div>
                  </div>

                  {selectedCheckInDetail.details?.unusualBehavior && (
                    <div className="p-3 rounded-3 bg-warning bg-opacity-15 border border-warning border-opacity-30 mb-3 extra-small">
                      <strong className="text-warning d-block mb-1">⚠️ Unusual Behavior Flagged:</strong>
                      <span className="text-secondary">{selectedCheckInDetail.details.unusualBehaviorNote || "Yes"}</span>
                    </div>
                  )}

                  {(selectedCheckInDetail.details?.additionalNotes || selectedCheckInDetail.details?.biggestChallenge) && (
                    <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 extra-small">
                      <strong className="text-white d-block mb-1">Notes / Challenges:</strong>
                      <span className="text-secondary">"{selectedCheckInDetail.details.additionalNotes || selectedCheckInDetail.details.biggestChallenge}"</span>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button className="btn btn-primary rounded-pill px-4 w-100" onClick={() => setShowCheckInModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentInsights;
