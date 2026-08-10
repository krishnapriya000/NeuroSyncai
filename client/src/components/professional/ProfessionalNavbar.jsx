import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiMenu, FiUser, FiSettings, FiLogOut, FiChevronDown, FiBriefcase } from "react-icons/fi";

function ProfessionalNavbar({ userName = "Professional User", toggleSidebar, onTabChange }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [userPhoto, setUserPhoto] = useState("");

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
        {/* Notifications Icon */}
        <div className="position-relative">
          <button 
            className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center text-white border-0 position-relative"
            style={{ width: "42px", height: "42px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            title="Notifications"
          >
            <FiBell size={18} />
            <span 
              className="position-absolute top-0 start-100 translate-middle p-1 bg-primary border border-dark rounded-circle"
              style={{ width: "10px", height: "10px" }}
            ></span>
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div 
              className="position-absolute end-0 mt-2 p-3 rounded-4 shadow-lg text-white"
              style={{
                width: "310px",
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                zIndex: 1050
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0 fs-6">Workplace Insights</h6>
                <span className="badge bg-primary rounded-pill">2 New</span>
              </div>
              <div className="d-flex flex-column gap-2" style={{ fontSize: "0.83rem" }}>
                <div className="p-2 rounded bg-white bg-opacity-10">
                  <div className="fw-semibold text-info">Focus Milestone Reached</div>
                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>Completed 5 hours of deep focus time today!</div>
                </div>
                <div className="p-2 rounded bg-white bg-opacity-5">
                  <div className="fw-semibold text-warning">Work-Life Balance Tip</div>
                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>Remember to schedule a short 10-min break after your next session.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="position-relative">
          <button 
            className="btn p-1 d-flex align-items-center gap-2 text-white border-0 bg-transparent"
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
              <div className="fw-semibold lh-1" style={{ fontSize: "0.9rem" }}>{displayName}</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>Working Professional</div>
            </div>
            <FiChevronDown className="text-muted d-none d-md-block" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div 
              className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg text-white"
              style={{
                width: "230px",
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                zIndex: 1050
              }}
            >
              <div className="p-2 border-bottom border-secondary border-opacity-25">
                <div className="fw-bold">{displayName}</div>
                <div className="d-flex align-items-center gap-1 mt-1">
                  <span className="badge bg-primary bg-opacity-25 text-blue-300 border border-primary border-opacity-30">
                    <FiBriefcase className="me-1" style={{ fontSize: "0.75rem" }} />
                    Working Professional
                  </span>
                </div>
              </div>
              <div className="d-flex flex-column gap-1 mt-2">
                <button 
                  className="btn text-white-50 text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2" 
                  style={{ fontSize: "0.88rem" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onTabChange) onTabChange("profile");
                    navigate("/professional/profile");
                  }}
                >
                  <FiUser /> View Profile
                </button>
                <button 
                  className="btn text-white-50 text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2" 
                  style={{ fontSize: "0.88rem" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onTabChange) onTabChange("settings");
                    navigate("/professional/profile");
                  }}
                >
                  <FiSettings /> Account Settings
                </button>
                <button 
                  className="btn text-danger text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2 mt-1" 
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
