import React, { useState } from "react";
import { FiClock, FiPlay, FiCheckCircle, FiShield } from "react-icons/fi";

function UpcomingFocusSessionCard() {
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleToggleSession = () => {
    setIsSessionActive(!isSessionActive);
  };

  return (
    <div className="ns-card h-100 d-flex flex-column justify-content-between">
      <div>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-purple-500 bg-opacity-25 text-purple-400" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}>
              <FiClock className="fs-5" />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold fs-6">Upcoming Focus Session</h5>
              <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                Workplace productivity block
              </p>
            </div>
          </div>
          <span className="badge bg-purple bg-opacity-25 text-purple-300 border border-purple-400 border-opacity-30 rounded-pill px-3 py-1" style={{ fontSize: "0.72rem", background: "rgba(139, 92, 246, 0.15)", color: "#c084fc", border: "1px solid rgba(192, 132, 252, 0.3)" }}>
            7:00 PM
          </span>
        </div>

        {/* Content Box */}
        <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 my-2 position-relative overflow-hidden">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-bold text-white fs-6 d-flex align-items-center gap-2">
                <FiShield className="text-primary" /> Deep Work Session
              </div>
              <div className="text-muted mt-1" style={{ fontSize: "0.83rem" }}>
                90 min · No interruptions
              </div>
            </div>
            <div className="text-end">
              <span className="badge bg-dark bg-opacity-75 text-light border border-secondary border-opacity-30 px-2 py-1" style={{ fontSize: "0.75rem" }}>
                High Focus
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between" style={{ fontSize: "0.76rem" }}>
            <span className="text-muted">Target: Quarter Strategy Review</span>
            <span className="text-info">Notification Muted</span>
          </div>
        </div>
      </div>

      {/* Button Action */}
      <div className="pt-2">
        <button 
          className={`btn w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
            isSessionActive ? "btn-outline-danger" : "btn-primary"
          }`}
          style={!isSessionActive ? { background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none" } : {}}
          onClick={handleToggleSession}
        >
          {isSessionActive ? (
            <>
              <FiCheckCircle /> Session Active (Click to Pause)
            </>
          ) : (
            <>
              <FiPlay /> Start Focus Session
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default UpcomingFocusSessionCard;
