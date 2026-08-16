import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiCheckSquare,
  FiSmile,
  FiCompass,
  FiClock,
  FiBarChart2,
  FiCpu,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX
} from "react-icons/fi";

const workspaceNavItems = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "checkin", label: "Daily Check-in", icon: FiCheckSquare },
  { id: "mood", label: "Mood & Stress", icon: FiSmile },
  { id: "balance", label: "Work-Life Balance", icon: FiCompass },
  { id: "focus", label: "Focus Sessions", icon: FiClock },
  { id: "analytics", label: "Analytics", icon: FiBarChart2 },
  { id: "ai-recommendations", label: "AI Recommendations", icon: FiCpu },
];

const personalNavItems = [
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "settings", label: "Settings", icon: FiSettings },
];

function ProfessionalSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const handleNavClick = (id) => {
    if (setActiveTab) {
      setActiveTab(id);
    }
    if (isOpen && setIsOpen) {
      setIsOpen(false);
    }
    if (id === "profile" || id === "settings") {
      navigate("/professional/profile");
    } else if (id === "checkin") {
      navigate("/professional/checkin");
    } else if (id === "mood" || id === "mood-stress") {
      navigate("/professional/mood-stress");
    } else if (id === "balance" || id === "work-life-balance") {
      navigate("/professional/work-life-balance");
    } else if (id === "overview") {
      navigate("/professional/dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("neurosync_token");
    localStorage.removeItem("neurosync_current_user");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="ns-sidebar-backdrop d-lg-none"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <aside className={`ns-sidebar ${isOpen ? "open" : ""}`}>
        <div className="d-flex flex-column h-100 justify-content-between">
          <div>
            {/* Top Brand Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 px-2">
              <Link to="/professional/dashboard" className="d-flex align-items-center gap-2 text-decoration-none">
                <div className="ns-brand-icon">
                  <FiCpu />
                </div>
                <div className="d-flex flex-column">
                  <span className="ns-brand-text fw-bold fs-5 lh-1">NeuroSync</span>
                  <span className="text-secondary extra-small fw-medium mt-1" style={{ fontSize: "0.7rem", color: "#94A3B8" }}>
                    For Working Professionals
                  </span>
                </div>
              </Link>
              <button 
                className="btn text-white-50 p-1 d-lg-none"
                onClick={() => setIsOpen && setIsOpen(false)}
                aria-label="Close Sidebar"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* WORKSPACE Section */}
            <div className="mb-3">
              <div className="px-3 mb-2 text-uppercase fw-bold" style={{ fontSize: "0.72rem", letterSpacing: "0.08em", color: "#CBD5E1" }}>
                WORKSPACE
              </div>
              <nav>
                <ul className="ns-nav-list">
                  {workspaceNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id || (activeTab === "dashboard" && item.id === "overview");
                    return (
                      <li key={item.id} className={`ns-nav-item ${isActive ? "active" : ""}`}>
                        <button
                          type="button"
                          onClick={() => handleNavClick(item.id)}
                        >
                          <Icon className="ns-nav-icon" />
                          <span className="flex-grow-1">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* PERSONAL Section */}
            <div className="mb-3">
              <div className="px-3 mb-2 text-uppercase fw-bold" style={{ fontSize: "0.72rem", letterSpacing: "0.08em", color: "#CBD5E1" }}>
                PERSONAL
              </div>
              <nav>
                <ul className="ns-nav-list">
                  {personalNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <li key={item.id} className={`ns-nav-item ${isActive ? "active" : ""}`}>
                        <button
                          type="button"
                          onClick={() => handleNavClick(item.id)}
                        >
                          <Icon className="ns-nav-icon" />
                          <span className="flex-grow-1">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* Bottom Section - Logout */}
          <div className="pt-3 border-top border-secondary border-opacity-25 mt-auto">
            <ul className="ns-nav-list">
              <li className="ns-nav-item">
                <button
                  type="button"
                  className="ns-logout-btn"
                  onClick={handleLogout}
                >
                  <FiLogOut className="ns-nav-icon" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}

export default ProfessionalSidebar;
