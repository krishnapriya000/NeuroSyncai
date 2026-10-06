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
  FiActivity,
  FiZap,
  FiAward,
  FiShield,
  FiPhoneCall
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../Logo";
import SeniorMedicationReminderManager from "../senior/SeniorMedicationReminderManager";

// Student Dashboard Navigation Sections
const studentNavSections = [
  {
    title: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/student/dashboard" },
      { id: "neuroplan", label: "NeuroPlan Daily", icon: FiZap, path: "/neuroplan", isFeatured: true },
      { id: "checkin", label: "Daily Check-in", icon: FiCheckSquare, path: "/student/checkin" },
      { id: "mood-tracker", label: "Mood Tracker", icon: FiSmile, path: "/student/mood-tracker" },
    ]
  },
  {
    title: "Learning & Focus",
    items: [
      { id: "cognitive-games", label: "Cognitive Games", icon: FiActivity, path: "/student/cognitive-games" },
      { id: "memory-exercises", label: "Memory Exercises", icon: FiAward, path: "/student/memory-exercises" },
      { id: "study-planner", label: "Study Planner", icon: FiCalendar, path: "/student/study-planner" },
      { id: "focus-timer", label: "Focus Session", icon: FiClock, path: "/student/focus-timer" },
      { id: "goals", label: "Goals & Targets", icon: FiTarget, path: "/student/goals" },
      { id: "journal", label: "Reflective Journal", icon: FiBookOpen, path: "/student/journal" },
    ]
  },
  {
    title: "Insights & AI",
    items: [
      { id: "ai-companion", label: "AI Recommendations", icon: FiCpu, path: "/student/ai-companion" },
      { id: "progress", label: "Analytics & Progress", icon: FiTrendingUp, path: "/student/progress" },
      { id: "notifications", label: "Notifications", icon: FiBell, path: "/student/notifications" },
    ]
  },
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile", icon: FiUser, path: "/student/profile" },
      { id: "settings", label: "Settings", icon: FiSettings, path: "/student/settings" },
    ]
  }
];

// Parent Dashboard Navigation Sections
const parentNavSections = [
  {
    title: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/parent/dashboard" },
      { id: "neuroplan", label: "NeuroPlan Planner", icon: FiZap, path: "/neuroplan", isFeatured: true },
      { id: "children", label: "Children Hub", icon: FiUsers, path: "/parent/children" },
      { id: "check-in", label: "Daily Check-in", icon: FiCheckSquare, path: "/parent/check-in" },
    ]
  },
  {
    title: "Wellbeing & Guidance",
    items: [
      { id: "mood-tracker", label: "Mood & Wellbeing", icon: FiHeart, path: "/parent/mood-tracker" },
      { id: "ai-companion", label: "Parenting AI", icon: FiCpu, path: "/parent/ai-companion" },
      { id: "guidance", label: "Parenting Guidance", icon: FiCompass, path: "/parent/guidance" },
      { id: "journal", label: "Parent Journal", icon: FiBookOpen, path: "/parent/journal" },
    ]
  },
  {
    title: "Analytics",
    items: [
      { id: "insights", label: "Family Insights", icon: FiBarChart2, path: "/parent/insights" },
      { id: "notifications", label: "Notifications", icon: FiBell, path: "/parent/notifications" },
    ]
  },
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile", icon: FiUser, path: "/parent/profile" },
      { id: "settings", label: "Settings", icon: FiSettings, path: "/parent/settings" },
    ]
  }
];

