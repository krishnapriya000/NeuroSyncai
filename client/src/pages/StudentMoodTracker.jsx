import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import AIMoodRecommendationCard from "../components/dashboard/AIMoodRecommendationCard";
import MoodHistoryCard from "../components/dashboard/MoodHistoryCard";
import FacialEmotionAnalysisModal from "../components/professional/FacialEmotionAnalysisModal";
import {
  FiSmile,
  FiSliders,
  FiTag,
  FiFileText,
  FiSave,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiHeart,
  FiRefreshCw,
  FiCamera
} from "react-icons/fi";
import "../styles/studentDashboard.css";

const moodOptions = [
  { id: "Very Happy", label: "Very Happy", emoji: "😄", color: "#10B981" },
  { id: "Happy", label: "Happy", emoji: "🙂", color: "#3B82F6" },
  { id: "Neutral", label: "Neutral", emoji: "😐", color: "#94A3B8" },
  { id: "Sad", label: "Sad", emoji: "😔", color: "#6366F1" },
  { id: "Stressed", label: "Stressed", emoji: "😣", color: "#F59E0B" },
  { id: "Angry", label: "Angry", emoji: "😡", color: "#EF4444" },
  { id: "Tired", label: "Tired", emoji: "😴", color: "#8B5CF6" },
  { id: "Anxious", label: "Anxious", emoji: "😰", color: "#EC4899" },
];

const reasonOptions = [
  "Studies",
  "Exams",
  "Assignments",
  "Friends",
  "Family",
  "Health",
  "Financial",
  "Relationship",
  "Other",
];

