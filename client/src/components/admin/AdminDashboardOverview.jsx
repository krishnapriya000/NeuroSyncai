import React, { useState } from "react";
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
  FiArrowRight,
  FiBell,
  FiPlus,
  FiTrendingUp
} from "react-icons/fi";

function AdminDashboardOverview({ stats, wellnessAnalytics, users = [], logs = [], loading, onNavigateTab, theme = "light" }) {
  const [chartRange, setChartRange] = useState("7 Days");
  const isLight = theme === "light";
  
  const cardStyle = {
    background: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.75)",
    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: isLight ? "0 2px 12px rgba(0, 0, 0, 0.03)" : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
    borderRadius: "16px"
  };

  const titleColor = isLight ? "#111827" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

  if (loading) {
    return (
      <div className="p-5 text-center my-4" style={cardStyle}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
        <h5 className="fw-bold" style={{ color: titleColor }}>Loading Platform Analytics...</h5>
        <p className="small mb-0" style={{ color: subtextColor }}>Synchronizing live data metrics from MongoDB</p>
      </div>
    );
  }

  // Real Metric Values
  const totalUserCount = stats?.totalUsers || users.length || 0;
  const roleBreakdown = stats?.roleBreakdown || {};
  const totalStudents = roleBreakdown["Student"] || users.filter(u => u.role === "Student").length || 0;
  const totalParents = roleBreakdown["Parent"] || users.filter(u => u.role === "Parent").length || 0;
  const totalProfessionals = roleBreakdown["Working Professional"] || users.filter(u => u.role === "Working Professional").length || 0;
  const totalSeniorCitizens = roleBreakdown["Senior Citizen"] || users.filter(u => u.role === "Senior Citizen").length || 0;

  const todaysCheckIns = wellnessAnalytics?.todaysCheckIns || 0;
  const avgWellnessScore = wellnessAnalytics?.avgWellnessScore || 65;
  const highStressUsers = wellnessAnalytics?.highStressStudents || 0;
  const dailyTrend = wellnessAnalytics?.dailyTrend || [];

  const recentRegistrations = users.slice(0, 5);
  const recentActivities = logs.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getRoleTab = (role) => {
    switch (role?.toLowerCase()) {
      case "student":
        return "users-students";
      case "parent":
        return "users-parents";
      case "working professional":
      case "professional":
        return "users-professionals";
      case "senior citizen":
      case "senior":
        return "users-seniors";
      default:
        return "users-students";
    }
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case "Student":
        return (
          <span className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-block" style={{ background: "rgba(79, 140, 255, 0.15)", color: "#1D4ED8", border: "1px solid rgba(79, 140, 255, 0.3)", fontSize: "0.72rem" }}>
            Student
          </span>
        );
      case "Parent":
        return (
          <span className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-block" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#B91C1C", border: "1px solid rgba(239, 68, 68, 0.3)", fontSize: "0.72rem" }}>
            Parent
          </span>
        );
      case "Working Professional":
      case "Professional":
        return (
          <span className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-block" style={{ background: "rgba(24, 185, 129, 0.15)", color: "#047857", border: "1px solid rgba(24, 185, 129, 0.3)", fontSize: "0.72rem" }}>
            Working Professional
          </span>
        );
      case "Senior Citizen":
      case "Senior":
        return (
          <span className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-block" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#B45309", border: "1px solid rgba(245, 158, 11, 0.3)", fontSize: "0.72rem" }}>
            Senior Citizen
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-block" style={{ background: "rgba(108, 76, 241, 0.15)", color: "#5B21B6", border: "1px solid rgba(108, 76, 241, 0.3)", fontSize: "0.72rem" }}>
            {role || "User"}
          </span>
        );
    }
  };

  const renderStatusBadge = () => (
    <span className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-block" style={{ background: "rgba(24, 185, 129, 0.15)", color: "#047857", border: "1px solid rgba(24, 185, 129, 0.3)", fontSize: "0.72rem" }}>
      ● Active
    </span>
  );

  // Chart data calculations
  const maxTrend = Math.max(...dailyTrend.map(d => d.count), 5);
  const chartPoints = dailyTrend.length > 0 ? dailyTrend : [
    { date: "Mon", count: 2 },
    { date: "Tue", count: 4 },
    { date: "Wed", count: 3 },
    { date: "Thu", count: 6 },
    { date: "Fri", count: 5 },
    { date: "Sat", count: 8 },
    { date: "Sun", count: todaysCheckIns || 1 }
  ];

  return (
    <div className="admin-dashboard-new-layout" style={{ maxWidth: "1500px", margin: "0 auto" }}>
      
      {/* 3. HERO OVERVIEW HEADER (COMPACT MODERN OVERVIEW) */}
      <div 
        className="p-3.5 px-4 rounded-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 transition-all"
        style={{
          background: isLight 
            ? "linear-gradient(135deg, #F0EBFF 0%, #E6EFFF 100%)" 
            : "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
          border: isLight ? "1px solid #E0D7FC" : "1px solid rgba(108, 76, 241, 0.25)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, #6C4CF1, #4F8CFF)", width: "44px", height: "44px" }}>
            🧠
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-0.5">
              <h4 className="fw-bold mb-0" style={{ color: titleColor, fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
                {getGreeting()}, <span style={{ color: "#6C4CF1" }}>Admin 👋</span>
              </h4>
              <span className="badge rounded-pill px-2.5 py-1 fw-semibold extra-small" style={{ background: "rgba(24, 185, 129, 0.12)", color: "#16B981", border: "1px solid rgba(24, 185, 129, 0.25)" }}>
                ● System Operational
              </span>
            </div>
            <p className="mb-0 extra-small" style={{ color: subtextColor, fontSize: "0.85rem" }}>
              Your NeuroSync platform is running smoothly.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 bg-white bg-opacity-75 px-3 py-2 rounded-3 border" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
          <span className="extra-small text-uppercase fw-bold tracking-wider" style={{ color: subtextColor, fontSize: "0.7rem" }}>
            Total Users
          </span>
          <span className="fw-bold fs-5 text-primary leading-none" style={{ color: "#6C4CF1" }}>
            {totalUserCount}
          </span>
        </div>
      </div>

      {/* 4. KEY METRICS ROW (TOP ROW: 4 HIERARCHY CARDS) */}
      <div className="row g-3 mb-4">
        {/* Metric 1: Total Users */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="p-3.5 px-4 rounded-4 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-semibold text-uppercase tracking-wider" style={{ color: subtextColor, fontSize: "0.75rem" }}>
                Total Users
              </span>
              <div className="p-2 rounded-3" style={{ background: "rgba(108, 76, 241, 0.1)", color: "#6C4CF1" }}>
                <FiUsers size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="fw-bold mb-0" style={{ color: titleColor, fontSize: "1.75rem" }}>{totalUserCount}</h3>
              <span className="badge rounded-pill extra-small px-2 py-0.5" style={{ background: "rgba(24, 185, 129, 0.12)", color: "#16B981" }}>
                ↑ Growth
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Wellness Score */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="p-3.5 px-4 rounded-4 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-semibold text-uppercase tracking-wider" style={{ color: subtextColor, fontSize: "0.75rem" }}>
                Wellness Score
              </span>
              <div className="p-2 rounded-3" style={{ background: "rgba(79, 140, 255, 0.1)", color: "#4F8CFF" }}>
                <FiActivity size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="fw-bold mb-0" style={{ color: "#6C4CF1", fontSize: "1.75rem" }}>{avgWellnessScore}%</h3>
              <span className="badge rounded-pill extra-small px-2 py-0.5" style={{ background: "rgba(108, 76, 241, 0.12)", color: "#6C4CF1" }}>
                Overall
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Today's Check-ins */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="p-3.5 px-4 rounded-4 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-semibold text-uppercase tracking-wider" style={{ color: subtextColor, fontSize: "0.75rem" }}>
                Today's Check-ins
              </span>
              <div className="p-2 rounded-3" style={{ background: "rgba(24, 185, 129, 0.1)", color: "#16B981" }}>
                <FiCheckCircle size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="fw-bold mb-0 text-success" style={{ fontSize: "1.75rem" }}>{todaysCheckIns}</h3>
              <span className="badge rounded-pill extra-small px-2 py-0.5" style={{ background: "rgba(24, 185, 129, 0.12)", color: "#16B981" }}>
                Today
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: High Stress */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="p-3.5 px-4 rounded-4 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-semibold text-uppercase tracking-wider" style={{ color: subtextColor, fontSize: "0.75rem" }}>
                High Stress
              </span>
              <div className="p-2 rounded-3" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}>
                <FiTrendingDown size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="fw-bold mb-0 text-danger" style={{ fontSize: "1.75rem" }}>{highStressUsers}</h3>
              <span className="badge rounded-pill extra-small px-2 py-0.5" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#EF4444" }}>
                Needs attention
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN COMPOSITION (LEFT 7/12 & RIGHT 5/12) */}
      <div className="row g-4">
        
        {/* LEFT COLUMN (7/12 WIDE): WELLNESS OVERVIEW CHART & RECENT USERS TABLE */}
        <div className="col-12 col-lg-7">
          <div className="d-flex flex-column gap-4">
            
            {/* 6. WELLNESS ANALYTICS / WELLNESS OVERVIEW CHART CENTERPIECE */}
            <div className="p-4 rounded-4" style={cardStyle}>
              <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4 border-bottom pb-3" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                <div>
                  <h6 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
                    <FiTrendingUp style={{ color: "#6C4CF1" }} /> Wellness Overview
                  </h6>
                  <span className="extra-small" style={{ color: subtextColor }}>
                    Live platform check-in volume and wellness metrics trend
                  </span>
                </div>

                {/* 7 Days | 30 Days | 90 Days Time Controls */}
                <div className="btn-group btn-group-sm p-1 rounded-pill" style={{ background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                  {["7 Days", "30 Days", "90 Days"].map((range) => (
                    <button
                      key={range}
                      type="button"
                      className={`btn btn-sm rounded-pill border-0 extra-small px-3 fw-medium transition-all ${
                        chartRange === range ? "bg-white shadow-sm text-primary fw-bold" : "text-secondary"
                      }`}
                      style={chartRange === range ? { color: "#6C4CF1" } : { color: subtextColor }}
                      onClick={() => setChartRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Chart Visualization Component */}
              <div className="pt-2">
                <div className="d-flex align-items-end justify-content-between gap-3 px-2" style={{ height: "200px" }}>
                  {chartPoints.map((pt, idx) => {
                    const heightPct = Math.max(Math.round((pt.count / maxTrend) * 100), 18);
                    return (
                      <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end position-relative">
                        <span className="extra-small fw-bold mb-1" style={{ color: "#6C4CF1", fontSize: "0.72rem" }}>
                          {pt.count}
                        </span>
                        <div 
                          className="w-100 rounded-top transition-all"
                          style={{ 
                            height: `${heightPct}%`, 
                            background: "linear-gradient(180deg, #6C4CF1 0%, rgba(79, 140, 255, 0.3) 100%)",
                            minWidth: "16px",
                            maxWidth: "38px"
                          }}
                        />
                        <span className="extra-small mt-2 text-truncate" style={{ color: subtextColor, fontSize: "0.7rem" }}>
                          {pt.date?.slice ? pt.date.slice(5) || pt.date : pt.date}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top extra-small" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)", color: subtextColor }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle d-inline-block" style={{ width: "8px", height: "8px", background: "#6C4CF1" }} />
                    <span>Daily Check-ins Volume</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle d-inline-block" style={{ width: "8px", height: "8px", background: "#16B981" }} />
                    <span>Avg Score: <strong>{avgWellnessScore}%</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. RECENT USERS COMPACT TABLE */}
            <div className="p-4 rounded-4" style={cardStyle}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
                  <FiUserCheck style={{ color: "#4F8CFF" }} /> Recent Users
                </h6>
                <button 
                  onClick={() => onNavigateTab("users-students")}
                  className="btn btn-link btn-sm p-0 extra-small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1"
                  style={{ color: "#6C4CF1" }}
                >
                  View All <FiArrowRight size={13} />
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ background: "transparent" }}>
                  <thead>
                    <tr className="extra-small text-uppercase tracking-wider border-bottom" style={{ color: subtextColor, borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                      <th className="fw-bold py-2">User</th>
                      <th className="fw-bold py-2">Role</th>
                      <th className="fw-bold py-2">Status</th>
                      <th className="fw-bold py-2">Joined</th>
                      <th className="fw-bold py-2 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRegistrations.length > 0 ? (
                      recentRegistrations.map((u) => (
                        <tr key={u._id || u.id} className="border-bottom" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)" }}>
                          <td className="py-2.5">
                            <div className="d-flex align-items-center gap-2.5">
                              <div 
                                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold extra-small flex-shrink-0"
                                style={{ 
                                  width: "32px", 
                                  height: "32px",
                                  background: u.role === "Student" ? "linear-gradient(135deg, #4F8CFF, #6C4CF1)" : u.role === "Parent" ? "linear-gradient(135deg, #EC4899, #F43F5E)" : "linear-gradient(135deg, #16B981, #059669)"
                                }}
                              >
                                {(u.fullName || u.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <span className="fw-semibold small d-block text-truncate" style={{ color: titleColor, fontSize: "0.85rem" }}>
                                  {u.fullName || u.name}
                                </span>
                                <span className="extra-small text-truncate d-block" style={{ color: subtextColor, fontSize: "0.72rem" }}>
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5">
                            {renderRoleBadge(u.role)}
                          </td>
                          <td className="py-2.5">
                            {renderStatusBadge()}
                          </td>
                          <td className="py-2.5 extra-small" style={{ color: subtextColor }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                          </td>
                          <td className="py-2.5 text-end">
                            <button
                              onClick={() => onNavigateTab(getRoleTab(u.role))}
                              className="btn btn-sm btn-light py-1 px-2.5 extra-small rounded-pill border fw-semibold"
                              style={{ color: "#6C4CF1", borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.15)", fontSize: "0.75rem" }}
                            >
                              View →
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted small">No registered users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (5/12 WIDE): USER DISTRIBUTION, STRESS MONITOR, ACTIVITY STREAM, QUICK ACTIONS */}
        <div className="col-12 col-lg-5">
          <div className="d-flex flex-column gap-4">
            
            {/* 5. USER DISTRIBUTION BREAKDOWN */}
            <div className="p-4 rounded-4" style={cardStyle}>
              <h6 className="fw-bold mb-3 border-bottom pb-2" style={{ color: titleColor, borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)", fontSize: "1.05rem" }}>
                User Distribution
              </h6>

              <div className="d-flex flex-column gap-3">
                {/* Students Bar */}
                <div>
                  <div className="d-flex align-items-center justify-content-between extra-small fw-semibold mb-1">
                    <span style={{ color: titleColor }}>Students</span>
                    <span style={{ color: "#4F8CFF" }}>{totalStudents} accounts</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${totalUserCount ? Math.max((totalStudents / totalUserCount) * 100, 10) : 25}%`,
                        background: "linear-gradient(90deg, #4F8CFF, #6C4CF1)" 
                      }} 
                    />
                  </div>
                </div>

                {/* Parents Bar */}
                <div>
                  <div className="d-flex align-items-center justify-content-between extra-small fw-semibold mb-1">
                    <span style={{ color: titleColor }}>Parents</span>
                    <span style={{ color: "#EC4899" }}>{totalParents} accounts</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${totalUserCount ? Math.max((totalParents / totalUserCount) * 100, 10) : 20}%`,
                        background: "linear-gradient(90deg, #EC4899, #F43F5E)" 
                      }} 
                    />
                  </div>
                </div>

                {/* Professionals Bar */}
                <div>
                  <div className="d-flex align-items-center justify-content-between extra-small fw-semibold mb-1">
                    <span style={{ color: titleColor }}>Working Professionals</span>
                    <span style={{ color: "#16B981" }}>{totalProfessionals} accounts</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${totalUserCount ? Math.max((totalProfessionals / totalUserCount) * 100, 10) : 15}%`,
                        background: "linear-gradient(90deg, #16B981, #059669)" 
                      }} 
                    />
                  </div>
                </div>

                {/* Senior Citizens Bar */}
                <div>
                  <div className="d-flex align-items-center justify-content-between extra-small fw-semibold mb-1">
                    <span style={{ color: titleColor }}>Senior Citizens</span>
                    <span style={{ color: "#F59E0B" }}>{totalSeniorCitizens} accounts</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${totalUserCount ? Math.max((totalSeniorCitizens / totalUserCount) * 100, 10) : 10}%`,
                        background: "linear-gradient(90deg, #F59E0B, #D97706)" 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 7. STRESS MONITOR PANEL */}
            <div className="p-4 rounded-4" style={cardStyle}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
                  <FiActivity className="text-danger" /> Stress Monitor
                </h6>
                <span className="badge bg-danger bg-opacity-15 text-danger extra-small px-2 py-0.5 rounded-pill">
                  {highStressUsers} Flagged
                </span>
              </div>

              <div className="row g-2 text-center pt-1">
                <div className="col-4">
                  <div className="p-2.5 rounded-3 border" style={{ background: "rgba(24, 185, 129, 0.06)", borderColor: "rgba(24, 185, 129, 0.2)" }}>
                    <div className="extra-small fw-bold text-success mb-1">LOW</div>
                    <span className="fs-5 fw-bold text-success">●</span>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-2.5 rounded-3 border" style={{ background: "rgba(245, 158, 11, 0.06)", borderColor: "rgba(245, 158, 11, 0.2)" }}>
                    <div className="extra-small fw-bold text-warning mb-1">MEDIUM</div>
                    <span className="fs-5 fw-bold text-warning">●</span>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-2.5 rounded-3 border" style={{ background: "rgba(239, 68, 68, 0.06)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                    <div className="extra-small fw-bold text-danger mb-1">HIGH</div>
                    <span className="fs-5 fw-bold text-danger">●</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. RECENT ACTIVITY STREAM (TIMELINE FORMAT) */}
            <div className="p-4 rounded-4" style={cardStyle}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
                  <FiClock style={{ color: "#F59E0B" }} /> Recent Activity
                </h6>
                <span className="extra-small" style={{ color: subtextColor }}>Live Timeline</span>
              </div>

              {recentActivities.length > 0 ? (
                <div className="timeline-stream d-flex flex-column gap-3">
                  {recentActivities.map((log, index) => (
                    <div key={log._id || log.id || index} className="d-flex align-items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <span className="rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: "24px", height: "24px", background: "rgba(108, 76, 241, 0.12)", fontSize: "0.75rem" }}>
                          ●
                        </span>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <span className="fw-semibold small d-block text-truncate" style={{ color: titleColor, fontSize: "0.85rem" }}>
                          User authenticated login
                        </span>
                        <span className="extra-small text-truncate d-block" style={{ color: subtextColor, fontSize: "0.75rem" }}>
                          {log.email}
                        </span>
                      </div>
                      <span className="extra-small flex-shrink-0 ms-2" style={{ color: subtextColor, fontSize: "0.72rem" }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <span className="text-success mt-0.5">●</span>
                    <div>
                      <span className="fw-semibold small d-block" style={{ color: titleColor }}>New user registered</span>
                      <span className="extra-small d-block" style={{ color: subtextColor }}>Account created in system</span>
                    </div>
                    <span className="extra-small ms-auto" style={{ color: subtextColor }}>5m ago</span>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <span className="text-primary mt-0.5">●</span>
                    <div>
                      <span className="fw-semibold small d-block" style={{ color: titleColor }}>Wellness check-in completed</span>
                      <span className="extra-small d-block" style={{ color: subtextColor }}>Student survey submitted</span>
                    </div>
                    <span className="extra-small ms-auto" style={{ color: subtextColor }}>18m ago</span>
                  </div>
                </div>
              )}
            </div>

            {/* 10. QUICK ACTIONS PANEL */}
            <div className="p-4 rounded-4" style={cardStyle}>
              <h6 className="fw-bold mb-3 border-bottom pb-2" style={{ color: titleColor, borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)", fontSize: "1.05rem" }}>
                Quick Actions
              </h6>

              <div className="row g-2">
                <div className="col-6">
                  <button
                    onClick={() => onNavigateTab("users-students")}
                    className="btn btn-outline-primary btn-sm w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1.5 extra-small fw-semibold"
                    style={{ borderColor: "rgba(108, 76, 241, 0.25)", color: "#6C4CF1", background: "rgba(108, 76, 241, 0.04)" }}
                  >
                    <FiPlus size={14} /> Add User
                  </button>
                </div>

                <div className="col-6">
                  <button
                    onClick={() => onNavigateTab("wellness-analytics")}
                    className="btn btn-outline-primary btn-sm w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1.5 extra-small fw-semibold"
                    style={{ borderColor: "rgba(79, 140, 255, 0.25)", color: "#4F8CFF", background: "rgba(79, 140, 255, 0.04)" }}
                  >
                    <FiActivity size={14} /> View Wellness
                  </button>
                </div>

                <div className="col-6">
                  <button
                    onClick={() => onNavigateTab("users-students")}
                    className="btn btn-outline-secondary btn-sm w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1.5 extra-small fw-semibold"
                    style={{ borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)", color: subtextColor }}
                  >
                    <FiUserCheck size={14} /> Manage Students
                  </button>
                </div>

                <div className="col-6">
                  <button
                    onClick={() => onNavigateTab("notifications")}
                    className="btn btn-outline-secondary btn-sm w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1.5 extra-small fw-semibold"
                    style={{ borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)", color: subtextColor }}
                  >
                    <FiBell size={14} /> Broadcast Alerts
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboardOverview;
