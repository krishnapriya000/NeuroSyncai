import { API_BASE_URL } from "../utils/apiConfig.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { 
  FiSmile, 
  FiMoon, 
  FiActivity, 
  FiZap, 
  FiAlertCircle, 
  FiBatteryCharging, 
  FiTarget, 
  FiMessageSquare,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEdit3,
  FiCheckSquare,
  FiCalendar,
  FiRefreshCw,
  FiGrid,
  FiStar,
  FiChevronRight
} from "react-icons/fi";
import "../styles/studentDashboard.css";

// Helper to format today's date (YYYY-MM-DD)
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Display mapping helpers for clean emoji labels and text
const formatFeeling = (val) => {
  if (!val) return "Not specified";
  const map = {
    "Very Happy": "😊 Very Happy",
    "Happy": "🙂 Happy",
    "Neutral": "😐 Neutral",
    "Stressed": "😟 Stressed",
    "Sad": "😢 Sad",
  };
  return map[val] || val;
};

const formatSleep = (val) => {
  if (!val) return "Not specified";
  const map = {
    "Less than 4 hours": "🌙 Less than 4 hours",
    "4–6 hours": "💤 4–6 hours",
    "6–8 hours": "🛌 6–8 hours",
    "More than 8 hours": "✨ More than 8 hours",
  };
  return map[val] || val;
};

const formatChallenge = (val) => {
  if (!val) return "Not specified";
  const map = {
    "Exams": "📝 Exams",
    "Assignments": "📚 Assignments",
    "Time Management": "⏰ Time Management",
    "Personal Problems": "💭 Personal Problems",
    "Health": "🏥 Health",
    "No Challenges": "✨ No Challenges",
  };
  return map[val] || val;
};

const formatEnergy = (val) => {
  if (!val) return "Not specified";
  const map = {
    "Very High": "⚡ Very High",
    "High": "🔋 High",
    "Moderate": "⚖️ Moderate",
    "Low": "🪫 Low",
    "Very Low": "💤 Very Low",
  };
  return map[val] || val;
};

const formatGoal = (val) => {
  if (!val) return "Not specified";
  const map = {
    "Complete Assignments": "✅ Complete Assignments",
    "Prepare for Exams": "📖 Prepare for Exams",
    "Practice Coding": "💻 Practice Coding",
    "Learn Something New": "💡 Learn Something New",
    "Relax and Recharge": "🌿 Relax and Recharge",
  };
  return map[val] || val;
};

const formatTalkAI = (val) => {
  if (!val) return "Not specified";
  const map = {
    "Yes": "🤖 Yes, start conversation",
    "Maybe Later": "⏳ Maybe Later",
    "No": "🚫 No, not today",
  };
  return map[val] || val;
};

