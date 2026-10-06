import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiMenu, FiUser, FiSettings, FiLogOut, FiChevronDown, FiBriefcase, FiSun, FiMoon } from "react-icons/fi";

function ProfessionalNavbar({ userName = "Professional User", toggleSidebar, onTabChange }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [userPhoto, setUserPhoto] = useState("");

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
      <div className="ns-search-box d-none d-sm-block">
        <FiSearch className="ns-search-icon" />
        <input 
          type="text" 
          className="ns-search-input" 
          placeholder="Search insights, tasks..." 
        />
        <span className="ns-search-kbd">⌘K</span>
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
