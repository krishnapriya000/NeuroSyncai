import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Import Custom Modular Components
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminDashboardOverview from "../components/admin/AdminDashboardOverview";
import AdminManageStudents from "../components/admin/AdminManageStudents";
import AdminManageParents from "../components/admin/AdminManageParents";
import AdminManageProfessionals from "../components/admin/AdminManageProfessionals";
import AdminManageSeniors from "../components/admin/AdminManageSeniors";
import AdminWellnessAnalytics from "../components/admin/AdminWellnessAnalytics";
import AdminFeedback from "../components/admin/AdminFeedback";
import AdminNotifications from "../components/admin/AdminNotifications";
import AdminSettings from "../components/admin/AdminSettings";

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active Tab: "dashboard" | "users-students" | "users-parents" | "users-professionals" | "users-seniors" | "wellness-analytics" | "feedback" | "notifications" | "settings"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard Data State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [wellnessAnalytics, setWellnessAnalytics] = useState(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("neurosync_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage({ type: "", text: "" });
    }, 4000);
  };

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }, [getHeaders]);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  }, [getHeaders]);

  // Fetch Login Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/logins", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Fetch logs error:", err);
    }
  }, [getHeaders]);

  // Fetch Wellness Analytics Summary
  const fetchWellness = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/wellness-analytics", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setWellnessAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Fetch wellness analytics error:", err);
    }
  }, [getHeaders]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchLogs(), fetchWellness()]);
    setLoading(false);
  }, [fetchStats, fetchUsers, fetchLogs, fetchWellness]);

  // Initial authentication check & data load
  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role !== "Admin") {
          navigate("/");
          return;
        }
        setCurrentUser(u);
      } catch (e) {
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    loadAllData();
  }, [navigate, loadAllData]);

  // Delete User Handler
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete the account "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `User ${userEmail} deleted successfully.`);
        fetchUsers();
        fetchStats();
      } else {
        showToast("error", data.message || "Failed to delete user.");
      }
    } catch (err) {
      showToast("error", "Server connection error while deleting user.");
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("neurosync_current_user");
    localStorage.removeItem("neurosync_token");
    navigate("/login");
  };

  // Dynamic Page Title
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard Overview";
      case "users-students":
        return "Manage Students";
      case "users-parents":
        return "Manage Parents";
      case "users-professionals":
        return "Manage Working Professionals";
      case "users-seniors":
        return "Manage Senior Citizens";
      case "wellness-analytics":
        return "Wellness Analytics";
      case "feedback":
        return "User Feedback";
      case "notifications":
        return "Broadcast Notifications";
      case "settings":
        return "Admin Settings";
      default:
        return "Admin Portal";
    }
  };

  return (
    <div className="admin-dashboard-layout" style={{ minHeight: "100vh", background: "#030712", color: "#f8fafc" }}>
      {/* Background Ambient Glows */}
      <div className="bg-ambient-glow" />
      <div className="bg-ambient-secondary" />

      {/* 1. FIXED COLLAPSIBLE SIDEBAR */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 2. MAIN CONTENT AREA (Offset by sidebar width on large screens) */}
      <div className="admin-main-wrapper flex-grow-1" style={{ marginLeft: "270px" }}>
        
        {/* TOP HEADER */}
        <AdminHeader 
          currentUser={currentUser}
          onLogout={handleLogout}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onRefreshData={loadAllData}
          activeTabTitle={getTabTitle()}
        />

        {/* BODY CONTENT CONTAINER */}
        <main className="p-4">
          
          {/* Toast Alert Banner */}
          {toastMessage.text && (
            <div
              className={`alert ${
                toastMessage.type === "success" 
                  ? "alert-success bg-success bg-opacity-25 text-success border-success" 
                  : "alert-danger bg-danger bg-opacity-25 text-danger border-danger"
              } alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 shadow-lg mb-4`}
              role="alert"
            >
              <span>{toastMessage.type === "success" ? "✅" : "⚠️"}</span>
              <div className="fw-medium">{toastMessage.text}</div>
            </div>
          )}

          {/* DYNAMIC COMPONENT RENDERING BASED ON SIDEBAR TAB */}
          
          {/* 1. Dashboard Overview */}
          {activeTab === "dashboard" && (
            <AdminDashboardOverview 
              stats={stats}
              wellnessAnalytics={wellnessAnalytics}
              users={users}
              logs={logs}
              loading={loading}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* 2. Manage Users -> Students */}
          {activeTab === "users-students" && (
            <AdminManageStudents 
              users={users}
              wellnessAnalytics={wellnessAnalytics}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* 3. Manage Users -> Parents */}
          {activeTab === "users-parents" && (
            <AdminManageParents 
              users={users}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* 4. Manage Users -> Working Professionals */}
          {activeTab === "users-professionals" && (
            <AdminManageProfessionals 
              users={users}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* 5. Manage Users -> Senior Citizens */}
          {activeTab === "users-seniors" && (
            <AdminManageSeniors 
              users={users}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* 6. Wellness Analytics Page */}
          {activeTab === "wellness-analytics" && (
            <AdminWellnessAnalytics />
          )}

          {/* 7. Feedback Page */}
          {activeTab === "feedback" && (
            <AdminFeedback />
          )}

          {/* 8. Notifications Page */}
          {activeTab === "notifications" && (
            <AdminNotifications />
          )}

          {/* 9. Settings Page */}
          {activeTab === "settings" && (
            <AdminSettings 
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}

        </main>
      </div>

      {/* Responsive Style Overrides for Mobile Viewports */}
      <style>{`
        @media (max-width: 991.98px) {
          .admin-main-wrapper {
            margin-left: 0 !important;
          }
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.show {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
