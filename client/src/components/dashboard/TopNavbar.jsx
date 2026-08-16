import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiMenu, FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";

function TopNavbar({ studentName = "Alex Morgan", toggleSidebar }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [recentUnread, setRecentUnread] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
          className="btn text-white p-1 d-lg-none border-0" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FiMenu size={24} />
        </button>
        <div>
          <h2 className="mb-0 text-white fw-bold fs-5 d-flex align-items-center gap-2">
            Welcome back, <span className="text-transparent bg-clip-text" style={{ background: "linear-gradient(135deg, #60A5FA, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{studentName}</span> 👋
          </h2>
          <p className="mb-0 text-muted d-none d-md-block" style={{ fontSize: "0.8rem" }}>
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
      <div className="d-flex align-items-center gap-3 position-relative">
        {/* Notifications Icon */}
        <div className="position-relative">
          <button 
            className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center text-white border-0 position-relative"
            style={{ width: "42px", height: "42px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span 
                className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-dark rounded-circle"
                style={{ width: "10px", height: "10px" }}
              />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div 
              className="position-absolute end-0 mt-2 p-3 rounded-4 shadow-lg text-white"
              style={{
                width: "320px",
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                zIndex: 1050
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0 fs-6">Notifications</h6>
                <span className="badge bg-primary rounded-pill">{unreadCount} New</span>
              </div>
              <div className="d-flex flex-column gap-2 mb-2" style={{ fontSize: "0.83rem", maxHeight: "240px", overflowY: "auto" }}>
                {recentUnread.length > 0 ? (
                  recentUnread.map((item) => (
                    <div 
                      key={item._id} 
                      className="p-2 rounded bg-white bg-opacity-10 cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setShowNotifications(false);
                        if (item.link) navigate(item.link);
                        else navigate("/student/notifications");
                      }}
                    >
                      <div className="fw-semibold text-truncate">{item.title}</div>
                      <div className="text-muted text-truncate" style={{ fontSize: "0.78rem" }}>{item.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted" style={{ fontSize: "0.8rem" }}>
                    No unread notifications right now.
                  </div>
                )}
              </div>
              <button
                className="btn btn-sm btn-outline-primary w-100 rounded-pill mt-1"
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
            className="btn p-1 d-flex align-items-center gap-2 text-white border-0 bg-transparent"
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
              {studentName ? studentName.trim().charAt(0).toUpperCase() : "S"}
            </div>
            <div className="d-none d-md-block text-start">
              <div className="fw-semibold lh-1" style={{ fontSize: "0.9rem" }}>{studentName}</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>Student Profile</div>
            </div>
            <FiChevronDown className="text-muted d-none d-md-block" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div 
              className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg text-white"
              style={{
                width: "220px",
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(20px)",
                zIndex: 1050
              }}
            >
              <div className="p-2 border-bottom border-secondary border-opacity-25">
                <div className="fw-bold">{studentName}</div>
                <span className="badge bg-primary text-white mt-1">Student</span>
              </div>
              <div className="d-flex flex-column gap-1 mt-2">
                <button 
                  className="btn text-white-50 text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2" 
                  style={{ fontSize: "0.88rem" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/student/profile");
                  }}
                >
                  <FiUser /> View Profile
                </button>
                <button 
                  className="btn text-white-50 text-start p-2 rounded border-0 hover-bg-light d-flex align-items-center gap-2" 
                  style={{ fontSize: "0.88rem" }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/student/settings");
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

export default TopNavbar;
