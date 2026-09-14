import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiHeart, FiSmile, FiCalendar, FiPlus, FiCheck, FiCamera } from "react-icons/fi";
import SeniorFaceAnalysisModal from "../components/senior/SeniorFaceAnalysisModal";
import "../styles/studentDashboard.css";

function SeniorMoodTracker() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [selectedMood, setSelectedMood] = useState("Calm");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [moodLogs, setMoodLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  const moodOptions = [
    { label: "Happy", emoji: "😊", color: "#34D399", bg: "rgba(16, 185, 129, 0.15)" },
    { label: "Calm", emoji: "🌿", color: "#60A5FA", bg: "rgba(59, 130, 246, 0.15)" },
    { label: "Neutral", emoji: "😐", color: "#FBBF24", bg: "rgba(245, 158, 11, 0.15)" },
    { label: "Sad", emoji: "😔", color: "#A78BFA", bg: "rgba(167, 139, 250, 0.15)" },
    { label: "Stressed", emoji: "😰", color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setSeniorName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchMoodLogs();
  }, []);

  const fetchMoodLogs = async () => {
    setLoadingLogs(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoadingLogs(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/senior/mood?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMoodLogs(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching senior mood logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveMood = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/senior/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          notes: note,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setNote("");
        fetchMoodLogs();
        alert("Mood logged successfully!");
      } else {
        alert(json.message || "Failed to log mood.");
      }
    } catch (err) {
      console.error("Error logging senior mood:", err);
      alert("Cannot connect to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFaceMoodDetected = (detectedMood, detectedNote) => {
    setSelectedMood(detectedMood);
    setNote((prev) => (prev ? `${prev} | ${detectedNote}` : detectedNote));
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="mood-tracker"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={seniorName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(236, 72, 153, 0.15)",
                  color: "#F472B6",
                  border: "1px solid rgba(236, 72, 153, 0.3)",
                }}
              >
                👴 Senior Wellbeing
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-2 mb-1">❤️ Mood & Wellbeing</h1>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Track how you feel throughout the day and observe your emotional trends over time.
            </p>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-outline-info rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2 shadow-sm"
              onClick={() => setIsFaceModalOpen(true)}
              style={{ fontSize: "0.95rem" }}
            >
              <FiCamera className="fs-5" /> <span>📷 Face AI Analysis</span>
            </button>
          </div>
        </div>

        {/* LOG MOOD CARD */}
        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="ns-card p-4 p-md-5">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <h4 className="text-white fw-bold fs-4 mb-0 d-flex align-items-center gap-2">
                  <FiSmile className="text-primary" /> How are you feeling right now?
                </h4>
                <button
                  type="button"
                  className="btn btn-sm btn-dark text-info border border-info border-opacity-30 rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1"
                  onClick={() => setIsFaceModalOpen(true)}
                >
                  <FiCamera /> Detect with Camera
                </button>
              </div>

              <form onSubmit={handleSaveMood}>
                {/* 5 Big Mood Buttons */}
                <div className="row g-2.5 mb-4">
                  {moodOptions.map((m) => {
                    const isSelected = selectedMood === m.label;
                    return (
                      <div key={m.label} className="col-6 col-sm">
                        <button
                          type="button"
                          className="btn p-3 w-100 rounded-4 text-white fw-bold d-flex flex-column align-items-center justify-content-center gap-2 border shadow-sm hover-scale"
                          style={{
                            minHeight: "95px",
                            background: isSelected ? m.bg : "rgba(15, 23, 42, 0.6)",
                            borderColor: isSelected ? m.color : "rgba(255, 255, 255, 0.08)",
                          }}
                          onClick={() => setSelectedMood(m.label)}
                        >
                          <span className="fs-1">{m.emoji}</span>
                          <span style={{ fontSize: "0.95rem", color: isSelected ? m.color : "#fff" }}>
                            {m.label}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <label className="text-white fw-semibold mb-2" style={{ fontSize: "0.95rem" }}>
                    Add a short note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="form-control bg-dark text-white border-secondary border-opacity-25 p-3 rounded-3"
                    placeholder="E.g. Had a peaceful morning walk in the garden..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ fontSize: "0.95rem" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow"
                  style={{ fontSize: "1.05rem" }}
                >
                  {saving ? "Saving Mood..." : "Log Today's Mood"}
                </button>
              </form>

              {/* OBSERVATIONAL WELLNESS NOTICE */}
              <div
                className="p-3 rounded-3 mt-4 border border-info border-opacity-25 text-white-50"
                style={{ background: "rgba(59, 130, 246, 0.08)", fontSize: "0.85rem", lineHeight: "1.5" }}
              >
                🌿 <strong>Observational Wellness Info:</strong> Mood tracking provides personal self-reflection insights. It does not provide medical diagnoses or replace medical consultation.
              </div>
            </div>
          </div>

          {/* MOOD HISTORY & TRENDS */}
          <div className="col-lg-5">
            <div className="ns-card p-4 h-100">
              <h4 className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                <FiCalendar className="text-purple-400" /> Recent Mood History
              </h4>

              {loadingLogs ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                  <p className="text-muted small">Loading history...</p>
                </div>
              ) : moodLogs.length === 0 ? (
                <p className="text-muted small py-3">No mood entries recorded yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2.5">
                  {moodLogs.map((item) => {
                    const option = moodOptions.find((m) => m.label.toLowerCase() === (item.mood || "").toLowerCase()) || {
                      emoji: "😊",
                      color: "#34D399",
                    };

                    return (
                      <div
                        key={item._id}
                        className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 d-flex align-items-center justify-content-between"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="fs-2">{option.emoji}</span>
                          <div>
                            <h5 className="text-white fw-bold fs-6 mb-0">{item.mood}</h5>
                            {item.notes && <p className="text-white-50 small mb-0">{item.notes}</p>}
                          </div>
                        </div>
                        <span className="text-muted small" style={{ minWidth: "70px", textAlign: "right" }}>
                          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SeniorFaceAnalysisModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onMoodDetected={handleFaceMoodDetected}
      />

      <DashboardFooter />
    </div>
  );
}

export default SeniorMoodTracker;
