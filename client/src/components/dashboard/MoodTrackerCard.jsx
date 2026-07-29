import React, { useState } from "react";
import { FiSmile, FiCheckCircle } from "react-icons/fi";

const moods = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "neutral", label: "Neutral", emoji: "😐" },
  { id: "stressed", label: "Stressed", emoji: "😟" },
  { id: "sad", label: "Sad", emoji: "😢" },
];

function MoodTrackerCard() {
  const [selectedMood, setSelectedMood] = useState("calm");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSelect = (moodId) => {
    setSelectedMood(moodId);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
    }, 2500);
  };

  return (
    <div className="ns-card h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <FiSmile className="text-primary fs-5" />
          <h5 className="mb-0 text-white fw-bold fs-6">Today's Mood Tracker</h5>
        </div>
        {savedFeedback && (
          <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 d-flex align-items-center gap-1">
            <FiCheckCircle /> Recorded!
          </span>
        )}
      </div>

      <p className="text-muted mb-3" style={{ fontSize: "0.83rem" }}>
        How are you feeling right now? Select to log your emotional state.
      </p>

      <div className="ns-mood-grid">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              className={`ns-mood-btn ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelect(mood.id)}
            >
              <span className="ns-mood-emoji">{mood.emoji}</span>
              <span className="ns-mood-name">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MoodTrackerCard;
