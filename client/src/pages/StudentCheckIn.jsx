import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FiCheckCircle
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

function StudentCheckIn() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  // Check if today's check-in was already completed locally or on backend
  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem("neurosync_token");
      const storedUser = localStorage.getItem("neurosync_current_user");

      if (!token || !storedUser) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const parsed = JSON.parse(storedUser);
        const todayStr = getTodayString();

        // If local user object shows today's checkin is already done, redirect to dashboard immediately
        if (parsed.lastCheckInDate === todayStr) {
          navigate("/student/dashboard", { replace: true });
          return;
        }

        // Verify with backend API
        const response = await fetch("http://localhost:5000/api/student/checkin-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success && data.completedToday) {
          // Update local user object
          parsed.lastCheckInDate = todayStr;
          localStorage.setItem("neurosync_current_user", JSON.stringify(parsed));
          navigate("/student/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Check-in status fetch error:", err);
      }
    };

    checkStatus();
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

      setIsCompleted(true);
    } catch (err) {
      setErrorMessage("Network error: Could not reach the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/student/dashboard", { replace: true });
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
    <div 
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-3"
      style={{
        background: "radial-gradient(circle at top right, #1E1B4B 0%, #0F172A 40%, #090D16 100%)",
        color: "#F8FAFC",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Container Card */}
      <div 
        className="w-100 rounded-4 shadow-lg p-4 p-md-5 position-relative overflow-hidden"
        style={{
          maxWidth: "640px",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)"
        }}
      >
        {!isCompleted ? (
          <>
            {/* Header & Progress */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-primary bg-opacity-25 text-blue-300 px-3 py-1.5 rounded-pill border border-blue-400 border-opacity-30 small">
                  🧠 NeuroSync Daily Check-in
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
                <h3 className="fw-bold mb-4">How are you feeling today?</h3>

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
                <h3 className="fw-bold mb-4">How many hours did you sleep last night?</h3>

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
                <h3 className="fw-bold mb-2">How stressed do you feel today?</h3>
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
                <h3 className="fw-bold mb-2">How motivated are you to study today?</h3>
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
                <h3 className="fw-bold mb-4">What is your biggest challenge today?</h3>

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
                <h3 className="fw-bold mb-4">How is your energy level today?</h3>

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
                <h3 className="fw-bold mb-4">What is your main goal today?</h3>

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
                <h3 className="fw-bold mb-4">Would you like to talk with NeuroSync AI today?</h3>

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
          </>
        ) : (
          /* FINAL SCREEN */
          <div className="text-center py-4 animate-fade-in">
            <div 
              className="rounded-circle bg-success bg-opacity-20 border border-success border-opacity-30 d-inline-flex align-items-center justify-content-center mb-4 text-success"
              style={{ width: "80px", height: "80px" }}
            >
              <FiCheckCircle size={44} />
            </div>

            <h2 className="fw-bold mb-3 text-white">Thank you!</h2>
            <p className="text-secondary fs-5 mb-4" style={{ maxWidth: "480px", margin: "0 auto" }}>
              Your daily wellness check is complete. Have a productive and balanced day!
            </p>

            <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4 text-start" style={{ fontSize: "0.9rem" }}>
              <div className="fw-semibold text-primary mb-1">Today's Summary Recorded:</div>
              <div className="text-secondary">• Feeling: <span className="text-white">{answers.feeling}</span></div>
              <div className="text-secondary">• Sleep: <span className="text-white">{answers.sleepHours}</span></div>
              <div className="text-secondary">• Main Goal: <span className="text-white">{answers.mainGoal}</span></div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCheckIn;
