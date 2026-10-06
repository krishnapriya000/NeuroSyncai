import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiMenu, FiUser, FiSettings, FiLogOut, FiChevronDown, FiSun, FiMoon } from "react-icons/fi";

function TopNavbar({ studentName: propStudentName, toggleSidebar }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [recentUnread, setRecentUnread] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
  
  // Resolve user full name: if prop provided and not default "Alex Morgan", use it; else fallback to stored user or "User"
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

      {/* Center: Search Bar */}
      <div className="ns-search-box d-none d-sm-block">
        <FiSearch className="ns-search-icon" />
        <input 
          type="text" 
          className="ns-search-input" 
          placeholder="Search study topics, tasks, AI notes..." 
        />
        <span className="ns-search-kbd">⌘K</span>
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
