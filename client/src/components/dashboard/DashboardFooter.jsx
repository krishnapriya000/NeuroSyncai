import React from "react";

function DashboardFooter() {
  return (
    <footer className="ns-footer">
      <div>
        © 2026 <strong>NeuroSync</strong> | AI Cognitive & Emotional Intelligence Companion
      </div>
      <div className="d-flex align-items-center gap-3">
        <a href="#privacy" className="text-muted text-decoration-none hover-text-white" style={{ fontSize: "0.8rem" }}>
          Privacy Policy
        </a>
        <span>•</span>
        <a href="#terms" className="text-muted text-decoration-none hover-text-white" style={{ fontSize: "0.8rem" }}>
          Terms of Service
        </a>
        <span>•</span>
        <a href="#support" className="text-muted text-decoration-none hover-text-white" style={{ fontSize: "0.8rem" }}>
          Help Center
        </a>
      </div>
    </footer>
  );
}

export default DashboardFooter;
