import React from "react";
import { FiMessageSquare, FiCalendar } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

function HeroWelcomeCard({ studentName = "Alex", onTalkClick }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="ns-card ns-hero-card p-4 mb-4">
      <div className="row align-items-center">
        <div className="col-lg-8">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="ns-badge-date">
              <FiCalendar className="text-primary" />
              {currentDate}
            </span>
            <span className="badge rounded-pill bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-2 py-1" style={{ fontSize: "0.75rem" }}>
              <HiSparkles className="me-1" /> Cognitive State: Optimal
            </span>
          </div>

          <h2 className="ns-hero-title text-white">
            Welcome back, {studentName}! 🚀
          </h2>

          <p className="ns-hero-quote mb-4">
            "The secret of getting ahead is getting started. Every study session builds your neural mastery."
          </p>

          <button 
            type="button"
            className="ns-btn-primary"
            onClick={onTalkClick}
          >
            <FiMessageSquare className="fs-5" />
            <span>Talk to NeuroSync AI</span>
          </button>
        </div>

        <div className="col-lg-4 d-none d-lg-flex justify-content-end position-relative">
          <div 
            className="rounded-4 p-4 d-flex flex-column align-items-center justify-content-center text-center"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              minWidth: "220px"
            }}
          >
            <div className="display-6 mb-2">🧠</div>
            <div className="fw-bold text-white fs-6">Focus Readiness</div>
            <div className="text-primary fw-extrabold display-6">94%</div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>Based on recent mood & sleep</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroWelcomeCard;
