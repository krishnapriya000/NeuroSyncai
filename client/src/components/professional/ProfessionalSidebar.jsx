import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";
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
  FiX,
  FiZap
} from "react-icons/fi";

const professionalNavSections = [
  {
    title: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: FiGrid },
      { id: "neuroplan", label: "NeuroPlan Planner", icon: FiZap, isFeatured: true },
      { id: "checkin", label: "Daily Check-in", icon: FiCheckSquare },
      { id: "mood", label: "Mood & Stress", icon: FiSmile },
      { id: "balance", label: "Work-Life Balance", icon: FiCompass },
      { id: "focus", label: "Focus Sessions", icon: FiClock },
    ]
  },
  {
    title: "Insights & AI",
    items: [
      { id: "analytics", label: "Analytics & Performance", icon: FiBarChart2 },
      { id: "ai-companion", label: "AI Companion", icon: FiCpu },
    ]
  },
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile", icon: FiUser },
      { id: "settings", label: "Settings", icon: FiSettings },
    ]
  }
];

function ProfessionalSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const navigate = useNavigate();

  let currentUser = null;
  try {
    const userStr = localStorage.getItem("neurosync_current_user");
    if (userStr) {
      currentUser = JSON.parse(userStr);
    }
  } catch (e) {}

  const userName = currentUser?.fullName || currentUser?.name || "Professional User";
  const userInitial = userName ? userName.trim().charAt(0).toUpperCase() : "P";

  const handleNavClick = (id) => {
    if (setActiveTab) {
      setActiveTab(id);
    }
    if (isOpen && setIsOpen) {
      setIsOpen(false);
    }
    if (id === "neuroplan") {
      navigate("/neuroplan");
    } else if (id === "profile" || id === "settings") {
      navigate("/professional/profile");
    } else if (id === "checkin") {
      navigate("/professional/checkin");
    } else if (id === "mood" || id === "mood-stress") {
      navigate("/professional/mood-stress");
    } else if (id === "balance" || id === "work-life-balance") {
      navigate("/professional/work-life-balance");
    } else if (id === "focus" || id === "focus-sessions") {
      navigate("/professional/focus");
    } else if (id === "analytics") {
      navigate("/professional/analytics");
    } else if (id === "ai-companion" || id === "ai-recommendations") {
      navigate("/professional/ai-companion");
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
        <div className="ns-sidebar-content">
          {/* Top Brand Header */}
          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <Logo to="/professional/dashboard" />
            <button
              className="btn text-white-50 p-1 d-lg-none"
              onClick={() => setIsOpen && setIsOpen(false)}
              aria-label="Close Sidebar"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* User Profile Summary Box */}
          <div className="ns-sidebar-user-card">
            <div className="ns-user-avatar-badge" style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" }}>
              {userInitial}
            </div>
            <div className="d-flex flex-column overflow-hidden">
              <span className="text-white fw-bold text-truncate" style={{ fontSize: "0.85rem" }}>
                {userName}
              </span>
              <span className="ns-role-badge ns-role-badge-professional mt-0.5">
                Working Professional
              </span>
            </div>
          </div>

          {/* Nav Content with Scroll */}
          <div className="ns-sidebar-scroll">
            <nav>
              {professionalNavSections.map((section, idx) => (
                <div key={section.title || idx} className="mb-2">
                  <div className="ns-sidebar-section-title">
                    {section.title}
                  </div>
                  <ul className="ns-nav-list">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id || (activeTab === "dashboard" && item.id === "overview");
                      return (
                        <li key={item.id} className={`ns-nav-item ${isActive ? "active" : ""}`}>
                          <button
                            type="button"
                            onClick={() => handleNavClick(item.id)}
                          >
                            <Icon className="ns-nav-icon" />
                            <span className="flex-grow-1 text-truncate">{item.label}</span>
                            {item.isFeatured && (
                              <span className="ns-nav-featured-badge ms-1">
                                AI
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Section - Logout */}
          <div className="pt-3 mt-2 border-top border-secondary border-opacity-25">
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

