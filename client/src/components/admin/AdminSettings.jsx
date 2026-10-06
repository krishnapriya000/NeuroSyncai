import React, { useState } from "react";
import { FiSettings, FiUser, FiLock, FiShield, FiSave, FiLogOut, FiCheckCircle, FiPieChart, FiBarChart2 } from "react-icons/fi";

function AdminSettings({ currentUser, onLogout }) {
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || "System Admin",
    email: currentUser?.email || "admin@neurosync.ai",
    role: "System Administrator",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [sysSettings, setSysSettings] = useState({
    maintenanceMode: false,
    requireEmailVerification: true,
    surveyCheckInDailyLimit: 1,
    jwtSessionExpiryHours: 24,
  });

  const [successMsg, setSuccessMsg] = useState("");

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("🎉 Admin profile details updated successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSuccessMsg("🔒 Password changed successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("⚙️ System configuration saved!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // System Health Analytics
  const securityMetrics = [
    { label: "Email Verified", pct: 94, color: "#10B981" },
    { label: "2FA Active", pct: 85, color: "#7C5CFC" },
    { label: "Role Authenticated", pct: 100, color: "#06B6D4" },
  ];

  const serverPerformance = [
    { component: "API Gateway", latency: "18ms", uptime: 99.9, pct: 99 },
    { component: "MongoDB Cluster", latency: "12ms", uptime: 99.8, pct: 98 },
    { component: "Auth Microservice", latency: "24ms", uptime: 100.0, pct: 100 },
    { component: "AI Survey Processing", latency: "45ms", uptime: 99.5, pct: 95 },
  ];

  return (
    <div className="admin-settings-section" style={{ maxWidth: "1500px", margin: "0 auto" }}>
      {/* Header */}
      <div className="p-4 rounded-4 mb-4 bg-white border shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <FiSettings className="text-primary" /> System Settings & Configuration
        </h4>
        <p className="text-secondary small mb-0">
          Manage admin account profile, change security password, and monitor platform infrastructure health
        </p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="alert alert-success border-0 bg-success bg-opacity-15 text-success rounded-3 d-flex align-items-center gap-2 mb-4 fw-semibold">
          <FiCheckCircle size={20} />
          <div>{successMsg}</div>
        </div>
      )}

      {/* VISUAL CHARTS ROW: SECURITY DONUT CHART + SYSTEM PERFORMANCE BAR CHART */}
      <div className="row g-4 mb-4">
        {/* 1. SECURITY & ACCESS DONUT CHART */}
        <div className="col-12 col-lg-5">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: "#F1F5F9" }}>
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                <FiPieChart style={{ color: "#10B981" }} /> Security & Authentication Index
              </h6>
              <span className="extra-small text-secondary fw-semibold">System Health</span>
            </div>

            <div className="d-flex flex-column align-items-center justify-content-center py-2">
              <div className="position-relative d-flex align-items-center justify-content-center mb-3">
                <svg width="150" height="150" viewBox="0 0 42 42" className="donut-svg">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F1F5F9" strokeWidth="4.5" />
                  {/* Segment 1: Email Verified 94% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray="94 6"
                    strokeDashoffset="25"
                  />
                  {/* Segment 2: 2FA Active 85% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#7C5CFC"
                    strokeWidth="4.5"
                    strokeDasharray="85 15"
                    strokeDashoffset="-20"
                  />
                </svg>
                <div className="position-absolute text-center">
                  <span className="fw-bold d-block text-dark lh-1" style={{ fontSize: "1.25rem" }}>99.9%</span>
                  <span className="extra-small text-secondary" style={{ fontSize: "0.68rem" }}>Uptime</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="w-100 d-flex flex-column gap-2">
                {securityMetrics.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ background: "#F8FAFC" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: item.color }} />
                      <span className="small fw-semibold text-dark" style={{ fontSize: "0.82rem" }}>{item.label}</span>
                    </div>
                    <span className="extra-small fw-bold text-dark">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. SERVER PERFORMANCE BAR CHART */}
        <div className="col-12 col-lg-7">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: "#F1F5F9" }}>
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                <FiBarChart2 style={{ color: "#06B6D4" }} /> Infrastructure Service Uptime & Latency
              </h6>
              <span className="extra-small text-secondary fw-semibold">Real-time Metrics</span>
            </div>

            <div className="d-flex flex-column gap-3 py-2">
              {serverPerformance.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{item.component}</span>
                    <span className="extra-small fw-bold text-secondary">Latency: {item.latency} • Uptime: {item.uptime}%</span>
                  </div>
                  <div className="progress" style={{ height: "10px", background: "#F1F5F9" }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${item.pct}%`, 
                        background: idx === 0 ? "linear-gradient(90deg, #10B981, #059669)" : idx === 1 ? "linear-gradient(90deg, #7C5CFC, #4F8CFF)" : idx === 2 ? "linear-gradient(90deg, #06B6D4, #0891B2)" : "linear-gradient(90deg, #F59E0B, #D97706)",
                        transition: "width 0.6s ease" 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 1. Admin Profile Card */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
              <FiUser className="text-info" /> Admin Profile Information
            </h5>

            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Full Name</label>
                <input 
                  type="text"
                  className="form-control bg-white text-dark border-secondary border-opacity-25"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Email Address (Read-Only)</label>
                <input 
                  type="email"
                  className="form-control bg-light text-secondary border-secondary border-opacity-25"
                  value={profileData.email}
                  disabled
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">System Role</label>
                <input 
                  type="text"
                  className="form-control bg-light text-secondary border-secondary border-opacity-25"
                  value={profileData.role}
                  disabled
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              <button type="submit" className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-semibold d-flex align-items-center gap-2">
                <FiSave /> Update Profile Details
              </button>
            </form>
          </div>
        </div>

        {/* 2. Change Password Card */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
              <FiLock className="text-warning" /> Change Admin Password
            </h5>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Current Password</label>
                <input 
                  type="password"
                  className="form-control bg-white text-dark border-secondary border-opacity-25"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">New Password</label>
                <input 
                  type="password"
                  className="form-control bg-white text-dark border-secondary border-opacity-25"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Confirm New Password</label>
                <input 
                  type="password"
                  className="form-control bg-white text-dark border-secondary border-opacity-25"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              <button type="submit" className="btn btn-outline-warning rounded-pill px-4 btn-sm fw-semibold d-flex align-items-center gap-2">
                <FiLock /> Change Password
              </button>
            </form>
          </div>
        </div>

        {/* 3. System Settings Card */}
        <div className="col-12 col-lg-8">
          <div className="p-4 rounded-4 bg-white border shadow-sm" style={{ borderColor: "#E2E8F0" }}>
            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
              <FiShield className="text-success" /> Security Controls & Platform Configuration
            </h5>

            <form onSubmit={handleSettingsSubmit}>
              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox"
                  id="maintMode"
                  checked={sysSettings.maintenanceMode}
                  onChange={(e) => setSysSettings({ ...sysSettings, maintenanceMode: e.target.checked })}
                />
                <label className="form-check-label text-dark small ms-2 fw-medium" htmlFor="maintMode">
                  Enable Maintenance Mode (Restricts non-admin access)
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox"
                  id="emailVerif"
                  checked={sysSettings.requireEmailVerification}
                  onChange={(e) => setSysSettings({ ...sysSettings, requireEmailVerification: e.target.checked })}
                />
                <label className="form-check-label text-dark small ms-2 fw-medium" htmlFor="emailVerif">
                  Require Email Verification for New User Registrations
                </label>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label text-secondary small fw-semibold">Daily Survey Limit (Per User)</label>
                  <input 
                    type="number" 
                    className="form-control bg-white text-dark border-secondary border-opacity-25"
                    value={sysSettings.surveyCheckInDailyLimit}
                    onChange={(e) => setSysSettings({ ...sysSettings, surveyCheckInDailyLimit: Number(e.target.value) })}
                    style={{ fontSize: "0.88rem" }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small fw-semibold">JWT Session Expiry (Hours)</label>
                  <input 
                    type="number" 
                    className="form-control bg-white text-dark border-secondary border-opacity-25"
                    value={sysSettings.jwtSessionExpiryHours}
                    onChange={(e) => setSysSettings({ ...sysSettings, jwtSessionExpiryHours: Number(e.target.value) })}
                    style={{ fontSize: "0.88rem" }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-outline-success rounded-pill px-4 btn-sm fw-semibold d-flex align-items-center gap-2">
                <FiSave /> Save System Configuration
              </button>
            </form>
          </div>
        </div>

        {/* 4. Logout Card */}
        <div className="col-12 col-lg-4">
          <div className="p-4 rounded-4 bg-white border border-danger border-opacity-25 shadow-sm h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold mb-2 text-danger d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
                <FiLogOut /> Admin Session
              </h5>
              <p className="text-secondary small mb-3" style={{ fontSize: "0.85rem" }}>
                Log out of the NeuroSync Admin Panel securely. You will need to log back in with admin credentials.
              </p>
            </div>

            <button onClick={onLogout} className="btn btn-danger w-100 rounded-pill py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm">
              <FiLogOut /> Log Out Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminSettings;
