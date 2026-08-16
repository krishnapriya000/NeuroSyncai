import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import "../styles/studentDashboard.css";
import {
  FiSettings,
  FiBell,
  FiLock,
  FiCpu,
  FiSliders,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiTrash2,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const DEFAULT_SETTINGS = {
  notifications: {
    studyReminders: true,
    goalReminders: true,
    journalReminders: true,
    focusReminders: true,
    wellnessReminders: true,
    emailNotifications: false,
  },
  ai: {
    enableRecommendations: true,
    personalizedInsights: true,
    companionNotifications: true,
  },
  appearance: {
    darkMode: true,
    compactLayout: false,
  },
  privacy: {
    shareParentData: true,
    aiDataProcessing: true,
  },
};

function StudentSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Settings State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }

    const savedSettings = localStorage.getItem("neurosync_student_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
  }, []);

  const handleToggle = (category, key) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem("neurosync_student_settings", JSON.stringify(settings));
    setToastType("success");
    setToastMessage("Settings saved successfully! ⚙️");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMessage({ type: "danger", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword.length < 6) {
      setPwMessage({ type: "danger", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "danger", text: "New password and Confirm password do not match." });
      return;
    }

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setPwMessage({ type: "danger", text: "Authentication token missing. Please log in again." });
      return;
    }

    setPwSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      setPwSubmitting(false);

      if (!response.ok || !data.success) {
        setPwMessage({ type: "danger", text: data.message || "Failed to change password." });
        return;
      }

      setPwMessage({ type: "success", text: "🎉 Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change Password Error:", err);
      setPwSubmitting(false);
      setPwMessage({ type: "danger", text: "Unable to connect to server. Please try again." });
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem("neurosync_student_settings");
    setSettings(DEFAULT_SETTINGS);
    setToastType("info");
    setToastMessage("Local settings cache cleared and reset to defaults. 🔄");
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        activeTab="settings"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Top Navbar */}
      <TopNavbar
        studentName={studentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="ns-main-content">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#A78BFA",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <FiSettings className="me-1" /> Preferences & Security
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">Settings</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Customize your notification preferences, security, AI options, and system behavior.
            </p>
          </div>

          <button
            type="button"
            className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              border: "none",
            }}
            onClick={handleSaveSettings}
          >
            <FiSave size={18} /> Save Settings
          </button>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div
            className={`alert d-flex align-items-center justify-content-between rounded-4 shadow-sm mb-4 border-0 alert-${toastType}`}
            style={{
              background: toastType === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
              borderLeft: `4px solid ${toastType === "success" ? "#10B981" : "#3B82F6"}`,
              color: toastType === "success" ? "#6EE7B7" : "#93C5FD",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FiCheckCircle size={20} />
              <span className="fw-semibold">{toastMessage}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setToastMessage("")}
            />
          </div>
        )}

        <div className="row g-4">
          {/* LEFT COLUMN */}
          <div className="col-12 col-lg-6">
            {/* 1. NOTIFICATION PREFERENCES CARD */}
            <div className="ns-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiBell className="text-primary" /> Notification Preferences
              </h5>
              <p className="text-muted small mb-4">
                Choose which alerts and reminders you'd like to receive across your dashboard.
              </p>

              <div className="d-flex flex-column gap-3">
                {[
                  { key: "studyReminders", title: "Study Task Reminders", desc: "Alerts for upcoming study deadlines and tasks due today" },
                  { key: "goalReminders", title: "Goal Progress Reminders", desc: "Notifications when approaching target goal dates" },
                  { key: "journalReminders", title: "Journal Reflection Alerts", desc: "Gentle reminders for your daily journaling habit" },
                  { key: "focusReminders", title: "Focus Session Reminders", desc: "Prompt to take study breaks during Pomodoro sessions" },
                  { key: "wellnessReminders", title: "Wellness & Check-in Reminders", desc: "Daily emotional check-in prompts" },
                  { key: "emailNotifications", title: "Email Summary Notifications", desc: "Receive weekly summary reports via email" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3"
                    style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)" }}
                  >
                    <div>
                      <div className="text-white fw-semibold mb-0" style={{ fontSize: "0.92rem" }}>
                        {item.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                        {item.desc}
                      </div>
                    </div>
                    <div className="form-check form-switch ms-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        style={{ cursor: "pointer", width: "42px", height: "22px" }}
                        checked={settings.notifications[item.key]}
                        onChange={() => handleToggle("notifications", item.key)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. AI PREFERENCES CARD */}
            <div className="ns-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiCpu style={{ color: "#A78BFA" }} /> AI Companion & Recommendations
              </h5>
              <p className="text-muted small mb-4">
                Manage how NeuroSync AI generates recommendations and cognitive insights.
              </p>

              <div className="d-flex flex-column gap-3">
                {[
                  { key: "enableRecommendations", title: "Enable AI Recommendations", desc: "Generate smart study and wellness recommendations" },
                  { key: "personalizedInsights", title: "Personalized Progress Analytics", desc: "Compute custom cognitive performance scores" },
                  { key: "companionNotifications", title: "Proactive AI Companion Messages", desc: "Allow AI companion to send encouraging prompts" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3"
                    style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)" }}
                  >
                    <div>
                      <div className="text-white fw-semibold mb-0" style={{ fontSize: "0.92rem" }}>
                        {item.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                        {item.desc}
                      </div>
                    </div>
                    <div className="form-check form-switch ms-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        style={{ cursor: "pointer", width: "42px", height: "22px" }}
                        checked={settings.ai[item.key]}
                        onChange={() => handleToggle("ai", item.key)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-12 col-lg-6">
            {/* 3. SECURITY & CHANGE PASSWORD CARD */}
            <div className="ns-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiLock className="text-success" /> Account Security
              </h5>
              <p className="text-muted small mb-3">
                Update your account password securely.
              </p>

              {pwMessage && (
                <div
                  className={`alert alert-${pwMessage.type} rounded-3 p-3 mb-3 border-0 small`}
                  style={{
                    background: pwMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: pwMessage.type === "success" ? "#6EE7B7" : "#FCA5A5",
                  }}
                >
                  {pwMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label text-white-50 small fw-semibold">Current Password</label>
                  <div className="position-relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      className="form-control text-white rounded-3 pe-5"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link text-white-50 position-absolute end-0 top-50 translate-middle-y text-decoration-none"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      {showCurrentPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50 small fw-semibold">New Password</label>
                  <div className="position-relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      className="form-control text-white rounded-3 pe-5"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link text-white-50 position-absolute end-0 top-50 translate-middle-y text-decoration-none"
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
                      {showNewPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-white-50 small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control text-white rounded-3"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-outline-success w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={pwSubmitting}
                >
                  {pwSubmitting ? (
                    <span className="spinner-border spinner-border-sm me-2" />
                  ) : (
                    <FiLock size={16} />
                  )}
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            {/* 4. APPEARANCE & LAYOUT CARD */}
            <div className="ns-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiSliders className="text-info" /> Appearance & Theme
              </h5>

              <div className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                <div>
                  <div className="text-white fw-semibold mb-0" style={{ fontSize: "0.92rem" }}>
                    Dark Theme
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                    NeuroSync uses a high-contrast dark aesthetic by default
                  </div>
                </div>
                <span className="badge bg-primary px-3 py-1.5 rounded-pill">Active</span>
              </div>

              <div className="p-3 rounded-3 d-flex align-items-center justify-content-between" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                <div>
                  <div className="text-white fw-semibold mb-0" style={{ fontSize: "0.92rem" }}>
                    Compact Dashboard Layout
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                    Reduce padding and card spacing for dense screens
                  </div>
                </div>
                <div className="form-check form-switch ms-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    style={{ cursor: "pointer", width: "42px", height: "22px" }}
                    checked={settings.appearance.compactLayout}
                    onChange={() => handleToggle("appearance", "compactLayout")}
                  />
                </div>
              </div>
            </div>

            {/* 5. PRIVACY & DATA CARD */}
            <div className="ns-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiShield className="text-warning" /> Privacy & Local Data
              </h5>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="p-3 rounded-3 d-flex align-items-center justify-content-between" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div>
                    <div className="text-white fw-semibold mb-0" style={{ fontSize: "0.92rem" }}>
                      Share Insights with Linked Parent/Guardian
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                      Allows guardian to view aggregate wellness progress summaries
                    </div>
                  </div>
                  <div className="form-check form-switch ms-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      style={{ cursor: "pointer", width: "42px", height: "22px" }}
                      checked={settings.privacy.shareParentData}
                      onChange={() => handleToggle("privacy", "shareParentData")}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-3 d-flex align-items-center justify-content-between" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div>
                    <div className="text-white fw-semibold mb-0" style={{ fontSize: "0.92rem" }}>
                      AI Data Processing Consent
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                      Process journal and check-in text for sentiment suggestions
                    </div>
                  </div>
                  <div className="form-check form-switch ms-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      style={{ cursor: "pointer", width: "42px", height: "22px" }}
                      checked={settings.privacy.aiDataProcessing}
                      onChange={() => handleToggle("privacy", "aiDataProcessing")}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-3 py-2 px-3 d-flex align-items-center gap-2"
                onClick={handleClearCache}
              >
                <FiTrash2 size={16} /> Clear Settings Cache
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

export default StudentSettings;
