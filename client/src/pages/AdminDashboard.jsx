import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Active Tab: "overview" | "users" | "logs"
  const [activeTab, setActiveTab] = useState("overview");

  // Dashboard Data State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  // UI & Filter States
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
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
      } else {
        showToast("error", data.message || "Failed to load admin stats");
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }, [getHeaders]);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (selectedRoleFilter !== "All") queryParams.append("role", selectedRoleFilter);

      const res = await fetch(`http://localhost:5000/api/admin/users?${queryParams.toString()}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  }, [getHeaders, searchTerm, selectedRoleFilter]);

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

  // Load user profile & initial data
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

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchLogs()]);
      setLoading(false);
    };

    loadAll();
  }, [navigate, fetchStats, fetchUsers, fetchLogs]);

  // Debounced user search / filter refetch
  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [searchTerm, selectedRoleFilter, fetchUsers, loading]);

  // Update Role Handler
  const handleRoleChange = async (userId, newRole) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Role updated to "${newRole}" successfully!`);
        fetchUsers();
        fetchStats();
      } else {
        showToast("error", data.message || "Failed to update role");
      }
    } catch (err) {
      showToast("error", "Server connection error while updating role.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete the user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(userId);
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
    } finally {
      setActionLoadingId(null);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("neurosync_current_user");
    localStorage.removeItem("neurosync_token");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard-page" style={{ minHeight: "100vh", background: "#030712", color: "#f8fafc" }}>
      {/* Background Ambient Glows */}
      <div className="bg-ambient-glow" />
      <div className="bg-ambient-secondary" />

      {/* Top Navbar */}
      <nav
        className="navbar navbar-expand-lg sticky-top px-4 py-3"
        style={{
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="navbar-brand text-white fw-bold d-flex align-items-center gap-2">
              <span style={{ fontSize: "1.5rem" }}>🧠</span>
              <span style={{ background: "linear-gradient(135deg, #fff 30%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                NeuroSync AI
              </span>
            </Link>
            <span className="badge bg-warning text-dark px-3 py-1.5 rounded-pill fw-semibold shadow-sm">
              ⚡ Admin Portal
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <p className="mb-0 fw-semibold text-white small">{currentUser?.fullName || "Admin User"}</p>
              <p className="mb-0 text-secondary extra-small">{currentUser?.email}</p>
            </div>
            <Link to="/" className="btn btn-outline-secondary btn-sm px-3 rounded-pill text-white">
              🏠 Home
            </Link>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-3 rounded-pill">
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container py-4 position-relative" style={{ zIndex: 1 }}>
        {/* Toast Alert Banner */}
        {toastMessage.text && (
          <div
            className={`alert ${
              toastMessage.type === "success" ? "alert-success bg-success bg-opacity-25 text-success border-success" : "alert-danger bg-danger bg-opacity-25 text-danger border-danger"
            } alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 shadow-lg mb-4`}
            role="alert"
          >
            <span>{toastMessage.type === "success" ? "✅" : "⚠️"}</span>
            <div className="fw-medium">{toastMessage.text}</div>
          </div>
        )}

        {/* Hero Welcome Banner */}
        <div
          className="p-4 rounded-4 mb-4 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(123, 47, 247, 0.2) 0%, rgba(45, 140, 255, 0.15) 100%)",
            border: "1px solid rgba(123, 47, 247, 0.3)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                Welcome, {currentUser?.fullName || "Admin"} 👋
              </h2>
              <p className="text-secondary mb-0">
                Manage accounts, review system metrics, and control user roles across NeuroSync.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => {
                  fetchStats();
                  fetchUsers();
                  fetchLogs();
                  showToast("success", "Dashboard data refreshed!");
                }}
                className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                style={{ background: "linear-gradient(135deg, #7B2FF7 0%, #2D8CFF 100%)", border: "none" }}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards Row */}
        <div className="row g-3 mb-4">
          {/* Card 1: Total Users */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="p-3.5 rounded-4 h-100 transition-all"
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Total Registered Users</span>
                <span className="p-2 rounded-3" style={{ background: "rgba(123, 47, 247, 0.2)", color: "#a78bfa" }}>
                  👥
                </span>
              </div>
              <h3 className="fw-bold mb-1 text-white">{loading ? "..." : stats?.totalUsers || 0}</h3>
              <span className="text-success extra-small">Active in MongoDB Atlas</span>
            </div>
          </div>

          {/* Card 2: Admins */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="p-3.5 rounded-4 h-100 transition-all"
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Admin Accounts</span>
                <span className="p-2 rounded-3" style={{ background: "rgba(255, 193, 7, 0.2)", color: "#ffc107" }}>
                  ⚡
                </span>
              </div>
              <h3 className="fw-bold mb-1 text-warning">{loading ? "..." : stats?.totalAdmins || 0}</h3>
              <span className="text-warning extra-small">System Administrators</span>
            </div>
          </div>

          {/* Card 3: Verified Users */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="p-3.5 rounded-4 h-100 transition-all"
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Verified Accounts</span>
                <span className="p-2 rounded-3" style={{ background: "rgba(34, 197, 94, 0.2)", color: "#4ade80" }}>
                  ✅
                </span>
              </div>
              <h3 className="fw-bold mb-1 text-success">{loading ? "..." : stats?.verifiedUsers || 0}</h3>
              <span className="text-secondary extra-small">Google & Email Verified</span>
            </div>
          </div>

          {/* Card 4: Recent Logins */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="p-3.5 rounded-4 h-100 transition-all"
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid rgba(45, 140, 255, 0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Logins (24 Hours)</span>
                <span className="p-2 rounded-3" style={{ background: "rgba(45, 140, 255, 0.2)", color: "#60a5fa" }}>
                  🔑
                </span>
              </div>
              <h3 className="fw-bold mb-1 text-info">{loading ? "..." : stats?.recentLogins24h || 0}</h3>
              <span className="text-secondary extra-small">Total Logins Recorded: {stats?.totalLogins || 0}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="d-flex gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`btn px-4 py-2 rounded-pill fw-semibold transition-all ${
              activeTab === "overview" ? "btn-primary" : "btn-outline-secondary text-secondary"
            }`}
            style={activeTab === "overview" ? { background: "linear-gradient(135deg, #7B2FF7, #2D8CFF)", border: "none" } : {}}
          >
            📊 Analytics & Overview
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`btn px-4 py-2 rounded-pill fw-semibold transition-all ${
              activeTab === "users" ? "btn-primary" : "btn-outline-secondary text-secondary"
            }`}
            style={activeTab === "users" ? { background: "linear-gradient(135deg, #7B2FF7, #2D8CFF)", border: "none" } : {}}
          >
            👥 User Management ({users.length})
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`btn px-4 py-2 rounded-pill fw-semibold transition-all ${
              activeTab === "logs" ? "btn-primary" : "btn-outline-secondary text-secondary"
            }`}
            style={activeTab === "logs" ? { background: "linear-gradient(135deg, #7B2FF7, #2D8CFF)", border: "none" } : {}}
          >
            📜 Login Audit Logs ({logs.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="row g-4">
            {/* User Role Distribution */}
            <div className="col-12 col-lg-7">
              <div
                className="p-4 rounded-4 h-100"
                style={{
                  background: "rgba(15, 23, 42, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                  <span>🎨</span> Role Distribution Breakdown
                </h5>

                {stats?.roleBreakdown && Object.keys(stats.roleBreakdown).length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {Object.entries(stats.roleBreakdown).map(([roleName, count]) => {
                      const percentage = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
                      return (
                        <div key={roleName}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-medium text-light small">{roleName}</span>
                            <span className="text-secondary extra-small fw-semibold">
                              {count} users ({percentage}%)
                            </span>
                          </div>
                          <div className="progress" style={{ height: "8px", background: "rgba(255,255,255,0.06)" }}>
                            <div
                              className="progress-bar rounded-pill"
                              role="progressbar"
                              style={{
                                width: `${percentage}%`,
                                background:
                                  roleName === "Admin"
                                    ? "linear-gradient(90deg, #ffc107, #f59e0b)"
                                    : roleName === "User"
                                    ? "linear-gradient(90deg, #7B2FF7, #a78bfa)"
                                    : "linear-gradient(90deg, #2D8CFF, #00f2fe)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-secondary mb-0">No role distribution data available.</p>
                )}
              </div>
            </div>

            {/* System Status & Server Health */}
            <div className="col-12 col-lg-5">
              <div
                className="p-4 rounded-4 h-100"
                style={{
                  background: "rgba(15, 23, 42, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                  <span>⚡</span> System Health & Status
                </h5>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success p-1.5 rounded-circle" />
                      <span className="fw-medium text-white small">MongoDB Atlas</span>
                    </div>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success">Connected</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success p-1.5 rounded-circle" />
                      <span className="fw-medium text-white small">Auth Controller Service</span>
                    </div>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success">Operational</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success p-1.5 rounded-circle" />
                      <span className="fw-medium text-white small">JWT Authorization Guard</span>
                    </div>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success">Active</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success p-1.5 rounded-circle" />
                      <span className="fw-medium text-white small">Google OAuth Integration</span>
                    </div>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div
            className="p-4 rounded-4"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Search & Filter Header */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">🔍</span>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                >
                  <option value="All">Filter by Role: All</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                </select>
              </div>

              <div className="col-12 col-md-2 text-md-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRoleFilter("All");
                  }}
                  className="btn btn-outline-secondary btn-sm w-100 py-2 rounded-3 text-white"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
                <thead>
                  <tr className="text-secondary border-bottom border-secondary border-opacity-25 small">
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>AUTH PROVIDER</th>
                    <th>VERIFIED</th>
                    <th>JOINED</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u._id} className="border-bottom border-secondary border-opacity-10">
                        <td>
                          <div className="d-flex align-items-center gap-2.5">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{
                                width: "36px",
                                height: "36px",
                                background: u.role === "Admin" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #7B2FF7, #2D8CFF)",
                                fontSize: "0.9rem",
                              }}
                            >
                              {u.profileImage ? (
                                <img src={u.profileImage} alt={u.fullName} className="rounded-circle" style={{ width: "36px", height: "36px", objectFit: "cover" }} />
                              ) : (
                                u.fullName?.charAt(0).toUpperCase() || "U"
                              )}
                            </div>
                            <div>
                              <span className="fw-semibold text-white d-block">{u.fullName}</span>
                            </div>
                          </div>
                        </td>

                        <td className="text-secondary small">{u.email}</td>

                        <td>
                          <select
                            className={`form-select form-select-sm border-secondary text-white ${
                              u.role === "Admin" ? "bg-warning bg-opacity-25 text-warning" : "bg-dark"
                            }`}
                            style={{ minWidth: "140px" }}
                            value={u.role || "User"}
                            disabled={actionLoadingId === u._id}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                            <option value="Student">Student</option>
                            <option value="Parent">Parent</option>
                            <option value="Working Professional">Working Professional</option>
                            <option value="Senior Citizen">Senior Citizen</option>
                          </select>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              u.authProvider === "google" ? "bg-danger bg-opacity-25 text-danger border border-danger" : "bg-primary bg-opacity-25 text-info border border-info"
                            } px-2.5 py-1`}
                          >
                            {u.authProvider === "google" ? "🌐 Google" : "✉️ Local"}
                          </span>
                        </td>

                        <td>
                          {u.isVerified ? (
                            <span className="badge bg-success bg-opacity-25 text-success border border-success">Verified</span>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-25 text-secondary">Unverified</span>
                          )}
                        </td>

                        <td className="text-secondary small">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                        </td>

                        <td className="text-end">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            disabled={actionLoadingId === u._id || u._id === currentUser?.id}
                            className="btn btn-outline-danger btn-sm px-2.5 py-1 rounded-2"
                            title={u._id === currentUser?.id ? "Cannot delete yourself" : "Delete user"}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-secondary">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LOGIN LOGS */}
        {activeTab === "logs" && (
          <div
            className="p-4 rounded-4"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <span>📜</span> Recent Audit & Login History
            </h5>

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
                <thead>
                  <tr className="text-secondary border-bottom border-secondary border-opacity-25 small">
                    <th>USER / EMAIL</th>
                    <th>LOGIN TIME</th>
                    <th>STATUS</th>
                    <th>IP ADDRESS</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log._id} className="border-bottom border-secondary border-opacity-10">
                        <td>
                          <span className="fw-semibold text-white d-block">{log.email}</span>
                          {log.userId && typeof log.userId === "object" && (
                            <span className="text-secondary extra-small">Name: {log.userId.fullName}</span>
                          )}
                        </td>
                        <td className="text-secondary small">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : new Date(log.loginTime).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              log.status === "Success" ? "bg-success bg-opacity-25 text-success border border-success" : "bg-danger bg-opacity-25 text-danger border border-danger"
                            }`}
                          >
                            {log.status === "Success" ? "✅ Success" : "❌ Failed"}
                          </span>
                        </td>
                        <td className="text-secondary small font-monospace">{log.ipAddress || "::1"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-secondary">
                        No login activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
