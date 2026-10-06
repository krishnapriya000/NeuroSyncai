import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiMenu, FiUser, FiSettings, FiLogOut, FiChevronDown, FiBriefcase, FiSun, FiMoon, FiX } from "react-icons/fi";

const PROFESSIONAL_SEARCH_ITEMS = [
  { id: "dash", title: "Professional Dashboard", category: "Core", path: "/professional/dashboard", keywords: ["dashboard", "home", "overview", "summary"], icon: "💼" },
  { id: "focus", title: "Focus Sessions & Pomodoro Timer", category: "Productivity", path: "/professional/focus", keywords: ["focus", "timer", "pomodoro", "work", "deep work", "session"], icon: "⏱️" },
  { id: "mood", title: "Mood & Stress Tracker", category: "Wellbeing", path: "/professional/mood-tracker", keywords: ["mood", "stress", "emotional", "tracker", "checkin"], icon: "😊" },
  { id: "journal", title: "Reflective Journal & Notes", category: "Wellbeing", path: "/professional/journal", keywords: ["journal", "notes", "thoughts", "writing", "diary"], icon: "📖" },
  { id: "insights", title: "Work-Life Balance Insights", category: "Analytics", path: "/professional/insights", keywords: ["insights", "analytics", "balance", "stats", "work-life"], icon: "📈" },
  { id: "profile", title: "Profile & Account Settings", category: "Account", path: "/professional/profile", keywords: ["profile", "settings", "account", "user", "password"], icon: "👤" },
];

function ProfessionalNavbar({ userName = "Professional User", toggleSidebar, onTabChange }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [userPhoto, setUserPhoto] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setDisplayName(userObj.fullName || userObj.name);
        }
        if (userObj.profileImage) {
          setUserPhoto(userObj.profileImage);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
  }, [userName]);

  const handleLogout = () => {
    localStorage.removeItem("neurosync_current_user");
    localStorage.removeItem("neurosync_token");
    navigate("/login");
  };

  // Filter Search Items
  const filteredResults = searchQuery.trim() === ""
    ? PROFESSIONAL_SEARCH_ITEMS
    : PROFESSIONAL_SEARCH_ITEMS.filter((item) => {
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
          className="btn text-white p-1 d-lg-none border-0" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FiMenu size={24} />
        </button>
        <div>
          <h2 className="mb-0 text-white fw-bold fs-5 d-flex align-items-center gap-2">
            Good evening, <span className="text-transparent bg-clip-text" style={{ background: "linear-gradient(135deg, #60A5FA, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{displayName}</span>! 👋
          </h2>
          <p className="mb-0 text-gray-300 d-none d-md-block" style={{ fontSize: "0.85rem", color: "#CBD5E1" }}>
            Let's make today productive, focused and balanced.
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="ns-search-box position-relative d-none d-sm-block">
        <FiSearch className="ns-search-icon" />
        <input 
          ref={searchInputRef}
          type="text" 
          className="ns-search-input" 
          placeholder="Search insights, tasks... (⌘K)" 
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
                    <div className="mt-1 extra-small opacity-75" style={{ fontSize: "0.75rem" }}>Try searching "focus", "insights", "journal", or "mood".</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Notifications & User Profile Menu */}
      <div className="d-flex align-items-center gap-3 position-relative">
        {/* Theme Toggle Switch */}
        <button
          className="btn rounded-circle p-2 d-flex align-items-center justify-content-center border-0 transition-all shadow-sm"
          style={{ 
            width: "42px", 
            height: "42px", 
            background: theme === "light" ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)", 
            border: theme === "light" ? "1px solid #CBD5E1" : "1px solid rgba(255, 255, 255, 0.15)",
            color: theme === "light" ? "#0F172A" : "#FFFFFF"
          }}
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <FiSun size={19} className="text-warning" /> : <FiMoon size={19} className="text-primary" />}
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
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            title="Notifications"
          >
            <FiBell size={18} style={{ color: theme === "light" ? "#334155" : "#FFFFFF" }} />
            <span 
              className="position-absolute top-0 start-100 translate-middle p-1 bg-primary border rounded-circle"
              style={{ width: "10px", height: "10px", borderColor: theme === "light" ? "#FFFFFF" : "#0F172A" }}
            ></span>
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div 
              className="position-absolute end-0 mt-2 p-3 rounded-4 shadow-lg"
              style={{
                width: "310px",
                background: theme === "light" ? "#FFFFFF" : "#0F172A",
                border: theme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                color: theme === "light" ? "#0F172A" : "#FFFFFF",
                boxShadow: theme === "light" ? "0 10px 30px rgba(0, 0, 0, 0.12)" : "0 10px 30px rgba(0, 0, 0, 0.5)",
                zIndex: 1050
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0 fs-6" style={{ color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>Workplace Insights</h6>
                <span className="badge bg-primary rounded-pill">2 New</span>
              </div>
              <div className="d-flex flex-column gap-2" style={{ fontSize: "0.83rem" }}>
                <div 
                  className="p-2 rounded-3"
                  style={{
                    background: theme === "light" ? "#F8FAFC" : "rgba(255, 255, 255, 0.08)",
                    border: theme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <div className="fw-semibold text-info">Focus Milestone Reached</div>
                  <div style={{ fontSize: "0.78rem", color: theme === "light" ? "#475569" : "#CBD5E1" }}>Completed 5 hours of deep focus time today!</div>
                </div>
                <div 
                  className="p-2 rounded-3"
                  style={{
                    background: theme === "light" ? "#F8FAFC" : "rgba(255, 255, 255, 0.05)",
                    border: theme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div className="fw-semibold text-warning">Work-Life Balance Tip</div>
                  <div style={{ fontSize: "0.78rem", color: theme === "light" ? "#475569" : "#CBD5E1" }}>Remember to schedule a short 10-min break after your next session.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="position-relative">
          <button 
            className="btn p-1 d-flex align-items-center gap-2 border-0 bg-transparent"
            style={{ color: theme === "light" ? "#0F172A" : "#FFFFFF" }}
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm overflow-hidden"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                border: "2px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-100 h-100 object-fit-cover" />
              ) : (
                displayName ? displayName.trim().charAt(0).toUpperCase() : "P"
              )}
            </div>
            <div className="d-none d-md-block text-start">
              <div className="fw-semibold lh-1" style={{ fontSize: "0.9rem", color: theme === "light" ? "#0F172A" : "#FFFFFF" }}>{displayName}</div>
              <div style={{ fontSize: "0.75rem", color: theme === "light" ? "#475569" : "#94A3B8" }}>Working Professional</div>
            </div>
            <FiChevronDown style={{ color: theme === "light" ? "#64748B" : "#94A3B8" }} className="d-none d-md-block" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div 
              className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg"
              style={{
                width: "230px",
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
                <div className="d-flex align-items-center gap-1 mt-1">
                  <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-30">
                    <FiBriefcase className="me-1" style={{ fontSize: "0.75rem" }} />
                    Working Professional
                  </span>
                </div>
              </div>
              <div className="d-flex flex-column gap-1 mt-2">
                <button 
                  className="btn text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2 fw-medium" 
                  style={{ fontSize: "0.88rem", color: theme === "light" ? "#334155" : "#CBD5E1" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onTabChange) onTabChange("profile");
                    navigate("/professional/profile");
                  }}
                >
                  <FiUser /> View Profile
                </button>
                <button 
                  className="btn text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2 fw-medium" 
                  style={{ fontSize: "0.88rem", color: theme === "light" ? "#334155" : "#CBD5E1" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onTabChange) onTabChange("settings");
                    navigate("/professional/profile");
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

export default ProfessionalNavbar;
