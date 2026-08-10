import React, { useState } from "react";
import { FiZap, FiClock, FiMoon, FiBookOpen, FiChevronRight, FiCheck } from "react-icons/fi";

const actionsList = [
  { id: "work-hours", title: "Log Work Hours", icon: FiZap, color: "#3B82F6", sub: "Track focus blocks" },
  { id: "log-break", title: "Log Break", icon: FiClock, color: "#10B981", sub: "Rest & recovery" },
  { id: "sleep-tracker", title: "Sleep Tracker", icon: FiMoon, color: "#8B5CF6", sub: "Nightly rest quality" },
  { id: "journal-entry", title: "Add Journal Entry", icon: FiBookOpen, color: "#F59E0B", sub: "Workplace reflections" },
];

function ProfessionalQuickActions({ onAction }) {
  const [activeToast, setActiveToast] = useState(null);

  const handleActionClick = (action) => {
    setActiveToast(action.title);
    if (onAction) {
      onAction(action.id);
    }
    setTimeout(() => {
      setActiveToast(null);
    }, 3000);
  };

  return (
    <div className="ns-card h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0 text-white fw-bold fs-6">Quick Actions</h5>
          {activeToast && (
            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-30 d-flex align-items-center gap-1" style={{ fontSize: "0.72rem" }}>
              <FiCheck /> {activeToast} opened
            </span>
          )}
        </div>

        <div className="d-flex flex-column gap-2">
          {actionsList.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className="w-100 p-2 px-3 rounded-3 text-start d-flex align-items-center justify-content-between border border-secondary border-opacity-25 bg-dark bg-opacity-40 text-white hover-bg-light transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  transition: "all 0.2s ease"
                }}
                onClick={() => handleActionClick(action)}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="p-2 rounded-2 d-flex align-items-center justify-content-center"
                    style={{ background: `${action.color}20`, color: action.color, width: "36px", height: "36px" }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ fontSize: "0.88rem" }}>{action.title}</div>
                    <div className="text-muted" style={{ fontSize: "0.74rem" }}>{action.sub}</div>
                  </div>
                </div>
                <FiChevronRight className="text-muted" style={{ fontSize: "1rem" }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProfessionalQuickActions;
