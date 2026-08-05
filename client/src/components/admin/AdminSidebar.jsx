import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiGrid, 
  FiUsers, 
  FiChevronDown, 
  FiChevronRight, 
  FiActivity, 
  FiMessageSquare, 
  FiBell, 
  FiSettings, 
  FiLogOut,
  FiUserCheck,
  FiHeart,
  FiBriefcase,
  FiSun,
  FiMenu,
  FiX,
  FiShield
} from "react-icons/fi";

function AdminSidebar({ activeTab, setActiveTab, currentUser, onLogout, sidebarOpen, setSidebarOpen }) {
  // State for nested "Manage Users" dropdown
  const [manageUsersOpen, setManageUsersOpen] = useState(
    activeTab.startsWith("users-")
  );

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  const toggleManageUsers = () => {
    setManageUsersOpen((prev) => !prev);
  };

  const isUserTabActive = activeTab.startsWith("users-");

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`admin-sidebar bg-slate-950 position-fixed top-0 start-0 h-100 d-flex flex-column transition-all ${
          sidebarOpen ? "show" : ""
        }`}
        style={{
          width: "270px",
          background: "#030712",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 1045,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Sidebar Header / Brand Logo */}
        <div className="p-4 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25">
          <Link to="/admin" className="text-decoration-none d-flex align-items-center gap-2.5">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #7B2FF7 0%, #2D8CFF 100%)",
                fontSize: "1.2rem"
              }}
            >
              🧠
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white leading-tight" style={{ fontSize: "1.15rem" }}>
                NeuroSync <span className="text-primary fs-6">AI</span>
              </h5>
              <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 extra-small px-2 py-0.5 rounded-pill" style={{ color: "#c084fc" }}>
                ⚡ Admin Panel
              </span>
            </div>
          </Link>

          <button 
            onClick={() => setSidebarOpen(false)} 
            className="btn btn-sm text-secondary d-lg-none"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Sidebar User Info Card */}
        <div className="p-3 mx-3 my-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
          >
            {currentUser?.fullName?.charAt(0) || "A"}
          </div>
          <div className="overflow-hidden">
            <h6 className="fw-bold text-white mb-0 text-truncate small">{currentUser?.fullName || "System Admin"}</h6>
            <span className="text-secondary extra-small text-truncate d-block">{currentUser?.email || "admin@neurosync.ai"}</span>
          </div>
        </div>

        {/* Navigation Links List */}
        <div className="flex-grow-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          <ul className="nav nav-pills flex-column gap-1.5 list-unstyled mb-0">
            
            {/* 1. Dashboard */}
            <li className="nav-item">
              <button
                onClick={() => handleTabClick("dashboard")}
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 transition-all ${
                  activeTab === "dashboard"
                    ? "active text-white fw-semibold"
                    : "text-secondary hover-text-white hover-bg-dark"
                }`}
                style={
                  activeTab === "dashboard"
                    ? { background: "linear-gradient(135deg, #7B2FF7 0%, #2D8CFF 100%)", boxShadow: "0 4px 12px rgba(123, 47, 247, 0.3)" }
                    : {}
                }
              >
                <FiGrid size={18} />
                <span>Dashboard</span>
              </button>
            </li>

            {/* 2. Manage Users (Nested Accordion Menu) */}
            <li className="nav-item">
              <button
                onClick={toggleManageUsers}
                className={`nav-link w-100 text-start d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all ${
                  isUserTabActive ? "text-white fw-semibold bg-dark bg-opacity-75" : "text-secondary hover-text-white hover-bg-dark"
                }`}
                style={isUserTabActive ? { borderLeft: "3px solid #3B82F6" } : {}}
              >
                <div className="d-flex align-items-center gap-3">
                  <FiUsers size={18} />
                  <span>Manage Users</span>
                </div>
                {manageUsersOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
              </button>

              {/* Submenu Items */}
              {manageUsersOpen && (
                <ul className="list-unstyled ps-4 ms-2 mt-1 border-start border-secondary border-opacity-25 d-flex flex-column gap-1">
                  {/* Students Submenu */}
                  <li>
                    <button
                      onClick={() => handleTabClick("users-students")}
                      className={`nav-link w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-3 small transition-all ${
                        activeTab === "users-students"
                          ? "text-primary fw-bold bg-primary bg-opacity-15"
                          : "text-secondary hover-text-white"
                      }`}
                    >
                      <FiUserCheck size={16} />
                      <span>Students</span>
                    </button>
                  </li>

                  {/* Parents Submenu */}
                  <li>
                    <button
                      onClick={() => handleTabClick("users-parents")}
                      className={`nav-link w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-3 small transition-all ${
                        activeTab === "users-parents"
                          ? "text-primary fw-bold bg-primary bg-opacity-15"
                          : "text-secondary hover-text-white"
                      }`}
                    >
                      <FiHeart size={16} />
                      <span>Parents</span>
                    </button>
                  </li>

                  {/* Working Professionals Submenu */}
                  <li>
                    <button
                      onClick={() => handleTabClick("users-professionals")}
                      className={`nav-link w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-3 small transition-all ${
                        activeTab === "users-professionals"
                          ? "text-primary fw-bold bg-primary bg-opacity-15"
                          : "text-secondary hover-text-white"
                      }`}
                    >
                      <FiBriefcase size={16} />
                      <span>Working Professionals</span>
                    </button>
                  </li>

                  {/* Senior Citizens Submenu */}
                  <li>
                    <button
                      onClick={() => handleTabClick("users-seniors")}
                      className={`nav-link w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-3 small transition-all ${
                        activeTab === "users-seniors"
                          ? "text-primary fw-bold bg-primary bg-opacity-15"
                          : "text-secondary hover-text-white"
                      }`}
                    >
                      <FiSun size={16} />
                      <span>Senior Citizens</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* 3. Wellness Analytics */}
            <li className="nav-item">
              <button
                onClick={() => handleTabClick("wellness-analytics")}
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 transition-all ${
                  activeTab === "wellness-analytics"
                    ? "active text-white fw-semibold"
                    : "text-secondary hover-text-white hover-bg-dark"
                }`}
                style={
                  activeTab === "wellness-analytics"
                    ? { background: "linear-gradient(135deg, #7B2FF7 0%, #2D8CFF 100%)", boxShadow: "0 4px 12px rgba(123, 47, 247, 0.3)" }
                    : {}
                }
              >
                <FiActivity size={18} />
                <span>Wellness Analytics</span>
              </button>
            </li>

            {/* 4. Feedback */}
            <li className="nav-item">
              <button
                onClick={() => handleTabClick("feedback")}
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 transition-all ${
                  activeTab === "feedback"
                    ? "active text-white fw-semibold"
                    : "text-secondary hover-text-white hover-bg-dark"
                }`}
                style={
                  activeTab === "feedback"
                    ? { background: "linear-gradient(135deg, #7B2FF7 0%, #2D8CFF 100%)", boxShadow: "0 4px 12px rgba(123, 47, 247, 0.3)" }
                    : {}
                }
              >
                <FiMessageSquare size={18} />
                <span>Feedback</span>
              </button>
            </li>

            {/* 5. Notifications */}
            <li className="nav-item">
              <button
                onClick={() => handleTabClick("notifications")}
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 transition-all ${
                  activeTab === "notifications"
                    ? "active text-white fw-semibold"
                    : "text-secondary hover-text-white hover-bg-dark"
                }`}
                style={
                  activeTab === "notifications"
                    ? { background: "linear-gradient(135deg, #7B2FF7 0%, #2D8CFF 100%)", boxShadow: "0 4px 12px rgba(123, 47, 247, 0.3)" }
                    : {}
                }
              >
                <FiBell size={18} />
                <span>Notifications</span>
              </button>
            </li>

            {/* 6. Settings */}
            <li className="nav-item">
              <button
                onClick={() => handleTabClick("settings")}
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 transition-all ${
                  activeTab === "settings"
                    ? "active text-white fw-semibold"
                    : "text-secondary hover-text-white hover-bg-dark"
                }`}
                style={
                  activeTab === "settings"
                    ? { background: "linear-gradient(135deg, #7B2FF7 0%, #2D8CFF 100%)", boxShadow: "0 4px 12px rgba(123, 47, 247, 0.3)" }
                    : {}
                }
              >
                <FiSettings size={18} />
                <span>Settings</span>
              </button>
            </li>

          </ul>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
          <button
            onClick={onLogout}
            className="btn btn-outline-danger btn-sm w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
