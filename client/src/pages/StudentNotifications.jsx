import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import "../styles/studentDashboard.css";
import {
  FiBell,
  FiCalendar,
  FiTarget,
  FiSmile,
  FiBookOpen,
  FiClock,
  FiCpu,
  FiSettings,
  FiCheckCircle,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";

// Category icon helper
const getCategoryIcon = (category) => {
  switch (category) {
    case "Study":
      return <FiCalendar className="text-primary" />;
    case "Goals":
      return <FiTarget className="text-success" />;
    case "Wellness":
      return <FiSmile className="text-info" />;
    case "Journal":
      return <FiBookOpen className="text-warning" />;
    case "Focus":
      return <FiClock style={{ color: "#c084fc" }} />;
    case "AI Insights":
      return <FiCpu style={{ color: "#a855f7" }} />;
    case "System":
    default:
      return <FiSettings className="text-muted" />;
  }
};

// Relative time formatter
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function StudentNotifications() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  const [activeFilter, setActiveFilter] = useState("All"); // All | Unread | Study | Goals | Wellness | Journal | Focus | AI Insights | System
  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationState, setNotificationState] = useState({
    loading: true,
    error: null,
    data: [],
  });

  const categories = [
    "All",
    "Unread",
    "Study",
    "Goals",
    "Wellness",
    "Journal",
    "Focus",
    "AI Insights",
    "System",
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const fetchNotifications = async (catFilter = activeFilter) => {
    setNotificationState((prev) => ({ ...prev, loading: true, error: null }));
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setNotificationState({
        loading: false,
        error: "Authentication token missing.",
        data: [],
      });
      return;
    }

    try {
      const url = `http://localhost:5000/api/notifications?category=${catFilter === "All" ? "" : catFilter}&limit=50`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setNotificationState({
          loading: false,
          error: json.message || "Failed to fetch notifications.",
          data: [],
        });
        return;
      }

      setNotificationState({
        loading: false,
        error: null,
        data: json.data || [],
      });
      setUnreadCount(json.unreadCount || 0);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
      setNotificationState({
        loading: false,
        error: "Unable to connect to server. Please check your connection.",
        data: [],
      });
    }
  };

  useEffect(() => {
    fetchNotifications(activeFilter);
  }, [activeFilter]);

  const handleFilterClick = (cat) => {
    setActiveFilter(cat);
  };

  const handleMarkAsRead = async (id, link, isRead) => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    if (!isRead) {
      // Optimistically update UI
      setNotificationState((prev) => ({
        ...prev,
        data: prev.data.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      }));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Mark Read Error:", err);
      }
    }

    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    // Optimistically update UI
    setNotificationState((prev) => ({
      ...prev,
      data: prev.data.map((n) => ({ ...n, isRead: true })),
    }));
    setUnreadCount(0);

    try {
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Mark All Read Error:", err);
    }
  };

  const handleDeleteNotification = async (e, id, isRead) => {
    e.stopPropagation(); // prevent triggering click navigation
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    // Optimistically remove from state
    setNotificationState((prev) => ({
      ...prev,
      data: prev.data.filter((n) => n._id !== id),
    }));
    if (!isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Delete Notification Error:", err);
    }
  };

  const { loading, error, data } = notificationState;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        activeTab="notifications"
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
        {/* 1. HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                <FiBell className="text-primary" /> Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="badge rounded-pill bg-primary px-3 py-1" style={{ fontSize: "0.82rem" }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.92rem" }}>
              Stay updated with your study, goals, wellness and personal progress.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary text-white-50 btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={{ fontSize: "0.85rem" }}
            >
              <FiCheckCircle className="text-success" /> Mark all as read
            </button>
            <button
              className="btn btn-dark btn-sm rounded-circle p-2 border-secondary border-opacity-25 text-white-50"
              onClick={() => fetchNotifications(activeFilter)}
              title="Refresh Notifications"
            >
              <FiRefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* 2. CATEGORY FILTERS */}
        <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-2" style={{ scrollbarWidth: "thin" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold text-nowrap ${
                activeFilter === cat
                  ? "btn-primary text-white shadow-sm"
                  : "btn-outline-secondary text-white-50 border-secondary border-opacity-25"
              }`}
              style={{ fontSize: "0.84rem" }}
              onClick={() => handleFilterClick(cat)}
            >
              {cat === "All" ? "All Notifications" : cat}
            </button>
          ))}
        </div>

        {/* 3. LOADING STATE */}
        {loading && (
          <div className="d-flex flex-column gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ns-card p-3 rounded-4 border border-secondary border-opacity-25 opacity-75">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-secondary bg-opacity-20 p-3 placeholder-wave" style={{ width: "42px", height: "42px" }} />
                  <div className="flex-grow-1">
                    <div className="bg-secondary bg-opacity-30 rounded mb-2" style={{ width: "40%", height: "16px" }} />
                    <div className="bg-secondary bg-opacity-20 rounded" style={{ width: "75%", height: "14px" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. ERROR STATE */}
        {!loading && error && (
          <div className="ns-card p-4 text-center my-4 border-danger border-opacity-50">
            <FiAlertCircle size={40} className="text-danger mb-2" />
            <h5 className="text-white fw-bold mb-2">Unable to load notifications</h5>
            <p className="text-muted mb-3">{error}</p>
            <button className="ns-btn-primary px-4 py-2" onClick={() => fetchNotifications(activeFilter)}>
              <FiRefreshCw className="me-2" /> Retry
            </button>
          </div>
        )}

        {/* 5. NOTIFICATION LIST & EMPTY STATE */}
        {!loading && !error && (
          <>
            {data.length === 0 ? (
              <div className="ns-card p-5 text-center my-4 border-secondary border-opacity-25">
                <div className="p-3 rounded-circle bg-dark bg-opacity-50 d-inline-block mb-3 border border-secondary border-opacity-25">
                  <FiCheckCircle size={48} className="text-success" />
                </div>
                <h4 className="text-white fw-bold mb-1">You're all caught up! 🎉</h4>
                <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
                  No new notifications right now in this category.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 mb-4">
                {data.map((item) => (
                  <div
                    key={item._id}
                    className={`ns-card p-3 rounded-4 transition-all position-relative ${
                      !item.isRead
                        ? "border-primary border-opacity-50"
                        : "border-secondary border-opacity-25 opacity-85"
                    }`}
                    style={{
                      background: !item.isRead
                        ? "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)"
                        : "rgba(15, 23, 42, 0.5)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleMarkAsRead(item._id, item.link, item.isRead)}
                  >
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div className="d-flex align-items-start gap-3 flex-grow-1 overflow-hidden">
                        {/* Category Icon Circle */}
                        <div
                          className="rounded-circle p-2.5 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "44px",
                            height: "44px",
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            fontSize: "1.2rem",
                          }}
                        >
                          {getCategoryIcon(item.category)}
                        </div>

                        {/* Title & Content */}
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <h6 className={`mb-0 fw-bold ${!item.isRead ? "text-white" : "text-white-50"}`} style={{ fontSize: "0.95rem" }}>
                              {item.title}
                            </h6>
                            {!item.isRead && (
                              <span className="p-1 bg-primary rounded-circle" style={{ width: "8px", height: "8px" }} title="Unread" />
                            )}
                            {item.priority === "High" && (
                              <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30 px-2 py-0.5" style={{ fontSize: "0.7rem" }}>
                                High Priority
                              </span>
                            )}
                            <span className="badge bg-dark text-muted border border-secondary border-opacity-25 px-2 py-0.5 ms-auto" style={{ fontSize: "0.72rem" }}>
                              {item.category}
                            </span>
                          </div>

                          <p className="text-white-50 mb-1 text-break" style={{ fontSize: "0.88rem", lineHeight: "1.45" }}>
                            {item.message}
                          </p>

                          <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: "0.78rem" }}>
                            <span>{formatRelativeTime(item.createdAt)}</span>
                            {item.link && <span className="text-primary">Click to view →</span>}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        className="btn text-white-50 p-1 rounded hover-bg-dark border-0 ms-2"
                        onClick={(e) => handleDeleteNotification(e, item._id, item.isRead)}
                        title="Dismiss notification"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

export default StudentNotifications;