function StudentMoodTracker() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mood-tracker");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Form states
  const [selectedMood, setSelectedMood] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // Facial analysis state
  const [facialModalOpen, setFacialModalOpen] = useState(false);

  const handleUseMoodFromAI = (mappedMood) => {
    setSelectedMood(mappedMood);
    setErrorMessage("");
    setSuccessMessage(`AI estimated mood (${mappedMood}) applied! Please review intensity & reason, then click Save Mood to record.`);
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // UI feedback & data states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Latest mood state
  const [latestMoodState, setLatestMoodState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  // Fetch student name & latest mood on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setStudentName(userObj.fullName || userObj.name);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    fetchLatestMood();
  }, []);

  const fetchLatestMood = async () => {
    setLatestMoodState((prev) => ({ ...prev, loading: true, error: null }));
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setLatestMoodState({
        loading: false,
        error: "Authentication token missing.",
        data: null,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/moodtracker/latest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setLatestMoodState({
          loading: false,
          error: result.message || "Failed to fetch latest mood.",
          data: null,
        });
        return;
      }

      setLatestMoodState({
        loading: false,
        error: null,
        data: result.data,
      });
    } catch (err) {
      console.error("Error fetching latest mood:", err);
      setLatestMoodState({
        loading: false,
        error: "Cannot connect to backend server.",
        data: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Validation
    if (!selectedMood) {
      setErrorMessage("Please select your current mood.");
      return;
    }

    if (!reason) {
      setErrorMessage("Please select a reason for your current mood.");
      return;
    }

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setErrorMessage("Authentication token missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/moodtracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          intensity,
          reason,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to save mood entry.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Mood entry recorded successfully! 🎉");
      setIsSubmitting(false);

      // Reset form fields
      setSelectedMood("");
      setIntensity(5);
      setReason("");
      setNotes("");

      // Automatically fetch and display the latest mood and update mood history
      await fetchLatestMood();
      setHistoryRefreshKey((prev) => prev + 1);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      console.error("Error submitting mood:", err);
      setErrorMessage("Server error occurred while saving your mood.");
      setIsSubmitting(false);
    }
  };

  // Helper to find emoji for a mood string
  const getMoodEmoji = (moodStr) => {
    const found = moodOptions.find(
      (m) => m.id.toLowerCase() === (moodStr || "").toLowerCase()
    );
    return found ? found.emoji : "🙂";
  };

  // Helper to find color for a mood string
  const getMoodColor = (moodStr) => {
    const found = moodOptions.find(
      (m) => m.id.toLowerCase() === (moodStr || "").toLowerCase()
    );
    return found ? found.color : "#3B82F6";
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Top Navbar */}
      <TopNavbar
        studentName={studentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <main className="ns-main-content">
        {/* Header Title Banner */}
        <div className="d-flex align-items-center justify-content-between mb-4">
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
                <FiSmile className="me-1" /> Emotional Wellness Module
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">Mood Tracker</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Track your emotional state, reflect on triggers, and build self-awareness over time.
            </p>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {successMessage && (
          <div
            className="alert alert-success d-flex align-items-center justify-content-between rounded-4 shadow-sm mb-4 border-0"
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              borderLeft: "4px solid #10B981",
              color: "#6EE7B7",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FiCheckCircle size={20} className="text-success" />
              <span className="fw-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setSuccessMessage("")}
            />
          </div>
        )}

        {errorMessage && (
          <div
            className="alert alert-danger d-flex align-items-center justify-content-between rounded-4 shadow-sm mb-4 border-0"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              borderLeft: "4px solid #EF4444",
              color: "#FCA5A5",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FiAlertCircle size={20} className="text-danger" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setErrorMessage("")}
            />
          </div>
        )}

        {/* Main Grid: Entry Form (Left / Top) & Today's Mood Card (Right / Bottom) */}
        <div className="row g-4 mb-4">
          {/* Mood Entry Form Column */}
          <div className="col-lg-7">
            <div className="ns-card">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                <div
                  className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
                    color: "#A78BFA",
                  }}
                >
                  <FiHeart size={22} />
                </div>
                <div>
                  <h2 className="mb-0 text-white fw-bold fs-5">Log Mood Entry</h2>
                  <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Select your current mood, intensity level, and primary cause.
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Field 1: Current Mood */}
                <div className="mb-4">
                  <label className="form-label text-white fw-semibold mb-2 fs-6">
                    How are you feeling right now? <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2">
                    {moodOptions.map((option) => {
                      const isSelected = selectedMood === option.id;
                      return (
                        <div key={option.id} className="col-6 col-sm-3">
                          <button
                            type="button"
                            className="btn w-100 p-3 rounded-4 d-flex flex-column align-items-center justify-content-center gap-1 transition-all"
                            style={{
                              background: isSelected
                                ? `rgba(59, 130, 246, 0.25)`
                                : "rgba(255, 255, 255, 0.03)",
                              border: isSelected
                                ? `2px solid ${option.color}`
                                : "1px solid rgba(255, 255, 255, 0.08)",
                              boxShadow: isSelected
                                ? `0 0 15px ${option.color}40`
                                : "none",
                              transform: isSelected ? "scale(1.03)" : "scale(1)",
                            }}
                            onClick={() => {
                              setSelectedMood(option.id);
                              setErrorMessage("");
                            }}
                          >
                            <span style={{ fontSize: "2rem", lineHeight: 1 }}>
                              {option.emoji}
                            </span>
                            <span
                              className="fw-medium mt-1 text-truncate"
                              style={{
                                fontSize: "0.85rem",
                                color: isSelected ? "#FFFFFF" : "#CBD5E1",
                              }}
                            >
                              {option.label}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Field 2: Mood Intensity Slider */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label text-white fw-semibold mb-0 fs-6 d-flex align-items-center gap-2">
                      <FiSliders className="text-primary" /> Mood Intensity
                    </label>
                    <span
                      className="badge rounded-pill px-3 py-1 fw-bold fs-6"
                      style={{
                        background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                        color: "#FFF",
                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      {intensity} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    className="form-range custom-intensity-slider"
                    min="1"
                    max="10"
                    step="1"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    style={{
                      accentColor: "#3B82F6",
                      cursor: "pointer",
                      height: "8px",
                      borderRadius: "4px",
                    }}
                  />
                  <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                    <span>1 (Mild)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Extreme)</span>
                  </div>
                </div>

                {/* Field 3: Reason Dropdown */}
                <div className="mb-4">
                  <label className="form-label text-white fw-semibold mb-2 fs-6 d-flex align-items-center gap-2">
                    <FiTag className="text-secondary" /> Reason <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select text-white rounded-3 p-3 border-0"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      outline: "none",
                      color: reason ? "#FFF" : "#94A3B8",
                    }}
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setErrorMessage("");
                    }}
                  >
                    <option value="" disabled style={{ background: "#0F172A", color: "#94A3B8" }}>
                      Select what is influencing your mood...
                    </option>
                    {reasonOptions.map((opt) => (
                      <option key={opt} value={opt} style={{ background: "#0F172A", color: "#FFF" }}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 4: Notes Textarea */}
                <div className="mb-4">
                  <label className="form-label text-white fw-semibold mb-2 fs-6 d-flex align-items-center gap-2">
                    <FiFileText className="text-info" /> Notes
                  </label>
                  <textarea
                    className="form-control text-white rounded-3 p-3"
                    rows="3"
                    placeholder="Write something about how you feel..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFF",
                      resize: "none",
                    }}
                  ></textarea>
                </div>

                {/* Save Button */}
                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn px-4 py-3 rounded-3 text-white fw-bold d-flex align-items-center gap-2 shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      border: "none",
                      transition: "all 0.3s ease",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Saving Mood...
                      </>
                    ) : (
                      <>
                        <FiSave size={18} />
                        Save Mood
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* AI Facial Emotion Analysis Card */}
            <div className="ns-card mt-4 mb-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="badge rounded-pill px-3 py-1"
                      style={{
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#C084FC",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <FiCamera className="me-1" /> AI Feature
                    </span>
                  </div>
                  <h3 className="text-white fw-bold fs-5 mb-1">AI Facial Emotion Analysis</h3>
                  <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
                    Use your facial expression to get an AI-estimated emotional state.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn text-white fw-semibold px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    border: "none",
                    fontSize: "0.92rem",
                  }}
                  onClick={() => setFacialModalOpen(true)}
                >
                  <FiCamera size={18} />
                  Start AI Analysis
                </button>
              </div>
            </div>

            {/* Mood History Card (Below Form on Left) */}
            <MoodHistoryCard refreshKey={historyRefreshKey} />
          </div>

          {/* Today's Mood Card & AI Recommendation Column (Right Side) */}
          <div className="col-lg-5">
            <div className="ns-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#60A5FA",
                      }}
                    >
                      <FiSmile size={22} />
                    </div>
                    <h2 className="mb-0 text-white fw-bold fs-5">Today's Latest Mood</h2>
                  </div>
                  <button
                    className="btn btn-dark p-2 rounded-circle border-0 text-muted hover-white"
                    onClick={fetchLatestMood}
                    title="Refresh Latest Mood"
                    disabled={latestMoodState.loading}
                  >
                    <FiRefreshCw className={latestMoodState.loading ? "spin" : ""} size={16} />
                  </button>
                </div>

                {/* Card Content based on State */}
                {latestMoodState.loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
                      Fetching your latest mood entry...
                    </p>
                  </div>
                ) : latestMoodState.error ? (
                  <div className="alert alert-danger rounded-3 border-0 bg-danger bg-opacity-10 text-danger p-3">
                    <FiAlertCircle me={2} /> {latestMoodState.error}
                  </div>
                ) : latestMoodState.data ? (
                  /* Display Logged Mood Details */
                  <div className="d-flex flex-column gap-3">
                    {/* Big Emoji & Mood Name Display */}
                    <div
                      className="p-4 rounded-4 text-center position-relative overflow-hidden"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${getMoodColor(latestMoodState.data.mood)}40`,
                        boxShadow: `0 0 25px ${getMoodColor(latestMoodState.data.mood)}1A`,
                      }}
                    >
                      <div className="display-3 mb-1" style={{ lineHeight: 1 }}>
                        {getMoodEmoji(latestMoodState.data.mood)}
                      </div>
                      <h3
                        className="fw-bold mb-1"
                        style={{ color: getMoodColor(latestMoodState.data.mood) }}
                      >
                        {latestMoodState.data.mood}
                      </h3>
                      <span className="badge rounded-pill bg-white bg-opacity-10 text-white px-3 py-1">
                        Intensity Level: {latestMoodState.data.intensity} / 10
                      </span>
                    </div>

                    {/* Mood Intensity Meter */}
                    <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: "0.83rem" }}>
                        <span className="text-muted d-flex align-items-center gap-1">
                          <FiSliders /> Intensity Meter
                        </span>
                        <span className="fw-semibold text-white">{latestMoodState.data.intensity} / 10</span>
                      </div>
                      <div className="progress" style={{ height: "6px", background: "rgba(255, 255, 255, 0.1)" }}>
                        <div
                          className="progress-bar rounded"
                          role="progressbar"
                          style={{
                            width: `${(latestMoodState.data.intensity / 10) * 100}%`,
                            background: getMoodColor(latestMoodState.data.mood),
                          }}
                          aria-valuenow={latestMoodState.data.intensity}
                          aria-valuemin="1"
                          aria-valuemax="10"
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                        <FiTag me={1} /> Primary Reason
                      </div>
                      <div className="fw-bold text-white fs-6">
                        {latestMoodState.data.reason}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                        <FiFileText me={1} /> Personal Notes
                      </div>
                      <p className="mb-0 text-white-50" style={{ fontSize: "0.9rem", fontStyle: latestMoodState.data.notes ? "normal" : "italic" }}>
                        {latestMoodState.data.notes ? latestMoodState.data.notes : "No additional notes provided."}
                      </p>
                    </div>

                    {/* Date & Time Footer Meta - High Contrast */}
                    <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", color: "#93C5FD", fontWeight: 500 }}>
                        <FiCalendar style={{ color: "#60A5FA" }} />
                        <span>{latestMoodState.data.date}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", color: "#C4B5FD", fontWeight: 500 }}>
                        <FiClock style={{ color: "#A78BFA" }} />
                        <span>{latestMoodState.data.time}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-5 px-3">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <FiSmile size={48} className="text-muted" />
                    </div>
                    <h5 className="text-white fw-bold mb-2">No Mood Logged Today</h5>
                    <p className="text-muted mb-0 mx-auto" style={{ maxWidth: "280px", fontSize: "0.88rem" }}>
                      You haven't recorded your mood today. Select an option from the form on the left to track how you're feeling!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendation Card */}
            <AIMoodRecommendationCard latestMood={latestMoodState.data} />
          </div>
        </div>
      </main>

      {/* Facial Emotion Analysis Modal */}
      <FacialEmotionAnalysisModal
        isOpen={facialModalOpen}
        onClose={() => setFacialModalOpen(false)}
        onUseMood={handleUseMoodFromAI}
        selectedMood={selectedMood}
        role="student"
      />

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

export default StudentMoodTracker;
