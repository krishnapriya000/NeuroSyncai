import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiBell,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiShield,
  FiCheck
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentNotifications() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");
  const [filter, setFilter] = useState("all");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Daily Check-in Completed",
      message: "Ananya completed today's daily check-in survey with a 'Calm' mood status.",
      type: "info",
      timestamp: "Today at 04:30 PM",
      read: false,
    },
    {
      id: 2,
      title: "Family Harmony Update",
      message: "Weekly emotional harmony report generated. Family positivity score is at 88%.",
      type: "success",
      timestamp: "Yesterday at 08:00 PM",
      read: false,
    },
    {
      id: 3,
      title: "Screen Time Balance Synchronized",
      message: "Screen time balance logged successfully within optimal daily range.",
      type: "info",
      timestamp: "2 days ago",
      read: true,
    },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredList = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

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
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
              🔔 Notifications
            </span>
            <h1 className="fw-bold text-white fs-3 mb-1">Parent Notifications & Alerts</h1>
            <p className="text-secondary small mb-0">Wellbeing alerts, safety notifications, and account activity updates for your family.</p>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill text-white border-secondary px-3 py-2 d-inline-flex align-items-center gap-2"
            onClick={handleMarkAllRead}
          >
            <FiCheck /> Mark All as Read
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex gap-2 mb-4">
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === "all" ? "btn-primary text-white" : "btn-dark text-secondary border border-secondary border-opacity-25"}`}
            onClick={() => setFilter("all")}
          >
            All Notifications
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === "unread" ? "btn-primary text-white" : "btn-dark text-secondary border border-secondary border-opacity-25"}`}
            onClick={() => setFilter("unread")}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 rounded-4 text-white shadow-sm mb-4" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {filteredList.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <FiBell size={40} className="mb-3 text-secondary opacity-50" />
              <h6 className="fw-bold text-white mb-1">No notifications found</h6>
              <p className="small mb-0">You are all caught up!</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredList.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-3 d-flex align-items-start gap-3 border ${
                    n.read
                      ? "bg-dark bg-opacity-40 border-secondary border-opacity-25 text-white-50"
                      : "bg-indigo-950 bg-opacity-40 border-indigo-500 border-opacity-40 text-white"
                  }`}
                >
                  <div className="mt-1">
                    {n.type === "success" ? (
                      <FiCheckCircle className="text-success fs-5" />
                    ) : n.type === "warning" ? (
                      <FiAlertTriangle className="text-warning fs-5" />
                    ) : (
                      <FiInfo className="text-info fs-5" />
                    )}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="fw-bold mb-1 text-white fs-6">{n.title}</h6>
                      <span className="text-secondary extra-small">{n.timestamp}</span>
                    </div>
                    <p className="small mb-0 text-secondary">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentNotifications;
