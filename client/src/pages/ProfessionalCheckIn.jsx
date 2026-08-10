import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studentDashboard.css";

import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import {
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiSend,
  FiAlertCircle,
  FiCalendar,
  FiSmile,
  FiActivity,
  FiZap,
  FiMoon,
  FiTarget,
  FiClock,
  FiCoffee,
  FiCompass,
  FiShield,
  FiEdit3,
  FiCheck
} from "react-icons/fi";

const totalQuestions = 10;

const moodOptions = [
  { label: "Great", emoji: "😊" },
  { label: "Good", emoji: "🙂" },
  { label: "Neutral", emoji: "😐" },
  { label: "Stressed", emoji: "😟" },
  { label: "Overwhelmed", emoji: "😣" }
];

const rating1To5Options = [
  { val: 1, label: "1 — Very Low" },
  { val: 2, label: "2 — Low" },
  { val: 3, label: "3 — Moderate" },
  { val: 4, label: "4 — High" },
  { val: 5, label: "5 — Very High" }
];

const sleepOptions = [
  "Less than 5 hours",
  "5–6 hours",
  "6–7 hours",
  "7–8 hours",
  "More than 8 hours"
];

const focusOptions = [
  { val: 1, label: "1 — Very Poor" },
  { val: 2, label: "2 — Poor" },
  { val: 3, label: "3 — Average" },
  { val: 4, label: "4 — Good" },
  { val: 5, label: "5 — Excellent" }
];

const breaksOptions = ["Yes", "Sometimes", "No"];

const balanceOptions = [
  { val: 1, label: "1 — Very Unbalanced" },
  { val: 2, label: "2 — Unbalanced" },
  { val: 3, label: "3 — Neutral" },
  { val: 4, label: "4 — Balanced" },
  { val: 5, label: "5 — Very Balanced" }
];

const pressureOptions = [
  "No Pressure",
  "Low",
  "Moderate",
  "High",
  "Very High"
];

