import React, { useState } from "react";
import { FiBell, FiSend, FiUsers, FiClock, FiCheckCircle, FiTrash2, FiPieChart, FiBarChart2 } from "react-icons/fi";

function AdminNotifications() {
  const [targetRole, setTargetRole] = useState("All Users");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  // Notification History log
  const [history, setHistory] = useState([
    {
      id: "notif-1",
      title: "Daily Wellness Survey Reminder",
      message: "Don't forget to take 1 minute to complete your Daily Check-in Survey and update your mood score!",
      target: "Students",
      sentAt: "2026-08-01 09:30 AM",
      count: 42,
    },
    {
      id: "notif-2",
      title: "System Maintenance Completed",
      message: "NeuroSync database optimization and security updates are complete. All services running smoothly.",
      target: "All Users",
      sentAt: "2026-07-31 06:00 PM",
      count: 128,
    },
    {
      id: "notif-3",
      title: "Parent Portal Weekly Digest",
      message: "Weekly study progress reports for your linked students are now available on your Parent Dashboard.",
      target: "Parents",
      sentAt: "2026-07-30 10:15 AM",
      count: 18,
    },
  ]);

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      target: targetRole,
      sentAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      count: targetRole === "All Users" ? 150 : targetRole === "Students" ? 65 : 25,
    };

    setHistory([newNotif, ...history]);
    setTitle("");
    setMessage("");
    setSuccessBanner(`🎉 Notification broadcasted successfully to "${targetRole}"!`);

    setTimeout(() => {
      setSuccessBanner("");
    }, 4000);
  };

  const deleteNotificationLog = (id) => {
    if (window.confirm("Are you sure you want to remove this notification record from history?")) {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Broadcast Analytics
  const targetDistribution = [
    { label: "Students", pct: 45, count: 65, color: "#7C5CFC" },
    { label: "All Users (Global)", pct: 30, count: 150, color: "#4F8CFF" },
    { label: "Parents", pct: 15, count: 25, color: "#06B6D4" },
    { label: "Seniors & Professionals", pct: 10, count: 18, color: "#F59E0B" },
  ];

  const categoryBarData = [
    { type: "Wellness Reminders", count: 38, pct: 85 },
    { type: "System Alerts", count: 22, pct: 55 },
    { type: "Weekly Digests", count: 16, pct: 40 },
    { type: "Feature Updates", count: 12, pct: 30 },
  ];

  return (
    <div className="admin-notifications-section" style={{ maxWidth: "1500px", margin: "0 auto" }}>
      {/* Header */}
      <div className="p-4 rounded-4 mb-4 bg-white border shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <FiBell className="text-warning" /> System Broadcast & Push Notifications
        </h4>
        <p className="text-secondary small mb-0">
          Broadcast announcement alerts and push notifications to targeted user roles
        </p>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="alert alert-success border-0 bg-success bg-opacity-15 text-success rounded-3 d-flex align-items-center gap-2 mb-4 fw-semibold">
          <FiCheckCircle size={20} />
          <div>{successBanner}</div>
        </div>
      )}

      {/* VISUAL CHARTS ROW: TARGET DONUT CHART + BROADCAST ACTIVITY BAR CHART */}
      <div className="row g-4 mb-4">
        {/* 1. TARGET AUDIENCE DONUT CHART */}
        <div className="col-12 col-lg-5">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: "#F1F5F9" }}>
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                <FiPieChart style={{ color: "#7C5CFC" }} /> Notification Target Audience
              </h6>
              <span className="extra-small text-secondary fw-semibold">Distribution</span>
            </div>

            <div className="d-flex flex-column align-items-center justify-content-center py-2">
              <div className="position-relative d-flex align-items-center justify-content-center mb-3">
                <svg width="150" height="150" viewBox="0 0 42 42" className="donut-svg">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F1F5F9" strokeWidth="4.5" />
                  {/* Segment 1: Students 45% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#7C5CFC"
                    strokeWidth="4.5"
                    strokeDasharray="45 55"
                    strokeDashoffset="25"
                  />
                  {/* Segment 2: All Users 30% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#4F8CFF"
                    strokeWidth="4.5"
                    strokeDasharray="30 70"
                    strokeDashoffset="-20"
                  />
                  {/* Segment 3: Parents 15% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#06B6D4"
                    strokeWidth="4.5"
                    strokeDasharray="15 85"
                    strokeDashoffset="-50"
                  />
                  {/* Segment 4: Seniors 10% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    strokeDasharray="10 90"
                    strokeDashoffset="-65"
                  />
                </svg>
                <div className="position-absolute text-center">
                  <span className="fw-bold d-block text-dark lh-1" style={{ fontSize: "1.25rem" }}>45%</span>
                  <span className="extra-small text-secondary" style={{ fontSize: "0.68rem" }}>Students</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="w-100 d-flex flex-column gap-2">
                {targetDistribution.map((item, idx) => (
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

        {/* 2. BROADCAST TYPE ACTIVITY BAR CHART */}
        <div className="col-12 col-lg-7">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: "#F1F5F9" }}>
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                <FiBarChart2 style={{ color: "#4F8CFF" }} /> Broadcast Volume by Category
              </h6>
              <span className="extra-small text-secondary fw-semibold">Delivered Messages</span>
            </div>

            <div className="d-flex flex-column gap-3 py-2">
              {categoryBarData.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{item.type}</span>
                    <span className="extra-small fw-bold text-secondary">{item.count} Sent ({item.pct}%)</span>
                  </div>
                  <div className="progress" style={{ height: "10px", background: "#F1F5F9" }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${item.pct}%`, 
                        background: idx === 0 ? "linear-gradient(90deg, #7C5CFC, #4F8CFF)" : idx === 1 ? "linear-gradient(90deg, #F59E0B, #D97706)" : idx === 2 ? "linear-gradient(90deg, #06B6D4, #0891B2)" : "linear-gradient(90deg, #10B981, #059669)",
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
        {/* Send Notification Form */}
        <div className="col-12 col-lg-5">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
              <FiSend className="text-primary" /> Create & Broadcast Notification
            </h5>

            <form onSubmit={handleSendNotification}>
              {/* Target Role Dropdown */}
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Target Audience / Role</label>
                <select 
                  className="form-select bg-white text-dark border-secondary border-opacity-25"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{ fontSize: "0.88rem" }}
                >
                  <option value="All Users">📢 All Users (Global Broadcast)</option>
                  <option value="Students">🎓 Students</option>
                  <option value="Parents">👨‍👩‍👧 Parents</option>
                  <option value="Working Professionals">💼 Working Professionals</option>
                  <option value="Senior Citizens">👴 Senior Citizens</option>
                </select>
              </div>

              {/* Title */}
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Notification Title</label>
                <input 
                  type="text" 
                  className="form-control bg-white text-dark border-secondary border-opacity-25"
                  placeholder="e.g. Daily Survey Reminder"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Message Body</label>
                <textarea 
                  rows="4" 
                  className="form-control bg-white text-dark border-secondary border-opacity-25"
                  placeholder="Type announcement message to broadcast..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn text-white w-100 rounded-pill py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ background: "linear-gradient(135deg, #7C5CFC, #4F8CFF)", border: "none" }}
              >
                <FiSend /> Broadcast Notification
              </button>
            </form>
          </div>
        </div>

        {/* Notification History Log */}
        <div className="col-12 col-lg-7">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: "#E2E8F0" }}>
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
                <FiClock style={{ color: "#7C5CFC" }} /> Broadcast History Log ({history.length})
              </h5>
              <span className="extra-small text-secondary fw-semibold">Delivered Messages</span>
            </div>

            {history.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-3 border position-relative transition-all"
                    style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.92rem" }}>{item.title}</h6>
                      <span className="px-2.5 py-0.5 rounded-pill extra-small fw-bold" style={{ background: "rgba(124, 92, 252, 0.12)", color: "#7C5CFC" }}>
                        🎯 {item.target}
                      </span>
                    </div>

                    <p className="text-secondary small mb-2" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>{item.message}</p>

                    <div className="d-flex align-items-center justify-content-between text-secondary extra-small border-top pt-2" style={{ borderColor: "#E2E8F0", fontSize: "0.76rem" }}>
                      <span>🕒 Sent: {item.sentAt} • Delivered to <strong>{item.count} users</strong></span>
                      <button 
                        onClick={() => deleteNotificationLog(item.id)} 
                        className="btn btn-link text-danger p-0 border-0 text-decoration-none extra-small"
                        style={{ fontSize: "0.76rem" }}
                      >
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-secondary py-5 small">
                No notification broadcast logs recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminNotifications;
