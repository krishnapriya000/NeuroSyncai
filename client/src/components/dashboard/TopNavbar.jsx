import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiMenu, FiUser, FiSettings, FiLogOut, FiChevronDown, FiSun, FiMoon, FiX } from "react-icons/fi";

const STUDENT_SEARCH_ITEMS = [
  { id: "dash", title: "Student Dashboard", category: "Core", path: "/student/dashboard", keywords: ["dashboard", "home", "overview", "main", "summary"], icon: "📊" },
  { id: "neuroplan", title: "NeuroPlan Daily AI", category: "AI Tools", path: "/neuroplan", keywords: ["neuroplan", "plan", "schedule", "ai planner", "tasks", "routine"], icon: "⚡" },
  { id: "checkin", title: "Daily Check-in Survey", category: "Wellbeing", path: "/student/checkin", keywords: ["checkin", "check-in", "survey", "feeling", "mood", "sleep", "stress"], icon: "📋" },
  { id: "mood", title: "Mood Tracker & History", category: "Wellbeing", path: "/student/mood", keywords: ["mood", "tracker", "emotions", "history", "analytics"], icon: "😊" },
  { id: "games", title: "Cognitive Games & Attention Challenge", category: "Training", path: "/student/games", keywords: ["games", "cognitive", "attention", "focus", "challenge", "brain"], icon: "🎮" },
  { id: "memory", title: "Memory Exercises", category: "Training", path: "/student/memory", keywords: ["memory", "exercises", "cards", "recall", "brain"], icon: "🧠" },
  { id: "study", title: "Study Planner & Tasks", category: "Learning", path: "/student/study-planner", keywords: ["study", "planner", "tasks", "todo", "exams", "assignments"], icon: "📚" },
  { id: "focus", title: "Focus Sessions (Pomodoro)", category: "Focus", path: "/student/focus", keywords: ["focus", "timer", "pomodoro", "session", "deep work", "stopwatch"], icon: "⏱️" },
  { id: "goals", title: "Goals & Targets", category: "Planning", path: "/student/goals", keywords: ["goals", "targets", "milestones", "objectives", "progress"], icon: "🎯" },
  { id: "ai", title: "AI Companion Chat", category: "AI Tools", path: "/student/ai-companion", keywords: ["ai", "companion", "chat", "assistant", "bot", "talk"], icon: "🤖" },
  { id: "journal", title: "Reflective Journal & Sticky Notes", category: "Wellbeing", path: "/student/journal", keywords: ["journal", "diary", "notes", "sticky notes", "thoughts", "writing"], icon: "📖" },
  { id: "profile", title: "Profile & Account Settings", category: "Account", path: "/student/profile", keywords: ["profile", "settings", "account", "user", "password", "theme"], icon: "👤" },
  { id: "notifications", title: "Notifications & Alerts", category: "System", path: "/student/notifications", keywords: ["notifications", "alerts", "messages", "unread"], icon: "🔔" }
];