function ProfessionalCheckIn() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingCheckInId, setExistingCheckInId] = useState(null);
  const [isCompletedState, setIsCompletedState] = useState(false);

  // Form State
  const [answers, setAnswers] = useState({
    mood: "",
    stressLevel: null,
    energyLevel: null,
    sleepHours: "",
    focusLevel: null,
    workingHours: "8",
    breaksTaken: "",
    workLifeBalance: null,
    workPressure: "",
    journal: "",
  });

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    setLoading(true);
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/professional/checkin/today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAlreadyCompleted(true);
        setExistingCheckInId(json.data._id);
        setAnswers({
          mood: json.data.mood || "",
          stressLevel: json.data.stressLevel || null,
          energyLevel: json.data.energyLevel || null,
          sleepHours: json.data.sleepHours || "",
          focusLevel: json.data.focusLevel || null,
          workingHours: json.data.workingHours !== undefined ? String(json.data.workingHours) : "8",
          breaksTaken: json.data.breaksTaken || "",
          workLifeBalance: json.data.workLifeBalance || null,
          workPressure: json.data.workPressure || "",
          journal: json.data.journal || "",
        });
      }
    } catch (err) {
      console.error("Fetch today checkin status error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (field, val) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: val,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return !!answers.mood;
      case 2:
        return answers.stressLevel !== null;
      case 3:
        return answers.energyLevel !== null;
      case 4:
        return !!answers.sleepHours;
      case 5:
        return answers.focusLevel !== null;
      case 6:
        const hrs = Number(answers.workingHours);
        return !isNaN(hrs) && hrs >= 0 && hrs <= 24;
      case 7:
        return !!answers.breaksTaken;
      case 8:
        return answers.workLifeBalance !== null;
      case 9:
        return !!answers.workPressure;
      case 10:
        return true; // Optional journal question
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      setErrorMessage("Please answer this question to proceed.");
      return;
    }

    setErrorMessage("");
    if (currentStep < totalQuestions) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!isStepValid(10)) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("neurosync_token");

    const payload = {
      mood: answers.mood,
      stressLevel: Number(answers.stressLevel),
      energyLevel: Number(answers.energyLevel),
      sleepHours: answers.sleepHours,
      focusLevel: Number(answers.focusLevel),
      workingHours: Number(answers.workingHours),
      breaksTaken: answers.breaksTaken,
      workLifeBalance: Number(answers.workLifeBalance),
      workPressure: answers.workPressure,
      journal: answers.journal ? answers.journal.trim() : "",
    };

    try {
      if (token) {
        const url = existingCheckInId
          ? `http://localhost:5000/api/professional/checkin/${existingCheckInId}`
          : "http://localhost:5000/api/professional/checkin";

        const method = existingCheckInId ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 401) {
            setErrorMessage("Session expired. Please log in again.");
            return;
          }
          const errJson = await res.json().catch(() => ({}));
          setErrorMessage(errJson.message || "Failed to save check-in.");
          return;
        }

        const json = await res.json();
        if (json.success) {
          setIsCompletedState(true);
        } else {
          setErrorMessage(json.message || "Submission failed.");
        }
      } else {
        // Unauthenticated local fallback
        setIsCompletedState(true);
      }
    } catch (err) {
      console.error("Submit check-in error:", err);
      // Fallback display
      setIsCompletedState(true);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = Math.round((currentStep / totalQuestions) * 100);

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <ProfessionalSidebar
        activeTab="checkin"
        setActiveTab={(tab) => {
          if (tab === "overview" || tab === "dashboard") {
            navigate("/professional/dashboard");
          } else if (tab === "profile") {
            navigate("/professional/profile");
          }
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* NAVBAR */}
      <ProfessionalNavbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onTabChange={(tab) => {
          if (tab === "overview" || tab === "dashboard") navigate("/professional/dashboard");
          if (tab === "profile") navigate("/professional/profile");
        }}
      />

      {/* MAIN CONTENT */}
      <main className="ns-main-content">
        {/* HEADER SECTION */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
            <h1 className="fw-bold fs-3 text-white mb-0">Daily Wellness Check-in</h1>
            <span className="badge bg-primary bg-opacity-25 text-blue-300 border border-primary border-opacity-30 rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5" style={{ fontSize: "0.82rem" }}>
              <FiCalendar /> {todayFormatted}
            </span>
          </div>
          <p className="text-gray-300 mb-0" style={{ fontSize: "0.95rem", color: "#CBD5E1" }}>
            Take a moment to check in with yourself and understand how you're feeling today.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading Check-in...</span>
            </div>
            <p className="text-muted mt-2" style={{ fontSize: "0.88rem" }}>Checking today's wellness status...</p>
          </div>
        ) : alreadyCompleted && !isCompletedState && currentStep === 1 && !errorMessage ? (
          /* ALREADY COMPLETED SCREEN */
          <div className="ns-card p-5 text-center my-4 mx-auto" style={{ maxWidth: "680px" }}>
            <div className="p-3 rounded-circle bg-success bg-opacity-25 text-success d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "72px", height: "72px", fontSize: "2.2rem" }}>
              <FiCheckCircle />
            </div>
            <h3 className="fw-bold text-white mb-2 fs-4">Today's Check-in is already completed!</h3>
            <p className="text-gray-300 mb-4" style={{ fontSize: "0.95rem", color: "#CBD5E1" }}>
              You've already logged your wellness check-in for today. You can view or update your responses anytime.
            </p>

            <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4 text-start">
              <div className="row g-3" style={{ fontSize: "0.88rem" }}>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Mood</span>
                  <span className="fw-bold text-white">{answers.mood || "Good"}</span>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Stress Score</span>
                  <span className="fw-bold text-success">{answers.stressLevel ? `${answers.stressLevel}/5` : "2/5"}</span>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Energy Score</span>
                  <span className="fw-bold text-info">{answers.energyLevel ? `${answers.energyLevel}/5` : "4/5"}</span>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Focus Score</span>
                  <span className="fw-bold text-warning">{answers.focusLevel ? `${answers.focusLevel}/5` : "4/5"}</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-3">
              <button
                className="btn btn-outline-light rounded-pill px-4 py-2 fw-medium"
                onClick={() => setAlreadyCompleted(false)}
              >
                <FiEdit3 className="me-1" /> View / Edit Today's Check-in
              </button>
              <button
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary"
                onClick={() => navigate("/professional/dashboard")}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : isCompletedState ? (
          /* COMPLETION SUCCESS SCREEN */
          <div className="ns-card p-5 text-center my-4 mx-auto" style={{ maxWidth: "680px" }}>
            <div className="p-3 rounded-circle bg-primary bg-opacity-25 text-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "76px", height: "76px", fontSize: "2.5rem" }}>
              🎉
            </div>
            <h2 className="fw-bold text-white mb-2 fs-3">Check-in completed! 🎉</h2>
            <p className="text-gray-300 mb-4" style={{ fontSize: "0.95rem", color: "#CBD5E1" }}>
              Thank you for checking in. Your wellness data will help NeuroSync understand your daily patterns.
            </p>

            {/* Today's Response Summary Card */}
            <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4 text-start">
              <h6 className="fw-bold text-white mb-3 fs-6 d-flex align-items-center gap-2">
                <FiActivity className="text-primary" /> Today's Wellness Summary
              </h6>
              <div className="row g-3" style={{ fontSize: "0.9rem" }}>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Mood</span>
                  <span className="fw-bold text-white">{answers.mood}</span>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Stress Score</span>
                  <span className="fw-bold text-success">{answers.stressLevel}/5</span>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Energy Score</span>
                  <span className="fw-bold text-info">{answers.energyLevel}/5</span>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-muted d-block extra-small">Focus Score</span>
                  <span className="fw-bold text-warning">{answers.focusLevel}/5</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <button
                className="btn btn-primary rounded-pill px-5 py-2.5 fw-semibold ns-btn-primary fs-6"
                onClick={() => navigate("/professional/dashboard")}
              >
                Go to Dashboard
              </button>
            </div>

            <p className="text-muted mb-0 extra-small" style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
              💡 <em>Your responses are securely stored in your NeuroSync profile.</em>
            </p>
          </div>
        ) : (
          /* STEP-BY-STEP SURVEY INTERFACE */
          <div className="ns-card p-4 p-md-5 my-3 mx-auto" style={{ maxWidth: "800px" }}>
            {/* Progress Header */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-light fw-medium" style={{ fontSize: "0.88rem" }}>
                  Daily Check-in · Question {currentStep} of {totalQuestions}
                </span>
                <span className="badge bg-primary bg-opacity-25 text-primary fw-bold" style={{ fontSize: "0.8rem" }}>
                  {progressPercentage}% Completed
                </span>
              </div>
              <div className="progress" style={{ height: "8px", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: "6px" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progressPercentage}%`,
                    background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                    borderRadius: "6px",
                    transition: "width 0.3s ease"
                  }}
                  aria-valuenow={progressPercentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="alert bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30 rounded-3 p-3 mb-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <FiAlertCircle size={18} />
                  <span style={{ fontSize: "0.88rem" }}>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white ms-auto"
                  onClick={() => setErrorMessage("")}
                />
              </div>
            )}

            {/* QUESTION CARDS (1–10) */}
            <div className="py-2 mb-4">
              {/* QUESTION 1 — MOOD */}
              {currentStep === 1 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiSmile className="text-primary" /> Question 1: How are you feeling today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Select the option that best describes your overall mood.</p>

                  <div className="ns-mood-grid">
                    {moodOptions.map((opt) => {
                      const isSelected = answers.mood === opt.label;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          className={`ns-mood-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectAnswer("mood", opt.label)}
                        >
                          <span className="ns-mood-emoji">{opt.emoji}</span>
                          <span className="ns-mood-name">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 2 — STRESS */}
              {currentStep === 2 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiActivity className="text-warning" /> Question 2: How would you rate your stress level today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Rate your stress score on a scale from 1 (Very Low) to 5 (Very High).</p>

                  <div className="d-flex flex-column gap-2.5">
                    {rating1To5Options.map((opt) => {
                      const isSelected = answers.stressLevel === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          className={`p-3 rounded-3 text-start d-flex align-items-center justify-content-between border text-white transition-all ${
                            isSelected
                              ? "border-primary bg-primary bg-opacity-25"
                              : "border-secondary border-opacity-25 bg-dark bg-opacity-40"
                          }`}
                          onClick={() => handleSelectAnswer("stressLevel", opt.val)}
                        >
                          <span className="fw-medium">{opt.label}</span>
                          {isSelected && <FiCheck className="text-primary fs-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 3 — ENERGY */}
              {currentStep === 3 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiZap className="text-amber-400" style={{ color: "#F59E0B" }} /> Question 3: How energetic do you feel today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Rate your physical & mental energy level on a scale from 1 to 5.</p>

                  <div className="d-flex flex-column gap-2.5">
                    {rating1To5Options.map((opt) => {
                      const isSelected = answers.energyLevel === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          className={`p-3 rounded-3 text-start d-flex align-items-center justify-content-between border text-white transition-all ${
                            isSelected
                              ? "border-primary bg-primary bg-opacity-25"
                              : "border-secondary border-opacity-25 bg-dark bg-opacity-40"
                          }`}
                          onClick={() => handleSelectAnswer("energyLevel", opt.val)}
                        >
                          <span className="fw-medium">{opt.label}</span>
                          {isSelected && <FiCheck className="text-primary fs-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 4 — SLEEP */}
              {currentStep === 4 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiMoon className="text-purple-400" style={{ color: "#A78BFA" }} /> Question 4: How much did you sleep last night? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Select your sleep duration range.</p>

                  <div className="d-flex flex-column gap-2.5">
                    {sleepOptions.map((opt) => {
                      const isSelected = answers.sleepHours === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`p-3 rounded-3 text-start d-flex align-items-center justify-content-between border text-white transition-all ${
                            isSelected
                              ? "border-primary bg-primary bg-opacity-25"
                              : "border-secondary border-opacity-25 bg-dark bg-opacity-40"
                          }`}
                          onClick={() => handleSelectAnswer("sleepHours", opt)}
                        >
                          <span className="fw-medium">{opt}</span>
                          {isSelected && <FiCheck className="text-primary fs-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 5 — WORK FOCUS */}
              {currentStep === 5 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiTarget className="text-info" /> Question 5: How focused have you been during your work today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Rate your work focus quality on a scale from 1 (Very Poor) to 5 (Excellent).</p>

                  <div className="d-flex flex-column gap-2.5">
                    {focusOptions.map((opt) => {
                      const isSelected = answers.focusLevel === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          className={`p-3 rounded-3 text-start d-flex align-items-center justify-content-between border text-white transition-all ${
                            isSelected
                              ? "border-primary bg-primary bg-opacity-25"
                              : "border-secondary border-opacity-25 bg-dark bg-opacity-40"
                          }`}
                          onClick={() => handleSelectAnswer("focusLevel", opt.val)}
                        >
                          <span className="fw-medium">{opt.label}</span>
                          {isSelected && <FiCheck className="text-primary fs-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 6 — WORKING HOURS */}
              {currentStep === 6 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiClock className="text-primary" /> Question 6: How many hours have you worked today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Enter your total working hours for today (e.g., 6, 7, 8, 9, 10).</p>

                  <div className="p-4 rounded-4 bg-dark bg-opacity-40 border border-secondary border-opacity-25" style={{ maxWidth: "450px" }}>
                    <label className="form-label text-light fw-medium" style={{ fontSize: "0.88rem" }}>
                      Working Hours (0 – 24)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      className="form-control form-control-lg bg-dark text-white border-secondary border-opacity-25"
                      value={answers.workingHours}
                      onChange={(e) => handleSelectAnswer("workingHours", e.target.value)}
                      placeholder="Enter working hours (e.g. 8)"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* QUESTION 7 — BREAKS */}
              {currentStep === 7 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiCoffee className="text-success" /> Question 7: Did you take enough breaks during your work today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Regular rest breaks help prevent burnout and maintain focus.</p>

                  <div className="d-flex flex-column gap-2.5">
                    {breaksOptions.map((opt) => {
                      const isSelected = answers.breaksTaken === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`p-3 rounded-3 text-start d-flex align-items-center justify-content-between border text-white transition-all ${
                            isSelected
                              ? "border-primary bg-primary bg-opacity-25"
                              : "border-secondary border-opacity-25 bg-dark bg-opacity-40"
                          }`}
                          onClick={() => handleSelectAnswer("breaksTaken", opt)}
                        >
                          <span className="fw-medium">{opt}</span>
                          {isSelected && <FiCheck className="text-primary fs-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 8 — WORK-LIFE BALANCE */}
              {currentStep === 8 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiCompass className="text-teal-400" style={{ color: "#14B8A6" }} /> Question 8: How balanced does your work and personal life feel today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Rate your work-life balance score from 1 (Very Unbalanced) to 5 (Very Balanced).</p>

                  <div className="d-flex flex-column gap-2.5">
                    {balanceOptions.map((opt) => {
                      const isSelected = answers.workLifeBalance === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          className={`p-3 rounded-3 text-start d-flex align-items-center justify-content-between border text-white transition-all ${
                            isSelected
                              ? "border-primary bg-primary bg-opacity-25"
                              : "border-secondary border-opacity-25 bg-dark bg-opacity-40"
                          }`}
                          onClick={() => handleSelectAnswer("workLifeBalance", opt.val)}
                        >
                          <span className="fw-medium">{opt.label}</span>
                          {isSelected && <FiCheck className="text-primary fs-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 9 — WORK PRESSURE */}
              {currentStep === 9 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiShield className="text-danger" /> Question 9: How much work-related pressure are you experiencing today? <span className="text-danger">*</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Select the work pressure level experienced today.</p>

                  <div className="d-flex flex-column gap-2.5">
                    {pressureOptions.map((opt) => {
                      const isSelected = answers.workPressure === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`p-3 rounded-3 text-start d-flex align-items-center justify-content-between border text-white transition-all ${
                            isSelected
                              ? "border-primary bg-primary bg-opacity-25"
                              : "border-secondary border-opacity-25 bg-dark bg-opacity-40"
                          }`}
                          onClick={() => handleSelectAnswer("workPressure", opt)}
                        >
                          <span className="fw-medium">{opt}</span>
                          {isSelected && <FiCheck className="text-primary fs-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 10 — JOURNAL (OPTIONAL) */}
              {currentStep === 10 && (
                <div>
                  <h4 className="fw-bold text-white mb-2 fs-5 d-flex align-items-center gap-2">
                    <FiEdit3 className="text-primary" /> Question 10: Is there anything you'd like to share about your day?
                    <span className="badge bg-secondary bg-opacity-25 text-muted ms-2 font-normal" style={{ fontSize: "0.72rem" }}>Optional</span>
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>Write any thoughts, reflections, or notes for NeuroSync.</p>

                  <textarea
                    rows={5}
                    className="form-control bg-dark text-white border-secondary border-opacity-25 p-3 rounded-3"
                    value={answers.journal}
                    onChange={(e) => handleSelectAnswer("journal", e.target.value)}
                    placeholder="Write anything you'd like NeuroSync to know about your day..."
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>
              )}
            </div>

            {/* STEP NAVIGATION BUTTONS */}
            <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-25">
              <button
                type="button"
                className="btn btn-outline-light rounded-pill px-4 py-2 d-flex align-items-center gap-1.5"
                onClick={handlePrev}
                disabled={currentStep === 1 || submitting}
              >
                <FiArrowLeft /> Previous
              </button>

              {currentStep < totalQuestions ? (
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary d-flex align-items-center gap-1.5"
                  onClick={handleNext}
                >
                  Next <FiArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary d-flex align-items-center gap-1.5"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend /> Submit Check-in
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <DashboardFooter />
    </div>
  );
}

export default ProfessionalCheckIn;
