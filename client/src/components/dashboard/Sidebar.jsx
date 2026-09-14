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
  FiX,
  FiUsers,
  FiHeart,
  FiBarChart2,
  FiCompass,
  FiCheckSquare,
  FiLayers,
  FiSun,
  FiActivity
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../Logo";
import SeniorMedicationReminderManager from "../senior/SeniorMedicationReminderManager";

// Student Dashboard Navigation Items
const studentNavItems = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/student/dashboard" },
  { id: "checkin", label: "Daily Check-in", icon: FiCheckSquare, path: "/student/checkin" },
  { id: "mood-tracker", label: "Mood Tracker", icon: FiSmile, path: "/student/mood-tracker" },
  { id: "journal", label: "Journal", icon: FiBookOpen, path: "/student/journal" },
  { id: "cognitive-games", label: "🧠 Cognitive Games", icon: FiLayers, path: "/student/cognitive-games" },
  { id: "memory-exercises", label: "🎯 Memory Exercises", icon: FiCpu, path: "/student/memory-exercises" },
  { id: "ai-companion", label: "AI Recommendations", icon: FiCpu, path: "/student/ai-companion" },
  { id: "study-planner", label: "Study Planner", icon: FiCalendar, path: "/student/study-planner" },
  { id: "goals", label: "Goals", icon: FiTarget, path: "/student/goals" },
  { id: "focus-timer", label: "Focus Session", icon: FiClock, path: "/student/focus-timer" },
  { id: "progress", label: "Progress", icon: FiTrendingUp, path: "/student/progress" },
  { id: "notifications", label: "Notifications", icon: FiBell, path: "/student/notifications" },
  { id: "profile", label: "Profile", icon: FiUser, path: "/student/profile", hasSeparatorBefore: true },
  { id: "settings", label: "Settings", icon: FiSettings, path: "/student/settings" },
];

// Parent Dashboard Navigation Items
const parentNavItems = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/parent/dashboard" },
  { id: "children", label: "Children", icon: FiUsers, path: "/parent/children" },
  { id: "check-in", label: "Daily Check-in", icon: FiCheckSquare, path: "/parent/check-in" },
  { id: "mood-tracker", label: "Mood & Wellbeing", icon: FiHeart, path: "/parent/mood-tracker" },
  { id: "ai-companion", label: "Parenting AI", icon: FiCpu, path: "/parent/ai-companion" },
  { id: "insights", label: "Insights", icon: FiBarChart2, path: "/parent/insights" },
  { id: "notifications", label: "Notifications", icon: FiBell, path: "/parent/notifications" },
  { id: "journal", label: "Parent Journal", icon: FiBookOpen, path: "/parent/journal" },
  { id: "guidance", label: "Parenting Guidance", icon: FiCompass, path: "/parent/guidance" },
  { id: "profile", label: "Profile", icon: FiUser, path: "/parent/profile", hasSeparatorBefore: true },
  { id: "settings", label: "Settings", icon: FiSettings, path: "/parent/settings" },
];

// Senior Citizen Dashboard Navigation Items
const seniorNavItems = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/senior/dashboard" },
  { id: "daily-checkin", label: "Daily Check-in", icon: FiCheckSquare, path: "/senior/daily-checkin" },
  { id: "mood-tracker", label: "Mood & Wellbeing", icon: FiHeart, path: "/senior/mood" },
  { id: "health-activity", label: "Health & Activity", icon: FiActivity, path: "/senior/health-activity" },
  { id: "ai-companion", label: "AI Companion", icon: FiCpu, path: "/senior/ai-companion" },
  { id: "medications", label: "Medication & Reminders", icon: FiClock, path: "/senior/medications" },
  { id: "journal", label: "Journal", icon: FiBookOpen, path: "/senior/journal" },
  { id: "family-emergency", label: "Family & Emergency", icon: FiUsers, path: "/senior/family-emergency" },
  { id: "progress", label: "Progress & Insights", icon: FiTrendingUp, path: "/senior/progress" },
  { id: "notifications", label: "Notifications", icon: FiBell, path: "/senior/notifications" },
  { id: "profile", label: "Profile", icon: FiUser, path: "/senior/profile", hasSeparatorBefore: true },
  { id: "settings", label: "Settings", icon: FiSettings, path: "/senior/settings" },
];

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine user role and corresponding sidebar navigation
  let isSenior = false;
  let isParent = false;
  try {
    const userStr = localStorage.getItem("neurosync_current_user");
    if (userStr) {
      const u = JSON.parse(userStr);
      const roleClean = (u.role || "").trim().toLowerCase();
      if (roleClean === "senior citizen" || roleClean === "senior") {
        isSenior = true;
      } else if (roleClean === "parent") {
        isParent = true;
      }
    }
  } catch (e) {
    console.error("Error parsing user role in Sidebar:", e);
  }

  // Also fallback to URL path check
  if (location.pathname.startsWith("/senior")) {
    isSenior = true;
    isParent = false;
  } else if (location.pathname.startsWith("/parent")) {
    isParent = true;
    isSenior = false;
  }

  const currentNavItems = isSenior 
    ? seniorNavItems 
    : isParent 
    ? parentNavItems 
    : studentNavItems;

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

    const handleUpdateEvent = () => fetchUnreadCount();
    window.addEventListener("neurosync_unread_notifications_updated", handleUpdateEvent);

    return () => {
      window.removeEventListener("neurosync_unread_notifications_updated", handleUpdateEvent);
    };
  }, [activeTab, location.pathname]);

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
            <Logo />
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
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = 
                  (activeTab && activeTab === item.id) || 
                  location.pathname === item.path;
                const showBadge = item.id === "notifications" && unreadCount > 0;

                return (
                  <React.Fragment key={item.id}>
                    {item.hasSeparatorBefore && (
                      <li className="my-2 border-top border-secondary border-opacity-25" style={{ listStyle: "none" }} />
                    )}
                    <li className={`ns-nav-item ${isActive ? "active" : ""}`}>
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
                  </React.Fragment>
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

      <SeniorMedicationReminderManager />
    </>
  );
}

export default Sidebar;
