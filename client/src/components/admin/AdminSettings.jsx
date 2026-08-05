import React, { useState } from "react";
import { FiSettings, FiUser, FiLock, FiShield, FiSave, FiLogOut, FiCheckCircle } from "react-icons/fi";

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

  return (
    <div className="admin-settings-section">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiSettings className="text-primary" /> Admin Settings & Preferences
          </h4>
          <p className="text-secondary small mb-0">
            Manage admin account profile, change security password, and configure system settings
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 d-flex align-items-center gap-2 mb-4">
          <FiCheckCircle size={20} />
          <div>{successMsg}</div>
        </div>
      )}

      <div className="row g-4">
        {/* 1. Admin Profile Card */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 text-white shadow-sm h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
              <FiUser className="text-info" /> Admin Profile
            </h5>

            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Full Name</label>
                <input 
                  type="text"
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Email Address (Read-Only)</label>
                <input 
                  type="email"
                  className="form-control bg-dark text-white-50 border-secondary border-opacity-25"
                  value={profileData.email}
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">System Role</label>
                <input 
                  type="text"
                  className="form-control bg-dark text-white-50 border-secondary border-opacity-25"
                  value={profileData.role}
                  disabled
                />
              </div>

              <button type="submit" className="btn btn-outline-light rounded-pill px-4 btn-sm d-flex align-items-center gap-2">
                <FiSave /> Update Profile
              </button>
            </form>
          </div>
        </div>

        {/* 2. Change Password Card */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 text-white shadow-sm h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
              <FiLock className="text-warning" /> Change Admin Password
            </h5>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Current Password</label>
                <input 
                  type="password"
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">New Password</label>
                <input 
                  type="password"
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Confirm New Password</label>
                <input 
                  type="password"
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-outline-warning rounded-pill px-4 btn-sm d-flex align-items-center gap-2">
                <FiLock /> Change Password
              </button>
            </form>
          </div>
        </div>

        {/* 3. System Settings Card */}
        <div className="col-12 col-lg-8">
          <div className="p-4 rounded-4 text-white shadow-sm" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
              <FiShield className="text-success" /> System Settings & Controls
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
                <label className="form-check-label text-white small ms-2" htmlFor="maintMode">
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
                <label className="form-check-label text-white small ms-2" htmlFor="emailVerif">
                  Require Email Verification for New User Registrations
                </label>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label text-secondary small">Daily Survey Limit (Per User)</label>
                  <input 
                    type="number" 
                    className="form-control bg-dark text-white border-secondary border-opacity-25"
                    value={sysSettings.surveyCheckInDailyLimit}
                    onChange={(e) => setSysSettings({ ...sysSettings, surveyCheckInDailyLimit: Number(e.target.value) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small">JWT Session Expiry (Hours)</label>
                  <input 
                    type="number" 
                    className="form-control bg-dark text-white border-secondary border-opacity-25"
                    value={sysSettings.jwtSessionExpiryHours}
                    onChange={(e) => setSysSettings({ ...sysSettings, jwtSessionExpiryHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-outline-success rounded-pill px-4 btn-sm d-flex align-items-center gap-2">
                <FiSave /> Save System Settings
              </button>
            </form>
          </div>
        </div>

        {/* 4. Logout Card */}
        <div className="col-12 col-lg-4">
          <div className="p-4 rounded-4 text-white shadow-sm h-100 d-flex flex-column justify-content-between" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div>
              <h5 className="fw-bold mb-2 text-danger d-flex align-items-center gap-2">
                <FiLogOut /> Admin Session
              </h5>
              <p className="text-secondary small mb-3">
                Log out of the NeuroSync Admin Panel securely. You will need to log back in with admin credentials.
              </p>
            </div>

            <button onClick={onLogout} className="btn btn-danger w-100 rounded-pill py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2">
              <FiLogOut /> Log Out Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminSettings;
