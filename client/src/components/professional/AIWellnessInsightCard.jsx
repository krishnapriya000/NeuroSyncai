import React from "react";
import { FiCpu, FiArrowRight, FiZap } from "react-icons/fi";

function AIWellnessInsightCard({ onViewRecommendations }) {
  return (
    <div className="ns-card h-100 ns-ai-card p-4 d-flex flex-column justify-content-between position-relative overflow-hidden">
      {/* Background glow decoration */}
      <div 
        className="position-absolute" 
        style={{ 
          top: "-30px", 
          right: "-30px", 
          width: "140px", 
          height: "140px", 
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)", 
          pointerEvents: "none" 
        }} 
      />

      <div>
        {/* Title */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="ns-ai-avatar-orb" style={{ width: "42px", height: "42px", borderRadius: "12px", fontSize: "1.2rem" }}>
              <FiCpu />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold fs-6 d-flex align-items-center gap-2">
                AI Wellness Insight <FiZap className="text-warning" style={{ fontSize: "0.9rem" }} />
              </h5>
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>Cognitive & Productivity AI Assistant</span>
            </div>
          </div>
          <span className="badge bg-primary bg-opacity-25 text-blue-300 border border-primary border-opacity-30 rounded-pill px-2.5 py-1" style={{ fontSize: "0.7rem" }}>
            Updated Today
          </span>
        </div>

        {/* Dynamic Insight Content */}
        <div className="p-3 rounded-4 bg-dark bg-opacity-40 border border-secondary border-opacity-25 my-2">
          <p className="text-light mb-0" style={{ fontSize: "0.9rem", lineHeight: "1.55" }}>
            "Your stress levels have been lower than your weekly average. Your focus time has also improved. Consider maintaining regular breaks to avoid fatigue."
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 d-flex align-items-center justify-content-between">
        <span className="text-muted extra-small" style={{ fontSize: "0.72rem" }}>
          * AI-assisted wellness & workplace productivity analysis. Not a medical diagnosis.
        </span>
        <button
          className="btn btn-link text-info text-decoration-none p-0 fw-semibold d-flex align-items-center gap-1"
          style={{ fontSize: "0.85rem" }}
          onClick={onViewRecommendations}
        >
          View Recommendations <FiArrowRight />
        </button>
      </div>
    </div>
  );
}

export default AIWellnessInsightCard;
