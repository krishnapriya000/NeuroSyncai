import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiSettings,
  FiBell,
  FiShield,
  FiLock,
  FiCheckCircle,
  FiSave,
  FiAlertTriangle
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentSettings() {
  const [activeTab, setActiveTab] = useState("settings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");

  const [settings, setSettings] = useState({
    emailAlerts: true,
    weeklyReport: true,
    emergencyAlerts: true,
    theme: "Dark Purple",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [savedSettingsMsg, setSavedSettingsMsg] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSavedSettingsMsg("Settings updated!");
    setTimeout(() => setSavedSettingsMsg(""), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in current and new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPass(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPasswordError(data.message || "Failed to change password.");
        setIsChangingPass(false);
        return;
      }

      setPasswordMsg("🎉 Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setPasswordMsg(""), 4000);
    } catch (err) {
      console.error("Change password error:", err);
      setPasswordError("Server error while updating password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={parentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header */}
        <div className="mb-4">
          <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
            ⚙️ Settings
          </span>
          <h1 className="fw-bold text-white fs-3 mb-1">Parent Account & Safety Settings</h1>
          <p className="text-secondary small mb-0">Manage notification preferences, privacy, child alert thresholds, and security options.</p>
        </div>

        {savedSettingsMsg && (
          <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 mb-4 small">
            {savedSettingsMsg}
          </div>
        )}

        <div className="row g-4 mb-4">
          {/* Notification Preferences */}
          <div className="col-lg-6">
            <div className="p-4 rounded-4 text-white h-100 shadow-sm" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h5 className="fw-bold mb-4 text-white d-flex align-items-center gap-2">
                <FiBell className="text-primary" /> Notification & Safety Alerts
              </h5>

              <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                <div>
                  <div className="fw-semibold text-white small">Emergency Safety Alerts</div>
                  <div className="text-secondary extra-small">Receive urgent alerts if high distress is detected</div>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={settings.emergencyAlerts} onChange={() => handleToggle("emergencyAlerts")} />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                <div>
                  <div className="fw-semibold text-white small">Weekly Family Digest</div>
                  <div className="text-secondary extra-small">Receive weekly mood and screen time summaries</div>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={settings.weeklyReport} onChange={() => handleToggle("weeklyReport")} />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold text-white small">Email Notifications</div>
                  <div className="text-secondary extra-small">Receive emails for important family updates</div>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={settings.emailAlerts} onChange={() => handleToggle("emailAlerts")} />
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password Form */}
          <div className="col-lg-6">
            <div className="p-4 rounded-4 text-white h-100 shadow-sm" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h5 className="fw-bold mb-4 text-white d-flex align-items-center gap-2">
                <FiLock className="text-info" /> Security & Password
              </h5>

              {passwordMsg && <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 mb-3 small">{passwordMsg}</div>}
              {passwordError && <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mb-3 small">{passwordError}</div>}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Current Password</label>
                  <input type="password" className="form-control bg-dark text-white border-secondary border-opacity-25" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">New Password</label>
                  <input type="password" className="form-control bg-dark text-white border-secondary border-opacity-25" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-semibold">Confirm New Password</label>
                  <input type="password" className="form-control bg-dark text-white border-secondary border-opacity-25" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary rounded-pill w-100 py-2 fw-semibold" disabled={isChangingPass}>
                  {isChangingPass ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentSettings;
