import React from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiRefreshCw, FiHome, FiLogOut, FiBell } from "react-icons/fi";

function AdminHeader({ currentUser, onLogout, toggleSidebar, onRefreshData, activeTabTitle }) {
  return (
    <header 
      className="admin-header sticky-top px-4 py-3 border-bottom border-secondary border-opacity-25"
      style={{
        background: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(16px)",
        zIndex: 1030,
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        
        {/* Left: Mobile Menu Toggle & Active Section Title */}
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="btn btn-outline-secondary btn-sm p-2 rounded-3 text-white border-secondary border-opacity-25"
            title="Toggle Sidebar"
          >
            <FiMenu size={20} />
          </button>

          <div>
            <h5 className="fw-bold mb-0 text-white leading-tight fs-5">
              {activeTabTitle || "Admin Portal"}
            </h5>
            <span className="text-secondary extra-small d-none d-sm-inline">
              NeuroSync Management Console
            </span>
          </div>
        </div>

        {/* Right: Actions & User Avatar */}
        <div className="d-flex align-items-center gap-2.5">
          <button
            onClick={onRefreshData}
            className="btn btn-outline-light btn-sm px-3 rounded-pill d-inline-flex align-items-center gap-1.5 extra-small"
          >
            <FiRefreshCw size={13} /> <span className="d-none d-md-inline">Refresh</span>
          </button>

          <Link 
            to="/" 
            className="btn btn-outline-secondary btn-sm px-3 rounded-pill text-white d-inline-flex align-items-center gap-1.5 extra-small"
          >
            <FiHome size={13} /> <span className="d-none d-md-inline">Home</span>
          </Link>

          <button
            onClick={onLogout}
            className="btn btn-outline-danger btn-sm px-3 rounded-pill d-inline-flex align-items-center gap-1.5 extra-small"
          >
            <FiLogOut size={13} /> <span className="d-none d-md-inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}

export default AdminHeader;
