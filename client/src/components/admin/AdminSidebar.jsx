import React from "react";
import { Link } from "react-router-dom";
import { 
  FiGrid, 
  FiUserCheck, 
  FiHeart, 
  FiBriefcase, 
  FiSun, 
  FiActivity, 
  FiMessageSquare, 
  FiBell, 
  FiSettings, 
  FiLogOut,
  FiX
} from "react-icons/fi";

const SIDEBAR_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "users-students", label: "Students", icon: FiUserCheck },
  { id: "users-parents", label: "Parents", icon: FiHeart },
  { id: "users-professionals", label: "Working Professionals", icon: FiBriefcase },
  { id: "users-seniors", label: "Senior Citizens", icon: FiSun },
  { id: "wellness-analytics", label: "Wellness Analytics", icon: FiActivity },
  { id: "feedback", label: "Feedback", icon: FiMessageSquare },
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "settings", label: "Settings", icon: FiSettings },
];

function AdminSidebar({ activeTab, setActiveTab, currentUser, onLogout, sidebarOpen, setSidebarOpen }) {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0, 0, 0, 0.7)", zIndex: 1040, backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Dark / Navy Sidebar Container */}
      <aside
        className={`admin-sidebar position-fixed top-0 start-0 h-100 d-flex flex-column transition-all ${
          sidebarOpen ? "show" : ""
        }`}
        style={{
          width: "260px",
          background: "#15132B",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#E5E7EB",
          zIndex: 1045,
          backdropFilter: "blur(20px)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.2)"
        }}
      >
        {/* Sidebar Header / Brand Logo */}
        <div 
          className="p-4 d-flex align-items-center justify-content-between position-relative"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          {/* Subtle Ambient Glow behind Logo */}
          <div 
            className="position-absolute"
            style={{
              top: "-10px",
              left: "20px",
              width: "100px",
              height: "60px",
              background: "radial-gradient(circle, rgba(124, 92, 252, 0.35) 0%, transparent 70%)",
              filter: "blur(20px)",
              pointerEvents: "none"
            }}
          />

          <Link to="/admin" className="text-decoration-none d-flex align-items-center gap-3 position-relative" style={{ zIndex: 2 }}>
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #7C5CFC 0%, #4F8CFF 100%)",
                fontSize: "1.2rem",
                boxShadow: "0 4px 14px rgba(124, 92, 252, 0.4)"
              }}
            >
              🧠
            </div>
            <div>
              <h5 className="fw-bold mb-0 leading-tight" style={{ fontSize: "1.12rem", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                NeuroSync <span style={{ color: "#4F8CFF" }}>AI</span>
              </h5>
              <span 
                className="extra-small px-2 py-0.5 rounded-pill fw-bold text-uppercase tracking-wider" 
                style={{ 
                  background: "rgba(124, 92, 252, 0.2)", 
                  color: "#C4B5FD", 
                  border: "1px solid rgba(124, 92, 252, 0.35)",
                  fontSize: "0.62rem"
                }}
              >
                ADMIN CONSOLE
              </span>
            </div>
          </Link>

          <button 
            onClick={() => setSidebarOpen(false)} 
            className="btn btn-sm text-secondary d-lg-none p-0 border-0"
            style={{ color: "#94A3B8" }}
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Navigation Links List (EVERY ITEM IS A SEPARATE TOP-LEVEL ITEM) */}
        <div 
          className="flex-grow-1 overflow-y-auto px-3 py-3 custom-sidebar-scrollbar"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255, 255, 255, 0.15) transparent" }}
        >
          <ul className="nav nav-pills flex-column gap-1.5 list-unstyled mb-0">
            {SIDEBAR_NAV_ITEMS.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id} className="nav-item">
                  <button
                    onClick={() => handleTabClick(item.id)}
                    className={`nav-link w-100 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 border-0 ns-sidebar-btn ${isActive ? "active" : ""}`}
                    style={
                      isActive
                        ? { 
                            background: "linear-gradient(135deg, #7C5CFC 0%, #4F8CFF 100%)", 
                            color: "#FFFFFF", 
                            boxShadow: "0 4px 16px rgba(124, 92, 252, 0.4)",
                            fontWeight: 600,
                            borderRadius: "12px",
                            transform: "translateX(2px)",
                            transition: "all 200ms ease-out"
                          }
                        : { 
                            color: "#94A3B8", 
                            background: "transparent",
                            fontWeight: 500,
                            borderRadius: "12px",
                            transition: "all 200ms ease-out"
                          }
                    }
                  >
                    {/* Active Animated Indicator Dot */}
                    <span 
                      className="rounded-circle flex-shrink-0 transition-all"
                      style={{
                        width: "6px",
                        height: "6px",
                        background: isActive ? "#FFFFFF" : "transparent",
                        boxShadow: isActive ? "0 0 8px #FFFFFF" : "none"
                      }}
                    />

                    <IconComponent size={18} className="flex-shrink-0" style={{ color: isActive ? "#FFFFFF" : "#94A3B8" }} />
                    <span style={{ fontSize: "0.92rem", letterSpacing: "-0.01em" }}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer: Admin Profile & Ghost Logout */}
        <div 
          className="p-3.5 border-top mt-auto"
          style={{ borderColor: "rgba(255, 255, 255, 0.08)", background: "rgba(17, 24, 39, 0.5)" }}
        >
          {/* Admin Profile Card */}
          <div 
            className="d-flex align-items-center gap-3 p-2.5 rounded-3 mb-2.5 border transition-all"
            style={{ 
              background: "rgba(255, 255, 255, 0.04)", 
              borderColor: "rgba(255, 255, 255, 0.08)" 
            }}
          >
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 shadow-sm"
              style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #7C5CFC, #4F8CFF)", fontSize: "0.95rem" }}
            >
              {currentUser?.fullName?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <h6 className="fw-semibold mb-0 text-truncate text-white" style={{ fontSize: "0.85rem" }}>
                {currentUser?.fullName || "System Admin"}
              </h6>
              <span className="extra-small text-truncate d-block" style={{ color: "#94A3B8", fontSize: "0.72rem" }} title={currentUser?.email || "admin@neurosync.ai"}>
                {currentUser?.email || "admin@neurosync.ai"}
              </span>
            </div>
          </div>

          {/* Ghost Logout Button */}
          <button
            onClick={onLogout}
            className="btn btn-sm w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold transition-all border-0 ns-logout-btn"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              color: "#EF4444",
              fontSize: "0.83rem"
            }}
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Hover & Animation CSS Styles */}
      <style>{`
        .ns-sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          color: #FFFFFF !important;
          transform: translateX(3px) !important;
        }
        .ns-sidebar-btn:hover svg {
          color: #7C5CFC !important;
          transform: translateX(2px);
          transition: transform 200ms ease-out;
        }
        .ns-logout-btn:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          color: #FF6B6B !important;
          transform: translateY(-1px);
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}

export default AdminSidebar;