// Senior Citizen Dashboard Navigation Sections
const seniorNavSections = [
  {
    title: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/senior/dashboard" },
      { id: "neuroplan", label: "NeuroPlan Planner", icon: FiZap, path: "/neuroplan", isFeatured: true },
      { id: "daily-checkin", label: "Daily Check-in", icon: FiCheckSquare, path: "/senior/daily-checkin" },
      { id: "mood-tracker", label: "Mood & Wellbeing", icon: FiHeart, path: "/senior/mood" },
    ]
  },
  {
    title: "Health & Care",
    items: [
      { id: "health-activity", label: "Health & Vitality", icon: FiActivity, path: "/senior/health-activity" },
      { id: "medications", label: "Medication Reminders", icon: FiShield, path: "/senior/medications" },
      { id: "ai-companion", label: "Senior AI Companion", icon: FiCpu, path: "/senior/ai-companion" },
      { id: "family-emergency", label: "Family & Emergency", icon: FiPhoneCall, path: "/senior/family-emergency" },
    ]
  },
  {
    title: "Mind & Progress",
    items: [
      { id: "journal", label: "Daily Journal", icon: FiBookOpen, path: "/senior/journal" },
      { id: "progress", label: "Progress & Insights", icon: FiTrendingUp, path: "/senior/progress" },
      { id: "notifications", label: "Notifications", icon: FiBell, path: "/senior/notifications" },
    ]
  },
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile", icon: FiUser, path: "/senior/profile" },
      { id: "settings", label: "Settings", icon: FiSettings, path: "/senior/settings" },
    ]
  }
];

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine user role and corresponding sidebar navigation
  let isSenior = false;
  let isParent = false;
  let currentUser = null;

  try {
    const userStr = localStorage.getItem("neurosync_current_user");
    if (userStr) {
      currentUser = JSON.parse(userStr);
      const roleClean = (currentUser.role || "").trim().toLowerCase();
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

  const currentNavSections = isSenior 
    ? seniorNavSections 
    : isParent 
    ? parentNavSections 
    : studentNavSections;

  const userName = currentUser?.fullName || currentUser?.name || (isSenior ? "Senior User" : isParent ? "Parent User" : "Student User");
  const userInitial = userName ? userName.trim().charAt(0).toUpperCase() : "U";
  const roleBadgeText = isSenior ? "Senior Companion" : isParent ? "Parent Portal" : "Student Portal";
  const roleBadgeClass = isSenior ? "ns-role-badge-senior" : isParent ? "ns-role-badge-parent" : "ns-role-badge-student";

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
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <aside className={`ns-sidebar ${isOpen ? "open" : ""}`}>
        <div className="ns-sidebar-content">
          {/* Logo & Mobile Close Header */}
          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <Logo />
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
            <div className="ns-user-avatar-badge">
              {userInitial}
            </div>
            <div className="d-flex flex-column overflow-hidden">
              <span className="text-white fw-bold text-truncate" style={{ fontSize: "0.85rem" }}>
                {userName}
              </span>
              <span className={`ns-role-badge ${roleBadgeClass} mt-0.5`}>
                {roleBadgeText}
              </span>
            </div>
          </div>

          {/* Nav Content with Scroll */}
          <div className="ns-sidebar-scroll">
            <nav>
              {currentNavSections.map((section, idx) => (
                <div key={section.title || idx} className="mb-2">
                  <div className="ns-sidebar-section-title">
                    {section.title}
                  </div>
                  <ul className="ns-nav-list">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = 
                        (activeTab && activeTab === item.id) || 
                        location.pathname === item.path;
                      const showBadge = item.id === "notifications" && unreadCount > 0;

                      return (
                        <li key={item.id} className={`ns-nav-item ${isActive ? "active" : ""}`}>
                          <button
                            type="button"
                            onClick={() => handleNavClick(item)}
                          >
                            <Icon className="ns-nav-icon" />
                            <span className="flex-grow-1 text-truncate">{item.label}</span>
                            {item.isFeatured && (
                              <span className="ns-nav-featured-badge ms-1">
                                AI
                              </span>
                            )}
                            {showBadge && (
                              <span className="badge rounded-pill bg-primary px-2 py-1 ms-1" style={{ fontSize: "0.68rem" }}>
                                {unreadCount}
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

      <SeniorMedicationReminderManager />
    </>
  );
}

export default Sidebar;

