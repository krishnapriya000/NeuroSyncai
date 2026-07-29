import React from "react";
import { FiTrendingUp } from "react-icons/fi";

function MotivationCard() {
  return (
    <div className="ns-card ns-motivation-card h-100 d-flex flex-column justify-content-center align-items-center">
      <div 
        className="rounded-circle mb-3 d-flex align-items-center justify-content-center text-white"
        style={{
          width: "64px",
          height: "64px",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
        }}
      >
        <FiTrendingUp className="fs-3 text-emerald-400" style={{ color: "#34d399" }} />
      </div>

      <div className="ns-quote-icon">“</div>
      
      <blockquote className="ns-motivation-text mb-3">
        Small progress every day leads to big success.
      </blockquote>

      <div className="text-muted" style={{ fontSize: "0.8rem", letterSpacing: "1px" }}>
        — NEUROSYNC DAILY REFLECTION
      </div>
    </div>
  );
}

export default MotivationCard;
