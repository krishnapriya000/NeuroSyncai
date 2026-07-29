import React, { useState } from "react";
import { 
  FiPlusCircle, 
  FiEdit3, 
  FiTarget, 
  FiClock, 
  FiMessageSquare,
  FiZap,
  FiX
} from "react-icons/fi";

function QuickActionsCard({ onActionSelect }) {
  const [activeModal, setActiveModal] = useState(null);

  const actions = [
    { id: "mood", label: "Add Mood", icon: FiPlusCircle, color: "#ec4899" },
    { id: "journal", label: "Write Journal", icon: FiEdit3, color: "#8b5cf6" },
    { id: "goal", label: "Add Goal", icon: FiTarget, color: "#3b82f6" },
    { id: "timer", label: "Start Focus Timer", icon: FiClock, color: "#10b981" },
    { id: "chat", label: "Open AI Chat", icon: FiMessageSquare, color: "#f59e0b" },
  ];

  const handleAction = (action) => {
    setActiveModal(action.label);
    if (onActionSelect) onActionSelect(action.id);
  };

  return (
    <>
      <div className="ns-card h-100">
        <div className="d-flex align-items-center gap-2 mb-3">
          <FiZap className="text-warning fs-5" />
          <h5 className="mb-0 text-white fw-bold fs-6">Quick Actions</h5>
        </div>

        <div className="ns-quick-actions-grid">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                type="button"
                className="ns-action-btn"
                onClick={() => handleAction(act)}
              >
                <Icon className="ns-action-icon" style={{ color: act.color }} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Action Confirmation Modal */}
      {activeModal && (
        <div 
          className="position-fixed inset-0 d-flex align-items-center justify-content-center"
          style={{
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 2000
          }}
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="ns-card p-4 text-white text-center"
            style={{ width: "90%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">{activeModal}</h5>
              <button className="btn text-white-50 p-0 border-0" onClick={() => setActiveModal(null)}>
                <FiX size={20} />
              </button>
            </div>
            <p className="text-muted mb-4" style={{ fontSize: "0.88rem" }}>
              Quick action triggered for <strong>"{activeModal}"</strong>. Module ready to interact.
            </p>
            <button className="ns-btn-primary w-100 justify-content-center" onClick={() => setActiveModal(null)}>
              Proceed to Action
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickActionsCard;
