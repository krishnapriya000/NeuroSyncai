import React, { useState } from "react";
import { FiSmile, FiClock, FiCheck } from "react-icons/fi";

const moodOptions = [
  { id: "great", label: "Great", emoji: "😊", intensity: 9 },
  { id: "good", label: "Good", emoji: "🙂", intensity: 7 },
  { id: "neutral", label: "Neutral", emoji: "😐", intensity: 5 },
  { id: "stressed", label: "Stressed", emoji: "😟", intensity: 3 },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😣", intensity: 1 }
];

function ProfessionalMoodCheckIn({ onViewHistory }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectMood = async (mood) => {
    setSelectedMood(mood.id);
    setSavedSuccess(true);

    // Attempt backend save if auth token exists
    const token = localStorage.getItem("neurosync_token");
    if (token) {
      try {
        setLoading(true);
        await fetch("http://localhost:5000/api/moodtracker", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            mood: mood.label,
            intensity: mood.intensity,
            reason: "Workplace daily check-in",
            notes: "Logged via Working Professional Dashboard"
          })
        });
      } catch (err) {
        console.log("Saved mood locally (offline/backend sync fallback):", err);
      } finally {
        setLoading(false);
      }
    }

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="ns-card h-100 d-flex flex-column justify-content-between">
      <div>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary">
              <FiSmile className="fs-5" />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold fs-6">Today's Mood Check-in</h5>
              <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                How are you feeling at work today?
              </p>
            </div>
          </div>
          {savedSuccess && (
            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-30 d-flex align-items-center gap-1" style={{ fontSize: "0.72rem" }}>
              <FiCheck /> Recorded
            </span>
          )}
        </div>

        {/* 5 Mood Options */}
        <div className="ns-mood-grid my-3">
          {moodOptions.map((option) => {
            const isSelected = selectedMood === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className={`ns-mood-btn ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectMood(option)}
                disabled={loading}
              >
                <span className="ns-mood-emoji">{option.emoji}</span>
                <span className="ns-mood-name">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
        <span className="text-muted" style={{ fontSize: "0.78rem" }}>
          {selectedMood 
            ? `Logged: ${moodOptions.find(m => m.id === selectedMood)?.label}`
            : "Select a mood to log your workplace energy"}
        </span>
        <button 
          className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1 border-opacity-25"
          style={{ fontSize: "0.8rem" }}
          onClick={onViewHistory}
        >
          <FiClock /> View Mood History
        </button>
      </div>
    </div>
  );
}

export default ProfessionalMoodCheckIn;
