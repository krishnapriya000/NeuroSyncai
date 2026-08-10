import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studentDashboard.css";

import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import {
  FiSmile,
  FiActivity,
  FiZap,
  FiTarget,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiAlertCircle,
  FiPlusCircle,
  FiBookOpen,
  FiCamera,
  FiArrowRight,
  FiClock,
  FiCoffee,
  FiCompass,
  FiCpu
} from "react-icons/fi";

const moodToScoreMap = {
  "Great": 5,
  "Good": 4,
  "Neutral": 3,
  "Stressed": 2,
  "Overwhelmed": 1,
};

const moodEmojiMap = {
  "Great": "😊",
  "Good": "🙂",
  "Neutral": "😐",
  "Stressed": "😟",
  "Overwhelmed": "😣",
};

const stressLabelMap = {
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Very High",
};

const energyLabelMap = {
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Very High",
};

const focusLabelMap = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

const balanceLabelMap = {
  1: "Very Unbalanced",
  2: "Unbalanced",
  3: "Neutral",
  4: "Balanced",
  5: "Very Balanced",
};

function ProfessionalMoodStress() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [history, setHistory] = useState([]);

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch Today's Check-in
      const todayRes = await fetch("http://localhost:5000/api/professional/checkin/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const todayJson = await todayRes.json();
      if (todayJson.success && todayJson.data) {
        setTodayCheckIn(todayJson.data);
      }

      // Fetch History
      const historyRes = await fetch("http://localhost:5000/api/professional/checkin/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const historyJson = await historyRes.json();
      if (historyJson.success && Array.isArray(historyJson.data)) {
        setHistory(historyJson.data);
      }
    } catch (err) {
      console.error("Error fetching Mood & Stress data:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasSubmittedToday = !!todayCheckIn;
  const hasHistory = history.length > 0;

  // Prepare 7-day trend data (sorted chronologically)
  const last7DaysData = [...history]
    .slice(0, 7)
    .reverse()
    .map((item) => {
      const d = new Date(item.date);
      const dateLabel = isNaN(d.getTime())
        ? item.date
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const moodVal = moodToScoreMap[item.mood] || 3;
      return {
        date: dateLabel,
        rawDate: item.date,
        mood: item.mood,
        moodVal,
        stressLevel: item.stressLevel,
        energyLevel: item.energyLevel,
        focusLevel: item.focusLevel,
      };
    });

  // Calculate averages from actual check-in data
  const calcAverage = (key) => {
    if (!hasHistory) return 0;
    let sum = 0;
    let count = 0;
    history.forEach((h) => {
      if (key === "moodVal") {
        const val = moodToScoreMap[h.mood];
        if (val) {
          sum += val;
          count++;
        }
      } else if (h[key] !== undefined && h[key] !== null) {
        sum += Number(h[key]);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : 0;
  };

  const avgMood = calcAverage("moodVal");
  const avgStress = calcAverage("stressLevel");
  const avgEnergy = calcAverage("energyLevel");
  const avgFocus = calcAverage("focusLevel");
  const avgBalance = calcAverage("workLifeBalance");

  // Calculate Average Working Hours
  const avgWorkingHours = (() => {
    if (!hasHistory) return "0";
    let total = 0;
    let cnt = 0;
    history.forEach((h) => {
      if (h.workingHours !== undefined && !isNaN(h.workingHours)) {
        total += Number(h.workingHours);
        cnt++;
      }
    });
    return cnt > 0 ? (total / cnt).toFixed(1) : "8.0";
  })();

  // Calculate Break Pattern Summary
  const breakPatternSummary = (() => {
    if (!hasHistory) return "N/A";
    const counts = { Yes: 0, Sometimes: 0, No: 0 };
    history.forEach((h) => {
      if (counts[h.breaksTaken] !== undefined) counts[h.breaksTaken]++;
    });
    if (counts.Yes >= counts.Sometimes && counts.Yes >= counts.No) return "Regular Breaks";
    if (counts.Sometimes >= counts.No) return "Occasional Breaks";
    return "Infrequent Breaks";
  })();

  // Real data-driven Stress Trend Statement
  const stressTrendInsight = (() => {
    if (last7DaysData.length < 2) return "Your stress metrics will show trend patterns as you log more check-ins.";
    const firstStress = last7DaysData[0].stressLevel;
    const lastStress = last7DaysData[last7DaysData.length - 1].stressLevel;
    const diff = lastStress - firstStress;
    if (diff > 0) return "Your stress level has increased compared with earlier this week.";
    if (diff < 0) return "Your stress level has decreased over the last few days.";
    return "Your stress has remained relatively stable this week.";
  })();

  // Real data-driven NeuroSync Insight
  const neurosyncInsightText = (() => {
    if (!hasHistory) return "Complete your daily check-in to receive personalized workplace wellness insights.";
    if (avgStress >= 3.5) {
      return "Your recent check-ins show elevated stress. Consider taking regular breaks during work.";
    }
    const hasLowSleep = history.some((h) => h.sleepHours && (h.sleepHours.includes("Less than 5") || h.sleepHours.includes("5–6")));
    if (hasLowSleep) {
      return "Your recent sleep duration appears lower than usual. Maintaining a consistent sleep routine may support your daily energy.";
    }
    if (avgFocus < 3) {
      return "Your recent focus score has been lower. Consider shorter focused work sessions with regular breaks.";
    }
    return "Your recent wellness indicators look positive. Keep maintaining your current healthy work habits.";
  })();

  // Filter non-empty journal entries (up to 3)
  const recentJournalEntries = history
    .filter((h) => h.journal && h.journal.trim() !== "")
    .slice(0, 3);

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <ProfessionalSidebar
        activeTab="mood-stress"
        setActiveTab={(tab) => {
          if (tab === "overview" || tab === "dashboard") navigate("/professional/dashboard");
          if (tab === "checkin") navigate("/professional/checkin");
          if (tab === "profile") navigate("/professional/profile");
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* NAVBAR */}
      <ProfessionalNavbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onTabChange={(tab) => {
          if (tab === "overview" || tab === "dashboard") navigate("/professional/dashboard");
          if (tab === "checkin") navigate("/professional/checkin");
          if (tab === "profile") navigate("/professional/profile");
        }}
      />

      {/* MAIN CONTENT */}
      <main className="ns-main-content">
        {/* PAGE HEADER */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
            <h1 className="fw-bold fs-3 text-white mb-0">Mood & Stress</h1>
            <span className="badge bg-primary bg-opacity-25 text-blue-300 border border-primary border-opacity-30 rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5" style={{ fontSize: "0.82rem" }}>
              <FiCalendar /> {todayFormatted}
            </span>
          </div>
          <p className="text-gray-300 mb-0" style={{ fontSize: "0.95rem", color: "#CBD5E1" }}>
            Understand your emotional patterns and workplace stress over time.
          </p>
        </div>

        {/* INCOMPLETE TODAY CHECK-IN PROMPT BANNER */}
        {!loading && !hasSubmittedToday && (
          <div className="alert bg-primary bg-opacity-15 border border-primary border-opacity-30 rounded-4 p-3.5 mb-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow-sm">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2.5 rounded-3 bg-primary bg-opacity-25 text-primary fs-5">
                <FiPlusCircle />
              </div>
              <div>
                <h6 className="fw-bold text-white mb-0 fs-6">Complete today's check-in</h6>
                <p className="text-gray-300 mb-0 extra-small" style={{ color: "#CBD5E1" }}>
                  Complete today's check-in to view your latest mood and stress insights.
                </p>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-semibold ns-btn-primary flex-shrink-0"
              onClick={() => navigate("/professional/checkin")}
            >
              Complete Check-in
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading Analytics...</span>
            </div>
            <p className="text-muted mt-2" style={{ fontSize: "0.88rem" }}>Fetching mood and stress records...</p>
          </div>
        ) : !hasHistory ? (
          /* EMPTY STATE CONTAINER */
          <div className="ns-card p-5 text-center my-4 mx-auto" style={{ maxWidth: "640px" }}>
            <div className="p-3 rounded-circle bg-primary bg-opacity-25 text-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "72px", height: "72px", fontSize: "2.2rem" }}>
              <FiActivity />
            </div>
            <h3 className="fw-bold text-white mb-2 fs-4">Your wellness journey starts here.</h3>
            <p className="text-gray-300 mb-4" style={{ fontSize: "0.95rem", color: "#CBD5E1" }}>
              Complete your first Daily Check-in to start tracking mood, stress and work-life balance.
            </p>
            <div>
              <button
                className="btn btn-primary rounded-pill px-5 py-2.5 fw-semibold ns-btn-primary fs-6"
                onClick={() => navigate("/professional/checkin")}
              >
                Start Daily Check-in
              </button>
            </div>
          </div>
        ) : (
          /* POPULATED DASHBOARD VIEW */
          <div>
            {/* SECTION 1 — TODAY'S WELLNESS SUMMARY (4 CARDS) */}
            <div className="row g-3 mb-4">
              {/* CARD 1: TODAY'S MOOD */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted fw-medium extra-small" style={{ fontSize: "0.8rem", color: "#CBD5E1" }}>Today's Mood</span>
                    <span className="badge bg-primary bg-opacity-25 text-primary extra-small px-2 py-0.5 rounded-pill" style={{ fontSize: "0.7rem" }}>
                      Self-reported
                    </span>
                  </div>
                  {hasSubmittedToday ? (
                    <div className="d-flex align-items-center gap-2 my-1">
                      <span className="fs-2">{moodEmojiMap[todayCheckIn.mood] || "🙂"}</span>
                      <div>
                        <h4 className="fw-bold text-white mb-0 fs-5">{todayCheckIn.mood}</h4>
                        <span className="text-muted extra-small" style={{ fontSize: "0.76rem" }}>Logged today</span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-1">
                      <span className="text-muted fs-6 d-block">Not completed today</span>
                      <button 
                        className="btn btn-link text-primary p-0 text-decoration-none extra-small mt-1"
                        onClick={() => navigate("/professional/checkin")}
                      >
                        + Log Today
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: STRESS LEVEL */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted fw-medium extra-small" style={{ fontSize: "0.8rem", color: "#CBD5E1" }}>Stress Level</span>
                    <div className="p-1.5 rounded bg-warning bg-opacity-25 text-warning fs-6">
                      <FiActivity />
                    </div>
                  </div>
                  {hasSubmittedToday ? (
                    <div>
                      <h4 className="fw-bold text-white mb-0 fs-5">
                        {stressLabelMap[todayCheckIn.stressLevel] || "Low"}
                      </h4>
                      <span className="text-warning fw-semibold extra-small" style={{ fontSize: "0.82rem" }}>
                        {todayCheckIn.stressLevel} / 5
                      </span>
                    </div>
                  ) : (
                    <div className="my-1">
                      <span className="text-muted fs-6 d-block">Not completed today</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: ENERGY LEVEL */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted fw-medium extra-small" style={{ fontSize: "0.8rem", color: "#CBD5E1" }}>Energy Level</span>
                    <div className="p-1.5 rounded bg-info bg-opacity-25 text-info fs-6">
                      <FiZap />
                    </div>
                  </div>
                  {hasSubmittedToday ? (
                    <div>
                      <h4 className="fw-bold text-white mb-0 fs-5">
                        {energyLabelMap[todayCheckIn.energyLevel] || "High"}
                      </h4>
                      <span className="text-info fw-semibold extra-small" style={{ fontSize: "0.82rem" }}>
                        {todayCheckIn.energyLevel} / 5
                      </span>
                    </div>
                  ) : (
                    <div className="my-1">
                      <span className="text-muted fs-6 d-block">Not completed today</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 4: WORK FOCUS */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted fw-medium extra-small" style={{ fontSize: "0.8rem", color: "#CBD5E1" }}>Work Focus</span>
                    <div className="p-1.5 rounded bg-primary bg-opacity-25 text-primary fs-6">
                      <FiTarget />
                    </div>
                  </div>
                  {hasSubmittedToday ? (
                    <div>
                      <h4 className="fw-bold text-white mb-0 fs-5">
                        {focusLabelMap[todayCheckIn.focusLevel] || "Good"}
                      </h4>
                      <span className="text-primary fw-semibold extra-small" style={{ fontSize: "0.82rem" }}>
                        {todayCheckIn.focusLevel} / 5
                      </span>
                    </div>
                  ) : (
                    <div className="my-1">
                      <span className="text-muted fs-6 d-block">Not completed today</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2 — MOOD TREND & STRESS TREND CHARTS */}
            <div className="row g-4 mb-4">
              {/* WEEKLY MOOD TREND CARD */}
              <div className="col-12 col-lg-6">
                <div className="ns-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-3 bg-success bg-opacity-25 text-success">
                        <FiSmile className="fs-5" />
                      </div>
                      <div>
                        <h5 className="mb-0 text-white fw-bold fs-6">Weekly Mood Trend</h5>
                        <p className="mb-0 text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                          Mood trajectory over last 7 check-ins
                        </p>
                      </div>
                    </div>
                  </div>

                  {last7DaysData.length === 0 ? (
                    <div className="p-4 text-center text-muted border border-secondary border-opacity-25 rounded-3">
                      Not enough data yet. Complete more daily check-ins to see your mood trend.
                    </div>
                  ) : (
                    <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                      <div className="d-flex justify-content-between align-items-end px-2" style={{ height: "150px" }}>
                        {last7DaysData.map((item, idx) => {
                          const pct = (item.moodVal / 5) * 100;
                          return (
                            <div key={idx} className="d-flex flex-column align-items-center gap-1.5" style={{ width: "13%" }}>
                              <span className="fs-6">{moodEmojiMap[item.mood] || "🙂"}</span>
                              <div className="w-100 bg-dark rounded-top position-relative" style={{ height: "95px" }}>
                                <div
                                  className="w-100 rounded-top position-absolute bottom-0"
                                  style={{
                                    height: `${pct}%`,
                                    background: "linear-gradient(180deg, #10B981, #3B82F6)",
                                  }}
                                />
                              </div>
                              <span className="text-gray-300 extra-small" style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>
                                {item.date}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-25 extra-small text-muted" style={{ fontSize: "0.76rem" }}>
                        <span>Scale: 1 (Overwhelmed) to 5 (Great)</span>
                        <span className="text-success fw-semibold">Avg Mood: {avgMood}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* WEEKLY STRESS TREND CARD */}
              <div className="col-12 col-lg-6">
                <div className="ns-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-3 bg-warning bg-opacity-25 text-warning">
                        <FiActivity className="fs-5" />
                      </div>
                      <div>
                        <h5 className="mb-0 text-white fw-bold fs-6">Weekly Stress Trend</h5>
                        <p className="mb-0 text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                          Workplace stress level across check-ins
                        </p>
                      </div>
                    </div>
                  </div>

                  {last7DaysData.length === 0 ? (
                    <div className="p-4 text-center text-muted border border-secondary border-opacity-25 rounded-3">
                      Not enough data yet. Complete more daily check-ins to see your stress trend.
                    </div>
                  ) : (
                    <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                      <div className="d-flex justify-content-between align-items-end px-2" style={{ height: "150px" }}>
                        {last7DaysData.map((item, idx) => {
                          const pct = (item.stressLevel / 5) * 100;
                          return (
                            <div key={idx} className="d-flex flex-column align-items-center gap-1.5" style={{ width: "13%" }}>
                              <span className="fw-bold text-warning" style={{ fontSize: "0.74rem" }}>{item.stressLevel}/5</span>
                              <div className="w-100 bg-dark rounded-top position-relative" style={{ height: "95px" }}>
                                <div
                                  className="w-100 rounded-top position-absolute bottom-0"
                                  style={{
                                    height: `${pct}%`,
                                    background: "linear-gradient(180deg, #F59E0B, #EF4444)",
                                  }}
                                />
                              </div>
                              <span className="text-gray-300 extra-small" style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>
                                {item.date}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="d-flex align-items-center gap-2 mt-3 pt-2 border-top border-secondary border-opacity-25 extra-small text-muted" style={{ fontSize: "0.78rem" }}>
                        <FiTrendingUp className="text-warning flex-shrink-0" />
                        <span className="text-light">{stressTrendInsight}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3 — WELLNESS OVERVIEW (AVERAGES) & WORK-LIFE BALANCE */}
            <div className="row g-4 mb-4">
              {/* WELLNESS OVERVIEW AVERAGES */}
              <div className="col-12 col-lg-7">
                <div className="ns-card p-4 h-100">
                  <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary">
                      <FiActivity className="fs-5" />
                    </div>
                    <div>
                      <h5 className="mb-0 text-white fw-bold fs-6">Wellness Overview</h5>
                      <p className="mb-0 text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                        Calculated averages from actual check-in records
                      </p>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {/* Mood Average */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.86rem" }}>
                        <span className="text-light fw-medium">Average Mood</span>
                        <span className="text-success fw-bold">{avgMood} / 5</span>
                      </div>
                      <div className="progress" style={{ height: "8px", backgroundColor: "rgba(255, 255, 255, 0.08)" }}>
                        <div className="progress-bar bg-success" style={{ width: `${(avgMood / 5) * 100}%` }} />
                      </div>
                    </div>

                    {/* Stress Average */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.86rem" }}>
                        <span className="text-light fw-medium">Average Stress</span>
                        <span className="text-warning fw-bold">{avgStress} / 5</span>
                      </div>
                      <div className="progress" style={{ height: "8px", backgroundColor: "rgba(255, 255, 255, 0.08)" }}>
                        <div className="progress-bar bg-warning" style={{ width: `${(avgStress / 5) * 100}%` }} />
                      </div>
                    </div>

                    {/* Energy Average */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.86rem" }}>
                        <span className="text-light fw-medium">Average Energy</span>
                        <span className="text-info fw-bold">{avgEnergy} / 5</span>
                      </div>
                      <div className="progress" style={{ height: "8px", backgroundColor: "rgba(255, 255, 255, 0.08)" }}>
                        <div className="progress-bar bg-info" style={{ width: `${(avgEnergy / 5) * 100}%` }} />
                      </div>
                    </div>

                    {/* Focus Average */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.86rem" }}>
                        <span className="text-light fw-medium">Average Focus</span>
                        <span className="text-primary fw-bold">{avgFocus} / 5</span>
                      </div>
                      <div className="progress" style={{ height: "8px", backgroundColor: "rgba(255, 255, 255, 0.08)" }}>
                        <div className="progress-bar bg-primary" style={{ width: `${(avgFocus / 5) * 100}%` }} />
                      </div>
                    </div>

                    {/* Work-Life Balance Average */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.86rem" }}>
                        <span className="text-light fw-medium">Average Work-Life Balance</span>
                        <span className="text-purple-400 fw-bold" style={{ color: "#A78BFA" }}>{avgBalance} / 5</span>
                      </div>
                      <div className="progress" style={{ height: "8px", backgroundColor: "rgba(255, 255, 255, 0.08)" }}>
                        <div className="progress-bar" style={{ width: `${(avgBalance / 5) * 100}%`, backgroundColor: "#8B5CF6" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WORK-LIFE BALANCE CARD */}
              <div className="col-12 col-lg-5">
                <div className="ns-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                      <div className="p-2 rounded-3 bg-purple-500 bg-opacity-25 text-purple-400" style={{ backgroundColor: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}>
                        <FiCompass className="fs-5" />
                      </div>
                      <div>
                        <h5 className="mb-0 text-white fw-bold fs-6">Work-Life Balance</h5>
                        <p className="mb-0 text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                          Work hours & rest distribution
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-3">
                      <span className="text-muted extra-small d-block mb-1">Latest Balance Score</span>
                      <div className="d-flex align-items-baseline gap-2">
                        <h3 className="fw-bold text-white mb-0 fs-4">
                          {todayCheckIn ? `${todayCheckIn.workLifeBalance} / 5` : `${avgBalance} / 5`}
                        </h3>
                        <span className="badge bg-purple-500 bg-opacity-25 text-purple-300 px-2.5 py-1 rounded-pill" style={{ color: "#c4b5fd" }}>
                          {todayCheckIn ? balanceLabelMap[todayCheckIn.workLifeBalance] : balanceLabelMap[Math.round(avgBalance)] || "Balanced"}
                        </span>
                      </div>
                    </div>

                    <div className="row g-2 text-start">
                      <div className="col-6">
                        <div className="p-2.5 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                          <span className="text-muted extra-small d-block mb-0.5" style={{ fontSize: "0.72rem" }}>
                            <FiClock className="me-1" /> Avg Working Hours
                          </span>
                          <span className="fw-bold text-white" style={{ fontSize: "0.92rem" }}>{avgWorkingHours} Hours / day</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2.5 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                          <span className="text-muted extra-small d-block mb-0.5" style={{ fontSize: "0.72rem" }}>
                            <FiCoffee className="me-1" /> Break Pattern
                          </span>
                          <span className="fw-bold text-white" style={{ fontSize: "0.92rem" }}>{breakPatternSummary}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-top border-secondary border-opacity-25">
                    <p className="text-muted mb-0 extra-small" style={{ fontSize: "0.76rem", lineHeight: "1.4" }}>
                      💡 <em>Consistent rest breaks and manageable work hours strongly support cognitive resilience.</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4 — MOOD JOURNAL PREVIEW & NEUROSYNC INSIGHT */}
            <div className="row g-4 mb-4">
              {/* MOOD JOURNAL PREVIEW */}
              <div className="col-12 col-lg-7">
                <div className="ns-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary">
                          <FiBookOpen className="fs-5" />
                        </div>
                        <div>
                          <h5 className="mb-0 text-white fw-bold fs-6">Recent Journal Entries</h5>
                          <p className="mb-0 text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                            Reflections logged during check-ins
                          </p>
                        </div>
                      </div>
                      <button className="btn btn-link text-primary text-decoration-none p-0 extra-small fw-semibold">
                        View All Entries →
                      </button>
                    </div>

                    {recentJournalEntries.length === 0 ? (
                      <div className="p-4 text-center text-muted border border-secondary border-opacity-25 rounded-3">
                        No journal entries yet. You can share your thoughts in Question 10 during daily check-ins.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2.5">
                        {recentJournalEntries.map((entry) => (
                          <div key={entry._id} className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="fw-semibold text-white extra-small" style={{ fontSize: "0.82rem" }}>
                                {entry.date}
                              </span>
                              <span className="badge bg-dark border border-secondary border-opacity-25 text-light extra-small">
                                {moodEmojiMap[entry.mood]} {entry.mood}
                              </span>
                            </div>
                            <p className="mb-0 text-gray-300 extra-small" style={{ fontSize: "0.84rem", color: "#CBD5E1", lineHeight: "1.45" }}>
                              "{entry.journal}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* NEUROSYNC AI INSIGHT */}
              <div className="col-12 col-lg-5">
                <div className="ns-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                      <div className="p-2 rounded-3 bg-info bg-opacity-25 text-info">
                        <FiCpu className="fs-5" />
                      </div>
                      <div>
                        <h5 className="mb-0 text-white fw-bold fs-6">NeuroSync Insight</h5>
                        <p className="mb-0 text-muted extra-small" style={{ fontSize: "0.78rem" }}>
                          Automated data analysis
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-3">
                      <p className="text-light mb-0" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
                        "{neurosyncInsightText}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill px-4 py-2 w-100 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                      onClick={() => navigate("/professional/recommendations")}
                    >
                      View Recommendations <FiArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5 — FUTURE FACIAL EMOTION PLACEHOLDER */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="ns-card p-4 border border-secondary border-opacity-25">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-3 rounded-4 bg-purple-500 bg-opacity-25 text-purple-400 fs-4" style={{ backgroundColor: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}>
                        <FiCamera />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h5 className="mb-0 text-white fw-bold fs-6">AI Facial Emotion Analysis</h5>
                          <span className="badge bg-purple-500 bg-opacity-25 text-purple-300 border border-purple-400 border-opacity-30 rounded-pill px-2.5 py-0.5 extra-small" style={{ color: "#c4b5fd" }}>
                            Coming Soon
                          </span>
                        </div>
                        <p className="text-gray-300 mb-0 extra-small" style={{ fontSize: "0.84rem", color: "#CBD5E1" }}>
                          NeuroSync will analyze facial expressions to estimate your current emotional state and compare it with your self-reported mood.
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn btn-outline-secondary rounded-pill px-4 py-2 text-white-50 flex-shrink-0 d-flex align-items-center gap-2"
                      disabled
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    >
                      <FiCamera /> Start AI Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <DashboardFooter />
    </div>
  );
}

export default ProfessionalMoodStress;