function TopNavbar({ studentName: propStudentName, toggleSidebar }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [recentUnread, setRecentUnread] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Theme State ("dark" or "light")
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("neurosync_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    localStorage.setItem("neurosync_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Retrieve logged-in user details from localStorage
  const getLoggedUser = () => {
    try {
      const stored = localStorage.getItem("neurosync_current_user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return null;
  };

  const loggedUser = getLoggedUser();
  
  // Resolve user full name
  const displayName = (propStudentName && propStudentName !== "Alex Morgan" && propStudentName !== "Student")
    ? propStudentName
    : (loggedUser?.fullName || loggedUser?.name || propStudentName || "User");

  const displayRole = loggedUser?.role || "Student";
  const userInitial = displayName ? displayName.trim().charAt(0).toUpperCase() : "U";

  useEffect(() => {
    const fetchTopNavNotifications = async () => {
      const token = localStorage.getItem("neurosync_token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/notifications?filter=Unread&limit=4", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setRecentUnread(data.data || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("TopNavbar notification fetch error:", err);
      }
    };

    fetchTopNavNotifications();
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("neurosync_current_user");
    localStorage.removeItem("neurosync_token");
    navigate("/login");
  };

  // Filter Search Items
  const filteredResults = searchQuery.trim() === ""
    ? STUDENT_SEARCH_ITEMS
    : STUDENT_SEARCH_ITEMS.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(q))
        );
      });

  return (
    <header className="ns-topbar">
      {/* Left: Mobile Menu Toggle & Greeting */}
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn p-1 d-lg-none border-0" 
          style={{ color: theme === "light" ? "#0F172A" : "#FFFFFF" }}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FiMenu size={24} />
        </button>
        <div>
          <h2 className="mb-0 fw-bold fs-5 d-flex align-items-center gap-2" style={{ color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>
            Welcome back, <span className="text-transparent bg-clip-text" style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{displayName}</span> 👋
          </h2>
          <p className="mb-0 d-none d-md-block" style={{ fontSize: "0.8rem", color: theme === "light" ? "#64748B" : "#94A3B8" }}>
            Here is your cognitive & emotional summary for today.
          </p>
        </div>
      </div>

      {/* Center: Interactive Search Bar */}
      <div className="ns-search-box position-relative d-none d-sm-block">
        <FiSearch className="ns-search-icon" />
        <input 
          ref={searchInputRef}
          type="text" 
          className="ns-search-input" 
          placeholder="Search study topics, tasks, AI notes... (⌘K)" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
        />
        {searchQuery ? (
          <button
            type="button"
            className="btn btn-sm p-0 border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted"
            style={{ fontSize: "0.8rem", cursor: "pointer" }}
            onClick={() => {
              setSearchQuery("");
              setIsSearchOpen(false);
            }}
            title="Clear Search"
          >
            <FiX size={15} />
          </button>
        ) : (
          <span className="ns-search-kbd">⌘K</span>
        )}

        {/* Live Search Modal / Results Dropdown */}
        {isSearchOpen && (
          <>
            {/* Backdrop click listener */}
            <div 
              className="position-fixed"
              style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
              onClick={() => setIsSearchOpen(false)}
            />

            <div 
              className="position-absolute start-0 mt-2 p-2 rounded-4 shadow-lg"
              style={{
                width: "360px",
                maxHeight: "380px",
                background: theme === "light" ? "#FFFFFF" : "#0F172A",
                border: theme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                color: theme === "light" ? "#0F172A" : "#FFFFFF",
                boxShadow: theme === "light" ? "0 12px 36px rgba(0, 0, 0, 0.15)" : "0 12px 36px rgba(0, 0, 0, 0.6)",
                zIndex: 1050,
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: theme === "light" ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                <span className="extra-small fw-bold text-uppercase tracking-wider" style={{ color: theme === "light" ? "#64748B" : "#94A3B8", fontSize: "0.72rem" }}>
                  {searchQuery.trim() ? `Search Results (${filteredResults.length})` : "Quick Navigation & Features"}
                </span>
                <span className="badge bg-primary bg-opacity-15 text-primary extra-small px-2 py-0.5 rounded-pill" style={{ fontSize: "0.7rem" }}>⌘K Shortcut</span>
              </div>

              <div className="p-1 overflow-y-auto" style={{ maxHeight: "310px" }}>
                {filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-100 btn text-start p-2.5 rounded-3 d-flex align-items-center justify-content-between border-0 transition-all mb-1"
                      style={{
                        background: "transparent",
                        color: theme === "light" ? "#0F172A" : "#F8FAFC",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = theme === "light" ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        navigate(item.path);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                        <span className="fs-5 flex-shrink-0">{item.icon}</span>
                        <div className="overflow-hidden">
                          <div className="fw-semibold text-truncate" style={{ fontSize: "0.86rem", color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>
                            {item.title}
                          </div>
                          <div className="extra-small text-truncate" style={{ fontSize: "0.72rem", color: theme === "light" ? "#64748B" : "#94A3B8" }}>
                            {item.path}
                          </div>
                        </div>
                      </div>
                      <span className="badge rounded-pill extra-small px-2 py-1 ms-2 flex-shrink-0" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.25)", fontSize: "0.68rem" }}>
                        {item.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted" style={{ fontSize: "0.85rem" }}>
                    No matching features for "<strong>{searchQuery}</strong>".
                    <div className="mt-1 extra-small opacity-75" style={{ fontSize: "0.75rem" }}>Try searching "games", "journal", "focus", or "ai".</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions & User Profile Dropdown */}
      <div className="d-flex align-items-center gap-2 gap-sm-3 position-relative">
        {/* Theme Mode Toggle Button */}
        <button
          className="btn rounded-circle p-2 d-flex align-items-center justify-content-center border-0 position-relative transition-all shadow-sm"
          style={{ 
            width: "42px", 
            height: "42px", 
            background: theme === "light" ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)", 
            border: theme === "light" ? "1px solid #CBD5E1" : "1px solid rgba(255, 255, 255, 0.12)",
            color: theme === "light" ? "#0F172A" : "#FFFFFF" 
          }}
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <FiSun size={18} className="text-warning" /> : <FiMoon size={18} className="text-primary" />}
        </button>

        {/* Notifications Icon Button */}
        <div className="position-relative">
          <button 
            className="btn rounded-circle p-2 d-flex align-items-center justify-content-center border-0 position-relative transition-all shadow-sm"
            style={{ 
              width: "42px", 
              height: "42px", 
              background: theme === "light" ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)", 
              border: theme === "light" ? "1px solid #CBD5E1" : "1px solid rgba(255, 255, 255, 0.12)",
              color: theme === "light" ? "#334155" : "#FFFFFF" 
            }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <FiBell size={18} style={{ color: theme === "light" ? "#334155" : "#FFFFFF" }} />
            {unreadCount > 0 && (
              <span 
                className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border rounded-circle"
                style={{ width: "10px", height: "10px", borderColor: theme === "light" ? "#FFFFFF" : "#0F172A" }}
              />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div 
              className="position-absolute end-0 mt-2 p-3 rounded-4 shadow-lg"
              style={{
                width: "320px",
                background: theme === "light" ? "#FFFFFF" : "#0F172A",
                border: theme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                color: theme === "light" ? "#0F172A" : "#FFFFFF",
                boxShadow: theme === "light" ? "0 10px 30px rgba(0, 0, 0, 0.12)" : "0 10px 30px rgba(0, 0, 0, 0.5)",
                zIndex: 1050
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0 fs-6" style={{ color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>Notifications</h6>
                <span className="badge bg-primary rounded-pill">{unreadCount} New</span>
              </div>
              <div className="d-flex flex-column gap-2 mb-2" style={{ fontSize: "0.83rem", maxHeight: "240px", overflowY: "auto" }}>
                {recentUnread.length > 0 ? (
                  recentUnread.map((item) => (
                    <div 
                      key={item._id} 
                      className="p-2.5 rounded-3 cursor-pointer transition-all"
                      style={{ 
                        cursor: "pointer",
                        background: theme === "light" ? "#F8FAFC" : "rgba(255, 255, 255, 0.08)",
                        border: theme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)"
                      }}
                      onClick={() => {
                        setShowNotifications(false);
                        if (item.link) navigate(item.link);
                        else navigate("/student/notifications");
                      }}
                    >
                      <div className="fw-semibold text-truncate mb-0.5" style={{ color: theme === "light" ? "#0F172A" : "#F8FAFC" }}>{item.title}</div>
                      <div className="text-truncate" style={{ fontSize: "0.78rem", color: theme === "light" ? "#475569" : "#CBD5E1" }}>{item.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center" style={{ fontSize: "0.8rem", color: theme === "light" ? "#64748b" : "#94a3b8" }}>
                    No unread notifications right now.
                  </div>
                )}
              </div>
              <button
                className="btn btn-sm btn-outline-primary w-100 rounded-pill mt-1 fw-medium"
                style={{ fontSize: "0.78rem" }}
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/student/notifications");
                }}
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="position-relative">
          <button 
            className="btn p-1 d-flex align-items-center gap-2 border-0 bg-transparent"
            style={{ color: theme === "light" ? "#0F172A" : "#FFFFFF" }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                border: "2px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              {userInitial}
            </div>
            <div className="d-none d-md-block text-start">
              <div className="fw-semibold lh-1" style={{ fontSize: "0.9rem", color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>{displayName}</div>
              <div className="text-capitalize" style={{ fontSize: "0.75rem", color: theme === "light" ? "#475569" : "#94A3B8" }}>{displayRole} Profile</div>
            </div>
            <FiChevronDown style={{ color: theme === "light" ? "#64748B" : "#94A3B8" }} className="d-none d-md-block" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div 
              className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg"
              style={{
                width: "220px",
                background: theme === "light" ? "#FFFFFF" : "#0F172A",
                border: theme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                color: theme === "light" ? "#0F172A" : "#FFFFFF",
                boxShadow: theme === "light" ? "0 10px 30px rgba(0, 0, 0, 0.12)" : "0 10px 30px rgba(0, 0, 0, 0.5)",
                zIndex: 1050
              }}
            >
              <div className="p-2 border-bottom" style={{ borderColor: theme === "light" ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
                <div className="fw-bold" style={{ color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>{displayName}</div>
                <span className="badge bg-primary text-white mt-1 text-capitalize">{displayRole}</span>
              </div>
              <div className="d-flex flex-column gap-1 mt-2">
                <button 
                  className="btn text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2 fw-medium" 
                  style={{ fontSize: "0.88rem", color: theme === "light" ? "#334155" : "#CBD5E1" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/student/profile");
                  }}
                >
                  <FiUser /> View Profile
                </button>
                <button 
                  className="btn text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2 fw-medium" 
                  style={{ fontSize: "0.88rem", color: theme === "light" ? "#334155" : "#CBD5E1" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/student/settings");
                  }}
                >
                  <FiSettings /> Account Settings
                </button>
                <button 
                  className="btn text-danger text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2 mt-1 fw-medium" 
                  style={{ fontSize: "0.88rem" }} 
                  onClick={handleLogout}
                >
                  <FiLogOut /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
