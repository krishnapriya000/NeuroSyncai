import React from "react";
import { 
  FiGrid, 
  FiSmile, 
  FiCpu, 
  FiBookOpen, 
  FiCalendar, 
  FiTarget, 
  FiClock, 
  FiTrendingUp, 
  FiBell, 
  FiSettings, 
  FiLogOut,
  FiX
} from "react-icons/fi";
import { Link } from "react-router-dom";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "mood-tracker", label: "Mood Tracker", icon: FiSmile },
  { id: "ai-companion", label: "AI Companion", icon: FiCpu },
  { id: "journal", label: "Journal", icon: FiBookOpen },
  { id: "study-planner", label: "Study Planner", icon: FiCalendar },
  { id: "goals", label: "Goals", icon: FiTarget },
  { id: "focus-timer", label: "Focus Timer", icon: FiClock },
  { id: "progress", label: "Progress", icon: FiTrendingUp },
  { id: "notifications", label: "Notifications", icon: FiBell, badge: 3 },
  { id: "settings", label: "Settings", icon: FiSettings },
];

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="ns-sidebar-backdrop d-lg-none"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <aside className={`ns-sidebar ${isOpen ? "open" : ""}`}>
        <div>
          {/* Logo & Mobile Close */}
          <div className="d-flex align-items-center justify-content-between mb-4 px-2">
            <Link to="/" className="ns-brand-logo">
              <div className="ns-brand-icon">
                <FiCpu />
              </div>
              <span className="ns-brand-text">NeuroSync</span>
            </Link>
            <button 
              className="btn text-white-50 p-1 d-lg-none"
              onClick={() => setIsOpen(false)}
              aria-label="Close Sidebar"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav>
            <ul className="ns-nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id} className={`ns-nav-item ${isActive ? "active" : ""}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        if (isOpen) setIsOpen(false);
                      }}
                    >
                      <Icon className="ns-nav-icon" />
                      <span className="flex-grow-1">{item.label}</span>
                      {item.badge && (
                        <span className="badge rounded-pill bg-primary px-2 py-1" style={{ fontSize: "0.7rem" }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Bottom Section - Logout */}
        <div className="pt-3 border-top border-secondary border-opacity-25">
          <ul className="ns-nav-list">
            <li className="ns-nav-item">
              <button
                type="button"
                className="ns-logout-btn"
                onClick={() => {
                  alert("Logged out successfully");
                }}
              >
                <FiLogOut className="ns-nav-icon" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
