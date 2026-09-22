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
  FiGrid
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

// Display mapping helpers for clean emoji labels and high-contrast text
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
        const response = await fetch("http://localhost:5000/api/student/dailycheckin/latest", {
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

      const response = await fetch("http://localhost:5000/api/student/checkin", {
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
    if (val <= 3) return { text: "Low Stress", color: "#22c55e" };
    if (val <= 6) return { text: "Moderate Stress", color: "#f59e0b" };
    return { text: "High Stress", color: "#ef4444" };
  };

  // Motivation Level Badge helper
  const getMotivationLabel = (val) => {
    if (val <= 3) return { text: "Low Motivation", color: "#ef4444" };
    if (val <= 6) return { text: "Moderate Motivation", color: "#f59e0b" };
    return { text: "High Motivation 🔥", color: "#3b82f6" };
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
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60A5FA",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <FiCheckSquare className="me-1" /> Student Daily Check-in
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">Daily Check-in Survey & Responses</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Track your daily mood, sleep, stress levels, goals, and AI companion preferences.
            </p>
          </div>

          {isCompleted && !showForm && (
            <button
              type="button"
              className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                border: "none",
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                setShowForm(true);
                setCurrentStep(1);
              }}
            >
              <FiEdit3 size={18} />
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
          /* ALL 8 SURVEY QUESTIONS AND ANSWERS VIEW */
          <div
            className="ns-card p-4 p-md-5 rounded-4 border border-secondary border-opacity-25 shadow-lg mb-4"
            style={{
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header Badge & Date */}
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between pb-3 mb-4 border-bottom border-secondary border-opacity-25 gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-success bg-opacity-20 text-success p-2.5 d-flex align-items-center justify-content-center border border-success border-opacity-30">
                  <FiCheckCircle size={28} />
                </div>
                <div>
                  <h4 className="text-white fw-bold mb-0">Check-in Submitted & Recorded</h4>
                  <span className="text-muted small">Here are all your survey questions and answers.</span>
                </div>
              </div>
              {lastCheckInDateStr && (
                <span className="badge rounded-pill px-3 py-2 bg-dark text-white border border-secondary border-opacity-25 d-flex align-items-center gap-1.5 align-self-start align-self-sm-center">
                  <FiCalendar className="text-primary" /> Recorded: {lastCheckInDateStr}
                </span>
              )}
            </div>

            {/* 8 Questions & Answers Grid */}
            <div className="row g-4">
              {/* Question 1 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(59, 130, 246, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#60A5FA" }}>
                      <FiSmile size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 1 • Feeling</span>
                    </div>
                    <div className="text-white-50 small mb-3">How are you feeling today?</div>
                  </div>
                  <div>
                    <span 
                      className="d-inline-flex align-items-center px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#93C5FD",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        fontSize: "0.95rem"
                      }}
                    >
                      {formatFeeling(answers.feeling)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(14, 165, 233, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#38BDF8" }}>
                      <FiMoon size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 2 • Sleep</span>
                    </div>
                    <div className="text-white-50 small mb-3">How many hours did you sleep last night?</div>
                  </div>
                  <div>
                    <span 
                      className="d-inline-flex align-items-center px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{
                        background: "rgba(14, 165, 233, 0.2)",
                        color: "#7DD3FC",
                        border: "1px solid rgba(14, 165, 233, 0.4)",
                        fontSize: "0.95rem"
                      }}
                    >
                      {formatSleep(answers.sleepHours)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 3 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(245, 158, 11, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#FBBF24" }}>
                      <FiActivity size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 3 • Stress</span>
                    </div>
                    <div className="text-white-50 small mb-3">How stressed do you feel today? (1–10)</div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="display-6 fw-bold text-white">
                      {answers.stressLevel}<span className="fs-5 text-muted">/10</span>
                    </div>
                    <span 
                      className="px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{ 
                        backgroundColor: `${getStressLabel(answers.stressLevel).color}25`,
                        color: getStressLabel(answers.stressLevel).color,
                        border: `1px solid ${getStressLabel(answers.stressLevel).color}55`,
                        fontSize: "0.95rem"
                      }}
                    >
                      {getStressLabel(answers.stressLevel).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 4 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(34, 197, 94, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#4ADE80" }}>
                      <FiZap size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 4 • Motivation</span>
                    </div>
                    <div className="text-white-50 small mb-3">How motivated are you to study today? (1–10)</div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="display-6 fw-bold text-white">
                      {answers.motivationLevel}<span className="fs-5 text-muted">/10</span>
                    </div>
                    <span 
                      className="px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{ 
                        backgroundColor: `${getMotivationLabel(answers.motivationLevel).color}25`,
                        color: getMotivationLabel(answers.motivationLevel).color,
                        border: `1px solid ${getMotivationLabel(answers.motivationLevel).color}55`,
                        fontSize: "0.95rem"
                      }}
                    >
                      {getMotivationLabel(answers.motivationLevel).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 5 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(239, 68, 68, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#F87171" }}>
                      <FiAlertCircle size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 5 • Challenge</span>
                    </div>
                    <div className="text-white-50 small mb-3">What is your biggest challenge today?</div>
                  </div>
                  <div>
                    <span 
                      className="d-inline-flex align-items-center px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#FCA5A5",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        fontSize: "0.95rem"
                      }}
                    >
                      {formatChallenge(answers.biggestChallenge)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 6 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(245, 158, 11, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#FBBF24" }}>
                      <FiBatteryCharging size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 6 • Energy Level</span>
                    </div>
                    <div className="text-white-50 small mb-3">How is your energy level today?</div>
                  </div>
                  <div>
                    <span 
                      className="d-inline-flex align-items-center px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{
                        background: "rgba(245, 158, 11, 0.2)",
                        color: "#FDE047",
                        border: "1px solid rgba(245, 158, 11, 0.4)",
                        fontSize: "0.95rem"
                      }}
                    >
                      {formatEnergy(answers.energyLevel)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 7 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(168, 85, 247, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#C084FC" }}>
                      <FiTarget size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 7 • Main Goal</span>
                    </div>
                    <div className="text-white-50 small mb-3">What is your main goal today?</div>
                  </div>
                  <div>
                    <span 
                      className="d-inline-flex align-items-center px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{
                        background: "rgba(168, 85, 247, 0.2)",
                        color: "#E9D5FF",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        fontSize: "0.95rem"
                      }}
                    >
                      {formatGoal(answers.mainGoal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 8 */}
              <div className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" 
                  style={{ 
                    background: "rgba(30, 41, 59, 0.6)", 
                    border: "1px solid rgba(6, 182, 212, 0.25)" 
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#22D3EE" }}>
                      <FiMessageSquare size={18} />
                      <span className="fw-bold small text-uppercase tracking-wider">Question 8 • AI Companion</span>
                    </div>
                    <div className="text-white-50 small mb-3">Would you like to talk with NeuroSync AI today?</div>
                  </div>
                  <div>
                    <span 
                      className="d-inline-flex align-items-center px-3.5 py-2 rounded-3 fw-semibold shadow-sm"
                      style={{
                        background: "rgba(6, 182, 212, 0.2)",
                        color: "#67E8F9",
                        border: "1px solid rgba(6, 182, 212, 0.4)",
                        fontSize: "0.95rem"
                      }}
                    >
                      {formatTalkAI(answers.talkToAI)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mt-5 pt-3 border-top border-secondary border-opacity-25 gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary text-white rounded-pill px-4 py-2 border-secondary d-flex align-items-center gap-2"
                onClick={() => {
                  setShowForm(true);
                  setCurrentStep(1);
                }}
              >
                <FiRefreshCw size={16} /> Retake / Update Survey
              </button>

              <button
                type="button"
                className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold d-flex align-items-center gap-2 shadow-lg"
                onClick={() => navigate("/student/dashboard")}
              >
                <FiGrid size={18} /> Go to Dashboard 🚀
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
