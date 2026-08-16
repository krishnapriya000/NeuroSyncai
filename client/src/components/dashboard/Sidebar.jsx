import React, { useState, useEffect } from "react";
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
  FiUser,
  FiSettings, 
  FiLogOut,
  FiX
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const navItemsList = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/student/dashboard" },
  { id: "mood-tracker", label: "Mood Tracker", icon: FiSmile, path: "/student/mood-tracker" },
  { id: "ai-companion", label: "AI Companion", icon: FiCpu, path: "/student/ai-companion" },
  { id: "journal", label: "Journal", icon: FiBookOpen, path: "/student/journal" },
  { id: "study-planner", label: "Study Planner", icon: FiCalendar, path: "/student/study-planner" },
  { id: "goals", label: "Goals", icon: FiTarget, path: "/student/goals" },
  { id: "focus-timer", label: "Focus Timer", icon: FiClock, path: "/student/focus-timer" },
  { id: "progress", label: "Progress", icon: FiTrendingUp, path: "/student/progress" },
  { id: "notifications", label: "Notifications", icon: FiBell, path: "/student/notifications" },
  { id: "profile", label: "Profile", icon: FiUser, path: "/student/profile" },
  { id: "settings", label: "Settings", icon: FiSettings, path: "/student/settings" },
];

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("neurosync_token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/notifications/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Sidebar fetch unread count error:", err);
      }
    };

    fetchUnreadCount();
  }, [activeTab]);

  const handleNavClick = (item) => {
    if (setActiveTab) {
      setActiveTab(item.id);
    }
    if (isOpen && setIsOpen) {
      setIsOpen(false);
    }
    if (item.path) {
      navigate(item.path);
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
              {navItemsList.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const showBadge = item.id === "notifications" && unreadCount > 0;
                return (
                  <li key={item.id} className={`ns-nav-item ${isActive ? "active" : ""}`}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item)}
                    >
                      <Icon className="ns-nav-icon" />
                      <span className="flex-grow-1">{item.label}</span>
                      {showBadge && (
                        <span className="badge rounded-pill bg-primary px-2 py-1" style={{ fontSize: "0.7rem" }}>
                          {unreadCount}
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
                onClick={handleLogout}
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
