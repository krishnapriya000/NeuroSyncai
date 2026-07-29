import React from "react";
import { FiCpu, FiMessageSquare } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

function AICompanionCard({ onStartChat }) {
  return (
    <div className="ns-card ns-ai-card p-4 h-100">
      <div className="d-flex align-items-center gap-3">
        <div className="ns-ai-avatar-orb">
          <FiCpu />
        </div>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge rounded-pill bg-purple-500 bg-opacity-25 text-purple-300 border border-purple-500 border-opacity-25 px-2 py-1" style={{ fontSize: "0.72rem", color: "#c084fc", background: "rgba(168, 85, 247, 0.15)", borderColor: "rgba(168, 85, 247, 0.3)" }}>
              <HiSparkles className="me-1" /> Cognitive Companion
            </span>
          </div>
          <h5 className="text-white fw-bold mb-1 fs-5">
            Need help with studying or feeling stressed?
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.86rem" }}>
            NeuroSync AI provides real-time tutoring, stress management tools, and tailored cognitive exercises.
          </p>
        </div>
      </div>

      <div className="mt-3 mt-md-0 flex-shrink-0">
        <button 
          type="button" 
          className="ns-btn-primary"
          onClick={onStartChat}
        >
          <FiMessageSquare />
          <span>Start Conversation</span>
        </button>
      </div>
    </div>
  );
}

export default AICompanionCard;