function StudentCheckIn() {
  const navigate = useNavigate();
  const [activeTab] = useState("checkin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loadingCheckIn, setLoadingCheckIn] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastCheckInDateStr, setLastCheckInDateStr] = useState("");

  // Form State
  const [answers, setAnswers] = useState({
    feeling: "",
    sleepHours: "",
    stressLevel: 5,
    motivationLevel: 5,
    biggestChallenge: "",
    energyLevel: "",
    mainGoal: "",
    talkToAI: "",
  });

  // Fetch logged in student info and latest check-in data on mount
  useEffect(() => {
    const token = localStorage.getItem("neurosync_token");
    const storedUser = localStorage.getItem("neurosync_current_user");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.fullName || parsed.name) {
        setStudentName(parsed.fullName || parsed.name);
      }
    } catch (e) {
      console.error("Error parsing stored user:", e);
    }

    const fetchCheckInStatus = async () => {
      setLoadingCheckIn(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/dailycheckin/latest`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success && data.hasData && data.checkIn) {
          const checkIn = data.checkIn;
          setAnswers({
            feeling: checkIn.feeling || data.mood || "",
            sleepHours: checkIn.sleepHours || data.sleepHours || "",
            stressLevel: checkIn.stressLevel !== undefined ? Number(checkIn.stressLevel) : 5,
            motivationLevel: checkIn.motivationLevel !== undefined ? Number(checkIn.motivationLevel) : 5,
            biggestChallenge: checkIn.biggestChallenge || data.biggestChallenge || "",
            energyLevel: checkIn.energyLevel || data.energyLevel || "",
            mainGoal: checkIn.mainGoal || data.goal || "",
            talkToAI: checkIn.talkToAI || data.talkToAI || "",
          });
          setLastCheckInDateStr(checkIn.date || data.date || getTodayString());
          setIsCompleted(true);
          setShowForm(false);
        } else {
          setIsCompleted(false);
          setShowForm(true);
        }
      } catch (err) {
        console.error("Check-in status fetch error:", err);
        setIsCompleted(false);
        setShowForm(true);
      } finally {
        setLoadingCheckIn(false);
      }
    };

    fetchCheckInStatus();
  }, [navigate]);

  // Option select handler
  const handleSelectOption = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrorMessage("");
  };

  // Slider change handler
  const handleSliderChange = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  // Check if current step is valid before proceeding
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return Boolean(answers.feeling);
      case 2:
        return Boolean(answers.sleepHours);
      case 3:
        return answers.stressLevel >= 1 && answers.stressLevel <= 10;
      case 4:
        return answers.motivationLevel >= 1 && answers.motivationLevel <= 10;
      case 5:
        return Boolean(answers.biggestChallenge);
      case 6:
        return Boolean(answers.energyLevel);
      case 7:
        return Boolean(answers.mainGoal);
      case 8:
        return Boolean(answers.talkToAI);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) {
      setErrorMessage("Please answer the question before continuing.");
      return;
    }
    setErrorMessage("");
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmitSurvey();
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit survey responses to backend API
  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("neurosync_token");

      const response = await fetch(`${API_BASE_URL}/api/student/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(answers),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to submit survey. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Update localStorage with updated user and lastCheckInDate
      const storedUser = localStorage.getItem("neurosync_current_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.lastCheckInDate = getTodayString();
        localStorage.setItem("neurosync_current_user", JSON.stringify(parsed));
      }

      setLastCheckInDateStr(getTodayString());
      setIsCompleted(true);
      setShowForm(false);
    } catch (err) {
      setErrorMessage("Network error: Could not reach the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stress Level Badge helper
  const getStressLabel = (val) => {
    if (val <= 3) return { text: "Low Stress", color: "#10b981" };
    if (val <= 6) return { text: "Moderate Stress", color: "#f59e0b" };
    return { text: "High Stress", color: "#ef4444" };
  };

  // Motivation Level Badge helper
  const getMotivationLabel = (val) => {
    if (val <= 3) return { text: "Low Motivation", color: "#ef4444" };
    if (val <= 6) return { text: "Moderate Motivation", color: "#f59e0b" };
    return { text: "High Motivation", color: "#3b82f6" };
  };

  const progressPercent = Math.round((currentStep / 8) * 100);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
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
        {/* Compact Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1.5">
              <span
                className="badge rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5"
                style={{
                  background: "rgba(99, 102, 241, 0.12)",
                  color: "#818cf8",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  fontSize: "0.78rem",
                  fontWeight: 600
                }}
              >
                <FiCheckSquare size={13} /> Student Daily Check-in
              </span>
              {isCompleted && !showForm && (
                <span className="badge rounded-pill px-2.5 py-1 bg-success bg-opacity-15 text-success border border-success border-opacity-25" style={{ fontSize: "0.72rem" }}>
                  ✓ Recorded {lastCheckInDateStr || getTodayString()}
                </span>
              )}
            </div>
            <h1 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "var(--ns-text-main, #ffffff)" }}>
              Daily Check-in Survey & Responses
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
              Track your daily mood, sleep, stress levels, goals, and AI companion preferences.
            </p>
          </div>

          {isCompleted && !showForm && (
            <button
              type="button"
              className="btn px-3.5 py-2 rounded-pill text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                fontSize: "0.88rem"
              }}
              onClick={() => {
                setShowForm(true);
                setCurrentStep(1);
              }}
            >
              <FiEdit3 size={16} />
              <span>Retake / Update Survey</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        {loadingCheckIn ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>Loading check-in survey status...</div>
          </div>
        ) : isCompleted && !showForm ? (
          /* COMPACT ELEGANT WELLNESS DASHBOARD VIEW */
          <div className="ns-checkin-wrapper">
            {/* 1. TODAY'S WELLBEING SNAPSHOT (Coherent Metrics Area) */}
            <div className="ns-wellness-card p-4 border mb-4">
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
                <div className="d-flex align-items-center gap-2.5">
                  <div className="p-2 rounded-circle ns-pulse-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                    <FiStar size={18} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 ns-tile-val" style={{ fontSize: "1.08rem" }}>Today's Wellbeing Snapshot</h5>
                    <span className="ns-tile-sub">Recorded on {lastCheckInDateStr || getTodayString()}</span>
                  </div>
                </div>
                <span className="badge rounded-pill px-3 py-1.5 bg-success bg-opacity-15 text-success border border-success border-opacity-25 extra-small fw-semibold">
                  ✓ Verified Submission
                </span>
              </div>

              {/* 6 Compact Metric Components */}
              <div className="row g-3">
                {/* Metric 1: Feeling */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="ns-metric-tile h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="ns-tile-label">Feeling</span>
                      <FiSmile className="text-primary" size={16} />
                    </div>
                    <div className="ns-tile-val mb-1">{formatFeeling(answers.feeling)}</div>
                    <span className="ns-tile-sub">Current Mood Status</span>
                  </div>
                </div>

                {/* Metric 2: Sleep Duration */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="ns-metric-tile h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="ns-tile-label">Sleep Duration</span>
                      <FiMoon className="text-info" size={16} />
                    </div>
                    <div className="ns-tile-val mb-1">{formatSleep(answers.sleepHours)}</div>
                    <span className="ns-tile-sub">Night Rest Quality</span>
                  </div>
                </div>

                {/* Metric 3: Stress Level */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="ns-metric-tile h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="ns-tile-label">Stress Level</span>
                      <FiActivity className="text-warning" size={16} />
                    </div>
                    <div className="d-flex align-items-baseline gap-2 mb-2">
                      <span className="ns-tile-val fs-4">{answers.stressLevel}</span>
                      <span className="ns-tile-sub">/ 10</span>
                      <span className="badge px-2.5 py-1 rounded-pill ms-auto extra-small fw-semibold" style={{ background: `${getStressLabel(answers.stressLevel).color}20`, color: getStressLabel(answers.stressLevel).color }}>
                        {getStressLabel(answers.stressLevel).text}
                      </span>
                    </div>
                    <div className="progress rounded-pill overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.1)" }}>
                      <div className="progress-bar rounded-pill ns-animated-progress-bar" style={{ width: `${(answers.stressLevel / 10) * 100}%`, background: getStressLabel(answers.stressLevel).color }} />
                    </div>
                  </div>
                </div>

                {/* Metric 4: Motivation */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="ns-metric-tile h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="ns-tile-label">Motivation</span>
                      <FiZap className="text-success" size={16} />
                    </div>
                    <div className="d-flex align-items-baseline gap-2 mb-2">
                      <span className="ns-tile-val fs-4">{answers.motivationLevel}</span>
                      <span className="ns-tile-sub">/ 10</span>
                      <span className="badge px-2.5 py-1 rounded-pill ms-auto extra-small fw-semibold" style={{ background: `${getMotivationLabel(answers.motivationLevel).color}20`, color: getMotivationLabel(answers.motivationLevel).color }}>
                        {getMotivationLabel(answers.motivationLevel).text}
                      </span>
                    </div>
                    <div className="progress rounded-pill overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.1)" }}>
                      <div className="progress-bar rounded-pill ns-animated-progress-bar" style={{ width: `${(answers.motivationLevel / 10) * 100}%`, background: getMotivationLabel(answers.motivationLevel).color }} />
                    </div>
                  </div>
                </div>

                {/* Metric 5: Energy Level */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="ns-metric-tile h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="ns-tile-label">Energy Reserve</span>
                      <FiBatteryCharging className="text-warning" size={16} />
                    </div>
                    <div className="ns-tile-val mb-1">{formatEnergy(answers.energyLevel)}</div>
                    <span className="ns-tile-sub">Physical Energy</span>
                  </div>
                </div>

                {/* Metric 6: Today's Main Challenge (Reflective Insight) */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="ns-metric-tile ns-metric-tile-challenge h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="ns-tile-label" style={{ color: "#f87171" }}>Today's Main Challenge</span>
                      <FiAlertCircle className="text-danger" size={16} />
                    </div>
                    <div className="ns-tile-val mb-1">{formatChallenge(answers.biggestChallenge)}</div>
                    <span className="ns-tile-sub">Primary Obstacle Focus</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GOAL & AI COMPANION HIGHLIGHT SECTION */}
            <div className="row g-4 mb-4">
              {/* Primary Focus Goal */}
              <div className="col-12 col-md-6">
                <div className="ns-action-card h-100">
                  <div className="d-flex align-items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-circle ns-pulse-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                      <FiTarget size={18} />
                    </div>
                    <div>
                      <h6 className="fw-bold ns-tile-val mb-0" style={{ fontSize: "1rem" }}>Primary Focus Goal</h6>
                      <span className="ns-tile-sub">Today's target objective</span>
                    </div>
                  </div>
                  <div className="ns-action-inner-box d-flex align-items-center gap-3">
                    <span className="fw-bold fs-6 ns-tile-val">{formatGoal(answers.mainGoal)}</span>
                  </div>
                </div>
              </div>

              {/* AI Wellness Companion */}
              <div className="col-12 col-md-6">
                <div className="ns-action-card h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div className="p-2 rounded-circle ns-pulse-icon" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee" }}>
                        <FiMessageSquare size={18} />
                      </div>
                      <div>
                        <h6 className="fw-bold ns-tile-val mb-0" style={{ fontSize: "1rem" }}>AI Companion Preference</h6>
                        <span className="ns-tile-sub">NeuroSync AI Chat</span>
                      </div>
                    </div>
                    {answers.talkToAI === "Yes" && (
                      <button
                        type="button"
                        className="btn btn-sm text-white rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1 shadow-sm transition-all"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", fontSize: "0.8rem" }}
                        onClick={() => navigate("/student/ai-companion")}
                      >
                        Start Chat <FiChevronRight size={14} />
                      </button>
                    )}
                  </div>
                  <div className="ns-action-inner-box d-flex align-items-center gap-3">
                    <span className="fw-bold fs-6 ns-tile-val">{formatTalkAI(answers.talkToAI)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FOOTER NAVIGATION ACTIONS */}
            <div className="ns-action-card d-flex flex-wrap align-items-center justify-content-between gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4 py-2 d-flex align-items-center gap-2 transition-all fw-semibold"
                style={{ fontSize: "0.88rem" }}
                onClick={() => {
                  setShowForm(true);
                  setCurrentStep(1);
                }}
              >
                <FiRefreshCw size={15} /> Retake / Update Survey
              </button>

              <button
                type="button"
                className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold d-flex align-items-center gap-2 shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none" }}
                onClick={() => navigate("/student/dashboard")}
              >
                <FiGrid size={17} /> Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* STEP-BY-STEP SURVEY FORM WIZARD */
          <div 
            className="w-100 rounded-4 shadow-lg p-4 p-md-5 position-relative overflow-hidden mx-auto mb-4"
            style={{
              maxWidth: "640px",
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            {/* Header & Progress */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-primary bg-opacity-25 text-blue-300 px-3 py-1.5 rounded-pill border border-blue-400 border-opacity-30 small">
                  🧠 Daily Check-in Survey
                </span>
                <span className="text-secondary small fw-semibold">
                  Step {currentStep} of 8 ({progressPercent}%)
                </span>
              </div>

              {/* Progress Track */}
              <div 
                className="w-100 rounded-pill overflow-hidden" 
                style={{ height: "6px", background: "rgba(255, 255, 255, 0.1)" }}
              >
                <div 
                  className="h-100 rounded-pill transition-all"
                  style={{ 
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                    transition: "width 0.4s ease-in-out"
                  }}
                />
              </div>
            </div>

            {/* Global Error Banner */}
            {errorMessage && (
              <div className="alert alert-danger bg-danger bg-opacity-20 border-danger border-opacity-30 text-danger-light rounded-3 p-3 mb-4 small d-flex align-items-center gap-2">
                <span>⚠️</span>
                <div>{errorMessage}</div>
              </div>
            )}

            {/* QUESTION 1: Feeling */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                  <FiSmile size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 1</span>
                </div>
                <h3 className="fw-bold mb-4 text-white">How are you feeling today?</h3>

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: "😊 Very Happy", value: "Very Happy" },
                    { label: "🙂 Happy", value: "Happy" },
                    { label: "😐 Neutral", value: "Neutral" },
                    { label: "😟 Stressed", value: "Stressed" },
                    { label: "😢 Sad", value: "Sad" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn text-start p-3 rounded-4 transition-all d-flex align-items-center justify-content-between ${
                        answers.feeling === opt.value
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 hover-bg-light"
                      }`}
                      style={{ border: "1px solid" }}
                      onClick={() => handleSelectOption("feeling", opt.value)}
                    >
                      <span className="fs-5 fw-medium">{opt.label}</span>
                      {answers.feeling === opt.value && <FiCheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUESTION 2: Sleep Hours */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-info mb-2">
                  <FiMoon size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 2</span>
                </div>
                <h3 className="fw-bold mb-4 text-white">How many hours did you sleep last night?</h3>

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: "🌙 Less than 4 hours", value: "Less than 4 hours" },
                    { label: "💤 4–6 hours", value: "4–6 hours" },
                    { label: "🛌 6–8 hours", value: "6–8 hours" },
                    { label: "✨ More than 8 hours", value: "More than 8 hours" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn text-start p-3 rounded-4 transition-all d-flex align-items-center justify-content-between ${
                        answers.sleepHours === opt.value
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 hover-bg-light"
                      }`}
                      style={{ border: "1px solid" }}
                      onClick={() => handleSelectOption("sleepHours", opt.value)}
                    >
                      <span className="fs-5 fw-medium">{opt.label}</span>
                      {answers.sleepHours === opt.value && <FiCheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUESTION 3: Stress Level Slider */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-warning mb-2">
                  <FiActivity size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 3</span>
                </div>
                <h3 className="fw-bold mb-2 text-white">How stressed do you feel today?</h3>
                <p className="text-secondary small mb-4">Slide from 1 (Very Low Stress) to 10 (Extreme Stress)</p>

                <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-center">
                  <div className="display-3 fw-bold mb-2" style={{ color: getStressLabel(answers.stressLevel).color }}>
                    {answers.stressLevel}
                  </div>
                  <span 
                    className="badge px-3 py-1.5 rounded-pill fs-6 mb-4"
                    style={{ 
                      backgroundColor: `${getStressLabel(answers.stressLevel).color}22`,
                      color: getStressLabel(answers.stressLevel).color,
                      border: `1px solid ${getStressLabel(answers.stressLevel).color}44`
                    }}
                  >
                    {getStressLabel(answers.stressLevel).text}
                  </span>

                  <input 
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="form-range w-100"
                    value={answers.stressLevel}
                    onChange={(e) => handleSliderChange("stressLevel", e.target.value)}
                  />

                  <div className="d-flex justify-content-between text-secondary small mt-2">
                    <span>1 (Relaxed)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Overwhelmed)</span>
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION 4: Study Motivation Slider */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-success mb-2">
                  <FiZap size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 4</span>
                </div>
                <h3 className="fw-bold mb-2 text-white">How motivated are you to study today?</h3>
                <p className="text-secondary small mb-4">Slide from 1 (No Motivation) to 10 (Fully Energized & Ready)</p>

                <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-center">
                  <div className="display-3 fw-bold mb-2" style={{ color: getMotivationLabel(answers.motivationLevel).color }}>
                    {answers.motivationLevel}
                  </div>
                  <span 
                    className="badge px-3 py-1.5 rounded-pill fs-6 mb-4"
                    style={{ 
                      backgroundColor: `${getMotivationLabel(answers.motivationLevel).color}22`,
                      color: getMotivationLabel(answers.motivationLevel).color,
                      border: `1px solid ${getMotivationLabel(answers.motivationLevel).color}44`
                    }}
                  >
                    {getMotivationLabel(answers.motivationLevel).text}
                  </span>

                  <input 
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="form-range w-100"
                    value={answers.motivationLevel}
                    onChange={(e) => handleSliderChange("motivationLevel", e.target.value)}
                  />

                  <div className="d-flex justify-content-between text-secondary small mt-2">
                    <span>1 (Unmotivated)</span>
                    <span>5 (Neutral)</span>
                    <span>10 (Peak Motivation)</span>
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION 5: Biggest Challenge */}
            {currentStep === 5 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-danger mb-2">
                  <FiAlertCircle size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 5</span>
                </div>
                <h3 className="fw-bold mb-4 text-white">What is your biggest challenge today?</h3>

                <div className="row g-3">
                  {[
                    { label: "📝 Exams", value: "Exams" },
                    { label: "📚 Assignments", value: "Assignments" },
                    { label: "⏰ Time Management", value: "Time Management" },
                    { label: "💭 Personal Problems", value: "Personal Problems" },
                    { label: "🏥 Health", value: "Health" },
                    { label: "✨ No Challenges", value: "No Challenges" },
                  ].map((opt) => (
                    <div key={opt.value} className="col-6">
                      <button
                        type="button"
                        className={`btn text-start p-3 w-100 rounded-4 transition-all h-100 d-flex align-items-center justify-content-between ${
                          answers.biggestChallenge === opt.value
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 hover-bg-light"
                        }`}
                        style={{ border: "1px solid" }}
                        onClick={() => handleSelectOption("biggestChallenge", opt.value)}
                      >
                        <span className="fw-medium" style={{ fontSize: "0.95rem" }}>{opt.label}</span>
                        {answers.biggestChallenge === opt.value && <FiCheckCircle size={18} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUESTION 6: Energy Level */}
            {currentStep === 6 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-warning mb-2">
                  <FiBatteryCharging size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 6</span>
                </div>
                <h3 className="fw-bold mb-4 text-white">How is your energy level today?</h3>

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: "⚡ Very High", value: "Very High" },
                    { label: "🔋 High", value: "High" },
                    { label: "⚖️ Moderate", value: "Moderate" },
                    { label: "🪫 Low", value: "Low" },
                    { label: "💤 Very Low", value: "Very Low" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn text-start p-3 rounded-4 transition-all d-flex align-items-center justify-content-between ${
                        answers.energyLevel === opt.value
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 hover-bg-light"
                      }`}
                      style={{ border: "1px solid" }}
                      onClick={() => handleSelectOption("energyLevel", opt.value)}
                    >
                      <span className="fs-5 fw-medium">{opt.label}</span>
                      {answers.energyLevel === opt.value && <FiCheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUESTION 7: Main Goal */}
            {currentStep === 7 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                  <FiTarget size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 7</span>
                </div>
                <h3 className="fw-bold mb-4 text-white">What is your main goal today?</h3>

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: "✅ Complete Assignments", value: "Complete Assignments" },
                    { label: "📖 Prepare for Exams", value: "Prepare for Exams" },
                    { label: "💻 Practice Coding", value: "Practice Coding" },
                    { label: "💡 Learn Something New", value: "Learn Something New" },
                    { label: "🌿 Relax and Recharge", value: "Relax and Recharge" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn text-start p-3 rounded-4 transition-all d-flex align-items-center justify-content-between ${
                        answers.mainGoal === opt.value
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 hover-bg-light"
                      }`}
                      style={{ border: "1px solid" }}
                      onClick={() => handleSelectOption("mainGoal", opt.value)}
                    >
                      <span className="fs-5 fw-medium">{opt.label}</span>
                      {answers.mainGoal === opt.value && <FiCheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUESTION 8: Talk with NeuroSync AI */}
            {currentStep === 8 && (
              <div className="animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-info mb-2">
                  <FiMessageSquare size={24} />
                  <span className="small text-uppercase tracking-wider fw-bold">Question 8</span>
                </div>
                <h3 className="fw-bold mb-4 text-white">Would you like to talk with NeuroSync AI today?</h3>

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: "🤖 Yes, start conversation", value: "Yes" },
                    { label: "⏳ Maybe Later", value: "Maybe Later" },
                    { label: "🚫 No, not today", value: "No" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn text-start p-3 rounded-4 transition-all d-flex align-items-center justify-content-between ${
                        answers.talkToAI === opt.value
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 hover-bg-light"
                      }`}
                      style={{ border: "1px solid" }}
                      onClick={() => handleSelectOption("talkToAI", opt.value)}
                    >
                      <span className="fs-5 fw-medium">{opt.label}</span>
                      {answers.talkToAI === opt.value && <FiCheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons Bar */}
            <div className="d-flex align-items-center justify-content-between mt-5 pt-3 border-top border-secondary border-opacity-25">
              <button
                type="button"
                className="btn btn-outline-secondary text-white rounded-pill px-4 py-2 border-secondary d-flex align-items-center gap-2"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
              >
                <FiArrowLeft /> Previous
              </button>

              <button
                type="button"
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Submitting...
                  </>
                ) : currentStep === 8 ? (
                  <>
                    Submit Check-in <FiCheckCircle />
                  </>
                ) : (
                  <>
                    Next <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

export default StudentCheckIn;
