import React, { useState } from "react";
import { FiBell, FiSend, FiUsers, FiClock, FiCheckCircle, FiTrash2, FiMessageCircle } from "react-icons/fi";

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

  return (
    <div className="admin-notifications-section">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiBell className="text-warning" /> System Broadcast Notifications
          </h4>
          <p className="text-secondary small mb-0">
            Broadcast announcement alerts and push notifications to targeted user roles
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 d-flex align-items-center gap-2 mb-4">
          <FiCheckCircle size={20} />
          <div>{successBanner}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Send Notification Form */}
        <div className="col-12 col-lg-5">
          <div 
            className="p-4 rounded-4 text-white shadow-sm h-100"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
              <FiSend className="text-primary" /> Send New Notification
            </h5>

            <form onSubmit={handleSendNotification}>
              {/* Target Role Dropdown */}
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Target Audience / Role</label>
                <select 
                  className="form-select bg-dark text-white border-secondary border-opacity-25"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
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
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  placeholder="e.g. Daily Survey Reminder"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Message Body</label>
                <textarea 
                  rows="4" 
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  placeholder="Type announcement message to broadcast..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-100 rounded-pill py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{ background: "linear-gradient(135deg, #7B2FF7, #2D8CFF)", border: "none" }}
              >
                <FiSend /> Broadcast Notification
              </button>
            </form>
          </div>
        </div>

        {/* Notification History Log */}
        <div className="col-12 col-lg-7">
          <div 
            className="p-4 rounded-4 text-white shadow-sm h-100"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <FiClock className="text-info" /> Broadcast History Log ({history.length})
              </h5>
              <span className="text-secondary extra-small">Delivered Notifications</span>
            </div>

            {history.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-20 position-relative"
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className="fw-bold text-white mb-0">{item.title}</h6>
                      <span className="badge bg-primary bg-opacity-20 text-info border border-info border-opacity-30 extra-small px-2.5 py-1 rounded-pill">
                        🎯 {item.target}
                      </span>
                    </div>

                    <p className="text-secondary small mb-2">{item.message}</p>

                    <div className="d-flex align-items-center justify-content-between text-secondary extra-small border-top border-secondary border-opacity-25 pt-2">
                      <span>🕒 Sent: {item.sentAt} • Delivered to <strong>{item.count} users</strong></span>
                      <button 
                        onClick={() => deleteNotificationLog(item.id)} 
                        className="btn btn-link text-danger p-0 border-0 text-decoration-none extra-small"
                      >
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-secondary py-5">
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
