import React from "react";
import { 
  FiUsers, 
  FiUserCheck, 
  FiHeart, 
  FiBriefcase, 
  FiSun, 
  FiCheckCircle, 
  FiActivity, 
  FiTrendingDown,
  FiClock,
  FiUserPlus,
  FiShield,
  FiZap
} from "react-icons/fi";

function AdminDashboardOverview({ stats, wellnessAnalytics, users, logs, loading, onNavigateTab }) {
  if (loading) {
    return (
      <div className="p-5 text-center text-white my-4 rounded-4" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
        <h5 className="fw-bold">Loading Admin Overview Metrics...</h5>
        <p className="text-secondary small">Synchronizing system analytics from MongoDB</p>
      </div>
    );
  }

  const roleBreakdown = stats?.roleBreakdown || {};
  const totalStudents = roleBreakdown["Student"] || users.filter(u => u.role === "Student").length || 0;
  const totalParents = roleBreakdown["Parent"] || users.filter(u => u.role === "Parent").length || 0;
  const totalProfessionals = roleBreakdown["Working Professional"] || users.filter(u => u.role === "Working Professional").length || 0;
  const totalSeniorCitizens = roleBreakdown["Senior Citizen"] || users.filter(u => u.role === "Senior Citizen").length || 0;

  const todaysCheckIns = wellnessAnalytics?.todaysCheckIns || 0;
  const avgWellnessScore = wellnessAnalytics?.avgWellnessScore || 0;
  const highStressUsers = wellnessAnalytics?.highStressStudents || 0;

  // Filter recent 5 registrations
  const recentRegistrations = users.slice(0, 5);

  // Filter recent 5 activity logs
  const recentActivities = logs.slice(0, 5);

  return (
    <div className="admin-overview-section">
      {/* Page Title Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <span>📊</span> System Dashboard & Overview
          </h4>
          <p className="text-secondary small mb-0">
            Real-time snapshot of user registrations, check-in activity, and platform wellness
          </p>
        </div>
      </div>

      {/* 8 Metric Stat Cards (Grid) */}
      <div className="row g-3 mb-4">
        {/* 1. Total Users */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Total Users</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(123, 47, 247, 0.2)", color: "#a78bfa" }}>
                <FiUsers size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-white">{stats?.totalUsers || users.length || 0}</h3>
            <span className="text-secondary extra-small">All Roles Registered</span>
          </div>
        </div>

        {/* 2. Total Students */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Total Students</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>
                <FiUserCheck size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-info">{totalStudents}</h3>
            <span className="text-secondary extra-small">Student Role Accounts</span>
          </div>
        </div>

        {/* 3. Total Parents */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(236, 72, 153, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Total Parents</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(236, 72, 153, 0.2)", color: "#ec4899" }}>
                <FiHeart size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: "#f472b6" }}>{totalParents}</h3>
            <span className="text-secondary extra-small">Parent Accounts</span>
          </div>
        </div>

        {/* 4. Total Working Professionals */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Working Professionals</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}>
                <FiBriefcase size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-success">{totalProfessionals}</h3>
            <span className="text-secondary extra-small">Professional Accounts</span>
          </div>
        </div>

        {/* 5. Total Senior Citizens */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Senior Citizens</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" }}>
                <FiSun size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-warning">{totalSeniorCitizens}</h3>
            <span className="text-secondary extra-small">Senior Accounts</span>
          </div>
        </div>

        {/* 6. Today's Check-ins */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Today's Check-ins</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}>
                <FiCheckCircle size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-success">{todaysCheckIns}</h3>
            <span className="text-success extra-small">Recorded Today</span>
          </div>
        </div>

        {/* 7. Average Wellness Score */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Avg Wellness Score</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(168, 85, 247, 0.2)", color: "#a855f7" }}>
                <FiActivity size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: "#c084fc" }}>{avgWellnessScore}%</h3>
            <span className="text-secondary extra-small">Overall Student Average</span>
          </div>
        </div>

        {/* 8. High Stress Users */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">High Stress Users</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
                <FiTrendingDown size={18} />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-danger">{highStressUsers}</h3>
            <span className="text-danger extra-small">Stress Level ≥ 7</span>
          </div>
        </div>
      </div>

      {/* 2 Feed Cards Row: Recent Registrations & Recent Activities */}
      <div className="row g-4">
        {/* Recent Registrations Card */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <FiUserPlus className="text-primary" /> Recent Registrations
              </h6>
              <button 
                onClick={() => onNavigateTab("users-students")} 
                className="btn btn-link btn-sm text-primary text-decoration-none p-0 extra-small fw-semibold"
              >
                View All Users &rarr;
              </button>
            </div>

            {recentRegistrations.length > 0 ? (
              <div className="d-flex flex-column gap-2.5">
                {recentRegistrations.map((u) => (
                  <div key={u._id} className="p-2.5 rounded-3 bg-dark bg-opacity-40 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2.5">
                      <div className="rounded-circle bg-primary bg-opacity-20 text-primary d-flex align-items-center justify-content-center fw-bold small" style={{ width: "34px", height: "34px" }}>
                        {u.fullName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <span className="fw-semibold text-white small d-block">{u.fullName}</span>
                        <span className="text-secondary extra-small">{u.email}</span>
                      </div>
                    </div>

                    <span className={`badge ${u.role === "Student" ? "bg-info" : u.role === "Parent" ? "bg-danger" : "bg-secondary"} bg-opacity-20 text-white extra-small px-2 py-1 rounded-pill`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-secondary text-center py-4 small">No recent user registrations found.</div>
            )}
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <FiClock className="text-warning" /> Recent Activities
              </h6>
              <span className="text-secondary extra-small">Live Audit Stream</span>
            </div>

            {recentActivities.length > 0 ? (
              <div className="d-flex flex-column gap-2.5">
                {recentActivities.map((log) => (
                  <div key={log._id} className="p-2.5 rounded-3 bg-dark bg-opacity-40 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2.5">
                      <span className="text-success small">🔑</span>
                      <div>
                        <span className="fw-semibold text-white small d-block">{log.email}</span>
                        <span className="text-secondary extra-small">User login successful</span>
                      </div>
                    </div>

                    <span className="text-secondary extra-small">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-secondary text-center py-4 small">No recent activity logs recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardOverview;
