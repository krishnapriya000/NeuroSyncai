import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { getTodayDateString } from "../utils/roleUtils";
import {
  FiTarget,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiEdit3,
  FiTrash2,
  FiAlertCircle,
  FiX,
  FiCheck,
  FiPieChart,
  FiBarChart2,
  FiAlertTriangle,
  FiSliders,
  FiTrendingUp,
  FiFlag,
} from "react-icons/fi";
import "../styles/studentDashboard.css";

const categoryOptions = [
  "Academic",
  "Project",
  "Skill Development",
  "Personal",
  "Health & Wellness",
  "Career",
  "Other",
];

const priorityOptions = [
  { value: "Low", label: "Low", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" },
  { value: "Medium", label: "Medium", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" },
  { value: "High", label: "High", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)" },
];

function StudentGoals() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("goals");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // State for goals data
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Active", "Completed", "Overdue"

  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null); // null if creating

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressGoal, setProgressGoal] = useState(null);
  const [progressValue, setProgressValue] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Academic");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formStartDate, setFormStartDate] = useState(getTodayDateString());
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formProgress, setFormProgress] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch logged in student info and goals on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setStudentName(userObj.fullName || userObj.name);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setError("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/goals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to load goals.");
        setLoading(false);
        return;
      }

      setGoals(result.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching goals:", err);
      setError("Cannot connect to backend server.");
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  // Open Create Goal Modal
  const handleOpenCreateModal = () => {
    const today = getTodayDateString();
    // Default target date to 14 days from today
    const future = new Date();
    future.setDate(future.getDate() + 14);
    const targetStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;

    setEditingGoal(null);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("Academic");
    setFormPriority("Medium");
    setFormStartDate(today);
    setFormTargetDate(targetStr);
    setFormProgress(0);
    setFormError("");
    setShowGoalModal(true);
  };

  // Open Edit Goal Modal
  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title || "");
    setFormDescription(goal.description || "");
    setFormCategory(goal.category || "Academic");
    setFormPriority(goal.priority || "Medium");
    setFormStartDate(goal.startDate || getTodayDateString());
    setFormTargetDate(goal.targetDate || "");
    setFormProgress(goal.progress || 0);
    setFormError("");
    setShowGoalModal(true);
  };

  // Open Update Progress Modal
  const handleOpenProgressModal = (goal) => {
    setProgressGoal(goal);
    setProgressValue(goal.progress || 0);
    setShowProgressModal(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (id) => {
    setDeletingGoalId(id);
    setShowDeleteModal(true);
  };

  // Submit Handler (Create / Edit Goal)
  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Goal Title is required.");
      return;
    }

    if (!formCategory) {
      setFormError("Category is required.");
      return;
    }

    if (!formPriority) {
      setFormError("Priority is required.");
      return;
    }

    if (!formStartDate.trim()) {
      setFormError("Start Date is required.");
      return;
    }

    if (!formTargetDate.trim()) {
      setFormError("Target Date is required.");
      return;
    }

    if (formStartDate > formTargetDate) {
      setFormError("Start Date cannot be after Target Date.");
      return;
    }

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setFormError("Authentication token missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingGoal
        ? `http://localhost:5000/api/goals/${editingGoal._id}`
        : "http://localhost:5000/api/goals";
      const method = editingGoal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          priority: formPriority,
          startDate: formStartDate.trim(),
          targetDate: formTargetDate.trim(),
          progress: formProgress,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setFormError(result.message || "Failed to save goal.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setShowGoalModal(false);
      showToast(
        editingGoal ? "Goal updated successfully." : "Goal created successfully! 🎯"
      );
      fetchGoals();
    } catch (err) {
      console.error("Save goal error:", err);
      setFormError("Server error occurred while saving goal.");
      setIsSubmitting(false);
    }
  };

  // Save Progress Update
  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!progressGoal) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setError("Authentication token missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/goals/${progressGoal._id}/progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ progress: progressValue }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update progress.");
        setIsSubmitting(false);
        setShowProgressModal(false);
        return;
      }

      setIsSubmitting(false);
      setShowProgressModal(false);
      setProgressGoal(null);

      if (progressValue >= 100) {
        showToast("Goal completed! 🎉");
      } else {
        showToast("Goal progress updated.");
      }

      fetchGoals();
    } catch (err) {
      console.error("Progress update error:", err);
      setError("Server error while updating goal progress.");
      setIsSubmitting(false);
      setShowProgressModal(false);
    }
  };

  // Confirm Delete Goal
  const handleConfirmDelete = async () => {
    if (!deletingGoalId) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setError("Authentication token missing.");
      setShowDeleteModal(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/goals/${deletingGoalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to delete goal.");
        setIsSubmitting(false);
        setShowDeleteModal(false);
        return;
      }

      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingGoalId(null);
      showToast("Goal deleted successfully.");
      fetchGoals();
    } catch (err) {
      console.error("Delete goal error:", err);
      setError("Server error while deleting goal.");
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  // Date formatting helper
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return dateStr;
  };

  const todayDateStr = getTodayDateString();

  // Helper to determine if a goal is overdue
  const isOverdue = (goal) => {
    return (goal.progress || 0) < 100 && goal.targetDate < todayDateStr;
  };

  // Filtered goals list based on toolbar search & filters
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = (goal.title || "").toLowerCase().includes(term);
        const matchesDesc = (goal.description || "").toLowerCase().includes(term);
        const matchesCat = (goal.category || "").toLowerCase().includes(term);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Category filter
      if (categoryFilter !== "All" && goal.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== "All" && goal.priority !== priorityFilter) return false;

      // Status filter (Active, Completed, Overdue)
      if (statusFilter !== "All") {
        const goalIsDone = goal.progress >= 100 || goal.status === "completed";
        const goalIsOverdue = isOverdue(goal);

        if (statusFilter === "Completed" && !goalIsDone) return false;
        if (statusFilter === "Overdue" && !goalIsOverdue) return false;
        if (statusFilter === "Active" && (goalIsDone || goalIsOverdue)) return false;
      }

      return true;
    });
  }, [goals, searchTerm, categoryFilter, priorityFilter, statusFilter, todayDateStr]);

  // Derived arrays for active, completed, and overdue sections
  const activeGoalsList = useMemo(() => {
    return filteredGoals
      .filter((g) => g.progress < 100 && g.status !== "completed")
      .sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  }, [filteredGoals]);

  const completedGoalsList = useMemo(() => {
    return filteredGoals.filter((g) => g.progress >= 100 || g.status === "completed");
  }, [filteredGoals]);

  // Overall database metrics
  const metrics = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.progress >= 100 || g.status === "completed").length;
    const overdue = goals.filter((g) => g.progress < 100 && g.targetDate < todayDateStr).length;
    const active = goals.filter((g) => g.progress < 100 && g.targetDate >= todayDateStr).length;
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, active, completed, overdue, overallProgress };
  }, [goals, todayDateStr]);

  // Category-wise progress data
  const categoryProgressList = useMemo(() => {
    const map = {};
    goals.forEach((g) => {
      const cat = g.category || "Other";
      if (!map[cat]) map[cat] = { total: 0, completed: 0, totalProgress: 0 };
      map[cat].total += 1;
      map[cat].totalProgress += g.progress || 0;
      if (g.progress >= 100 || g.status === "completed") map[cat].completed += 1;
    });

    return Object.keys(map).map((cat) => {
      const total = map[cat].total;
      const completed = map[cat].completed;
      const avgProgress = total > 0 ? Math.round(map[cat].totalProgress / total) : 0;
      return { category: cat, total, completed, progress: avgProgress };
    }).sort((a, b) => b.total - a.total);
  }, [goals]);

  // Upcoming Deadlines: Next 3–5 active goals based on target date
  const upcomingDeadlinesList = useMemo(() => {
    return goals
      .filter((g) => g.progress < 100 && g.targetDate >= todayDateStr)
      .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
      .slice(0, 5)
      .map((g) => {
        const target = new Date(g.targetDate);
        const today = new Date(todayDateStr);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...g, daysRemaining: diffDays >= 0 ? diffDays : 0 };
      });
  }, [goals, todayDateStr]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Top Navbar */}
      <TopNavbar
        studentName={studentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <main className="ns-main-content">
        {/* ================= 1. PAGE HEADER ================= */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#C084FC",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <FiTarget className="me-1" /> Student Goals Module
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">My Goals</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Set meaningful goals, track your progress, and stay motivated.
            </p>
          </div>

          <button
            type="button"
            className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              border: "none",
              transition: "all 0.3s ease",
            }}
            onClick={handleOpenCreateModal}
          >
            <FiPlus size={20} />
            <span>+ Create Goal</span>
          </button>
        </div>

        {/* Success Alert / Notification */}
        {successMessage && (
          <div
            className="alert alert-success d-flex align-items-center justify-content-between rounded-4 shadow-sm mb-4 border-0"
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              borderLeft: "4px solid #10B981",
              color: "#6EE7B7",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FiCheckCircle size={20} className="text-success" />
              <span className="fw-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setSuccessMessage("")}
            />
          </div>
        )}

        {/* Global Error Alert */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center justify-content-between rounded-4 shadow-sm mb-4 border-0"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              borderLeft: "4px solid #EF4444",
              color: "#FCA5A5",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FiAlertCircle size={20} className="text-danger" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setError(null)}
            />
          </div>
        )}

        {/* Header Summary Cards (Database data) */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="ns-card p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Total Goals</span>
                <h3 className="text-white fw-bold fs-3 mb-0 mt-1">{metrics.total}</h3>
              </div>
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA" }}
              >
                <FiTarget size={22} />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="ns-card p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Active Goals</span>
                <h3 className="text-white fw-bold fs-3 mb-0 mt-1">{metrics.active}</h3>
              </div>
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}
              >
                <FiClock size={22} />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="ns-card p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Completed</span>
                <h3 className="text-white fw-bold fs-3 mb-0 mt-1">{metrics.completed}</h3>
              </div>
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}
              >
                <FiCheckCircle size={22} />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="ns-card p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Overall Progress</span>
                <h3 className="text-white fw-bold fs-3 mb-0 mt-1">{metrics.overallProgress}%</h3>
              </div>
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(139, 92, 246, 0.15)", color: "#C084FC" }}
              >
                <FiTrendingUp size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= 9 & 10. TOOLBAR: SEARCH AND FILTERS ================= */}
        <div className="ns-card mb-4 p-3">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5 col-lg-4">
              <div className="position-relative">
                <FiSearch
                  className="position-absolute top-50 translate-middle-y text-muted ms-3"
                  size={18}
                />
                <input
                  type="text"
                  className="form-control text-white rounded-3 ps-5 pe-4 py-2"
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#FFF",
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="btn p-0 position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                    onClick={() => setSearchTerm("")}
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Dropdown Filter */}
            <div className="col-4 col-md-2.5 col-lg-3">
              <select
                className="form-select text-white rounded-3 bg-dark border-secondary border-opacity-50 py-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ fontSize: "0.85rem" }}
              >
                <option value="All">Category: All</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown Filter */}
            <div className="col-4 col-md-2.5 col-lg-2.5">
              <select
                className="form-select text-white rounded-3 bg-dark border-secondary border-opacity-50 py-2"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ fontSize: "0.85rem" }}
              >
                <option value="All">Priority: All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Status Dropdown Filter */}
            <div className="col-4 col-md-2 col-lg-2.5">
              <select
                className="form-select text-white rounded-3 bg-dark border-secondary border-opacity-50 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: "0.85rem" }}
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading goals...</span>
            </div>
            <p className="text-muted">Fetching your goals...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* ================= 16. GLOBAL EMPTY STATE (No goals at all) ================= */}
            {goals.length === 0 ? (
              <div className="ns-card text-center py-5 px-4 mb-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3"
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <FiTarget size={48} style={{ color: "#A78BFA" }} />
                </div>
                <h4 className="text-white fw-bold mb-2">Set your first goal 🎯</h4>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "420px", fontSize: "0.92rem" }}>
                  Create a goal and start tracking your progress. Break your ambitions into realistic milestones.
                </p>
                <button
                  type="button"
                  className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    border: "none",
                  }}
                  onClick={handleOpenCreateModal}
                >
                  <FiPlus size={18} /> + Create Goal
                </button>
              </div>
            ) : (
              <>
                {/* ================= 7 & 4 & 8. ACTIVE GOALS ================= */}
                <div className="mb-5">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="p-2 rounded-3 text-white"
                        style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
                      >
                        <FiClock size={18} />
                      </div>
                      <h2 className="text-white fw-bold fs-5 mb-0">Active Goals</h2>
                      <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary ms-1">
                        {activeGoalsList.length} {activeGoalsList.length === 1 ? "Goal" : "Goals"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary text-white border-secondary border-opacity-50 rounded-3 px-3"
                      onClick={handleOpenCreateModal}
                    >
                      <FiPlus me={1} /> Create Goal
                    </button>
                  </div>

                  {activeGoalsList.length === 0 ? (
                    <div className="ns-card text-center py-4 px-4 mb-4">
                      <p className="text-muted mb-0">No active goals matching your selected filters.</p>
                    </div>
                  ) : (
                    <div className="row g-4">
                      {activeGoalsList.map((goal) => {
                        const prioObj = priorityOptions.find((p) => p.value === goal.priority) || priorityOptions[1];
                        const goalIsOverdue = isOverdue(goal);

                        return (
                          <div key={goal._id} className="col-12 col-md-6 col-xl-4">
                            <div
                              className="ns-card h-100 d-flex flex-column justify-content-between p-4"
                              style={{
                                borderLeft: `4px solid ${goalIsOverdue ? "#EF4444" : prioObj.color}`,
                              }}
                            >
                              <div>
                                {/* Category & Status/Priority Badges */}
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span
                                    className="badge rounded-pill px-3 py-1 fw-bold text-white d-inline-flex align-items-center gap-1"
                                    style={{
                                      background: "rgba(139, 92, 246, 0.2)",
                                      border: "1px solid rgba(139, 92, 246, 0.35)",
                                      fontSize: "0.78rem",
                                    }}
                                  >
                                    🎯 {goal.category}
                                  </span>

                                  <div className="d-flex align-items-center gap-1">
                                    {goalIsOverdue && (
                                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 px-2 py-1">
                                        ⚠️ Overdue
                                      </span>
                                    )}
                                    <span
                                      className="badge rounded-pill px-2.5 py-1"
                                      style={{
                                        background: prioObj.bg,
                                        border: `1px solid ${prioObj.border}`,
                                        color: prioObj.color,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {goal.priority}
                                    </span>
                                  </div>
                                </div>

                                {/* Goal Title */}
                                <h3 className="text-white fw-bold fs-5 mb-2 mt-2">
                                  🎯 {goal.title}
                                </h3>

                                {/* Goal Description */}
                                {goal.description && (
                                  <p
                                    className="text-muted small mb-3"
                                    style={{
                                      lineHeight: "1.4",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {goal.description}
                                  </p>
                                )}

                                {/* Dates display */}
                                <div className="d-flex align-items-center justify-content-between text-muted small mb-3">
                                  <span>
                                    <strong>Start:</strong> {formatDateDisplay(goal.startDate)}
                                  </span>
                                  <span className={goalIsOverdue ? "text-danger fw-bold" : ""}>
                                    <strong>Target:</strong> {formatDateDisplay(goal.targetDate)}
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="text-muted small">Progress</span>
                                    <span className="text-white fw-bold small">{goal.progress}%</span>
                                  </div>
                                  <div
                                    className="progress bg-dark"
                                    style={{
                                      height: "8px",
                                      borderRadius: "10px",
                                      border: "1px solid rgba(255, 255, 255, 0.05)",
                                    }}
                                  >
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${goal.progress}%`,
                                        background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                                        borderRadius: "10px",
                                        transition: "width 0.4s ease",
                                      }}
                                      aria-valuenow={goal.progress}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Footer Actions */}
                              <div className="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary text-info border-info border-opacity-25 rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1"
                                  onClick={() => handleOpenProgressModal(goal)}
                                >
                                  <FiSliders size={14} /> Update Progress
                                </button>

                                <div className="d-flex align-items-center gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm text-muted hover-white p-1.5 rounded-2"
                                    onClick={() => handleOpenEditModal(goal)}
                                    title="Edit Goal"
                                  >
                                    <FiEdit3 size={17} className="text-warning" />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm text-muted hover-white p-1.5 rounded-2"
                                    onClick={() => handleOpenDeleteModal(goal._id)}
                                    title="Delete Goal"
                                  >
                                    <FiTrash2 size={17} className="text-danger" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ================= 15. UPCOMING DEADLINES ================= */}
                <div className="mb-5">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="p-2 rounded-3 text-white"
                        style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
                      >
                        <FiFlag size={18} />
                      </div>
                      <h2 className="text-white fw-bold fs-5 mb-0">Upcoming Deadlines</h2>
                    </div>
                  </div>

                  {upcomingDeadlinesList.length === 0 ? (
                    <div className="ns-card text-center py-4 px-4">
                      <p className="text-muted mb-0">No upcoming goal deadlines.</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {upcomingDeadlinesList.map((g) => (
                        <div key={g._id} className="col-12 col-md-6 col-lg-4">
                          <div className="ns-card p-3 d-flex align-items-center justify-content-between">
                            <div>
                              <span className="badge bg-dark text-info border border-info border-opacity-25 px-2 py-0.5 mb-1" style={{ fontSize: "0.72rem" }}>
                                {g.category}
                              </span>
                              <h5 className="text-white fw-bold fs-6 mb-1 text-truncate" style={{ maxWidth: "200px" }}>
                                🎯 {g.title}
                              </h5>
                              <span className="text-muted small">
                                Due: {formatDateDisplay(g.targetDate)}
                              </span>
                            </div>
                            <div className="text-end">
                              <span
                                className="badge rounded-pill px-3 py-1.5 fw-bold"
                                style={{
                                  background: g.daysRemaining <= 3 ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)",
                                  color: g.daysRemaining <= 3 ? "#FCA5A5" : "#60A5FA",
                                  border: `1px solid ${g.daysRemaining <= 3 ? "#EF4444" : "#3B82F6"}`,
                                  fontSize: "0.78rem",
                                }}
                              >
                                {g.daysRemaining === 0 ? "Due today" : `Due in ${g.daysRemaining} days`}
                              </span>
                              <div className="text-muted mt-1 small">{g.progress}% Done</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ================= 6. COMPLETED GOALS ================= */}
                <div className="mb-5">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="p-2 rounded-3 text-white"
                        style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                      >
                        <FiCheckCircle size={18} />
                      </div>
                      <h2 className="text-white fw-bold fs-5 mb-0">Completed Goals</h2>
                      <span className="badge rounded-pill bg-success bg-opacity-25 text-success ms-1">
                        {completedGoalsList.length} {completedGoalsList.length === 1 ? "Goal" : "Goals"}
                      </span>
                    </div>
                  </div>

                  {completedGoalsList.length === 0 ? (
                    <div className="ns-card text-center py-4 px-4">
                      <p className="text-muted mb-0">No completed goals yet. Keep working towards your active milestones!</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {completedGoalsList.map((goal) => (
                        <div key={goal._id} className="col-12 col-md-6 col-xl-4">
                          <div
                            className="ns-card h-100 d-flex flex-column justify-content-between p-3 opacity-90"
                            style={{
                              borderLeft: "4px solid #10B981",
                              background: "rgba(15, 23, 42, 0.6)",
                            }}
                          >
                            <div>
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-2.5 py-1">
                                  ✓ Completed
                                </span>
                                <span className="badge bg-dark text-muted">
                                  {goal.category}
                                </span>
                              </div>

                              <h4 className="text-white fw-bold fs-6 mb-2 text-decoration-line-through text-muted">
                                ✓ {goal.title}
                              </h4>

                              <p className="text-muted small mb-2">
                                Completed on {formatDateDisplay(goal.targetDate)}
                              </p>

                              {/* 100% Progress Bar */}
                              <div className="progress bg-dark mb-2" style={{ height: "6px", borderRadius: "10px" }}>
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: "100%" }}
                                  aria-valuenow="100"
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                />
                              </div>
                            </div>

                            <div className="pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-sm text-muted hover-white p-1"
                                onClick={() => handleOpenDeleteModal(goal._id)}
                                title="Delete Goal"
                              >
                                <FiTrash2 size={16} className="text-danger" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ================= 13 & 14. GOAL OVERVIEW & PROGRESS VISUALIZATION ================= */}
                <div className="row g-4 mb-4">
                  {/* Goal Overview */}
                  <div className="col-12 col-lg-6">
                    <div className="ns-card h-100 p-4">
                      <div className="d-flex align-items-center gap-2 mb-4">
                        <div
                          className="p-2 rounded-3 text-white"
                          style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)" }}
                        >
                          <FiPieChart size={20} />
                        </div>
                        <h2 className="text-white fw-bold fs-5 mb-0">Goal Overview</h2>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-6 col-sm-3 text-center">
                          <span className="text-muted small">Total Goals</span>
                          <h4 className="text-white fw-bold fs-4 mb-0 mt-1">{metrics.total}</h4>
                        </div>
                        <div className="col-6 col-sm-3 text-center">
                          <span className="text-muted small">Active</span>
                          <h4 className="text-warning fw-bold fs-4 mb-0 mt-1">{metrics.active}</h4>
                        </div>
                        <div className="col-6 col-sm-3 text-center">
                          <span className="text-muted small">Completed</span>
                          <h4 className="text-success fw-bold fs-4 mb-0 mt-1">{metrics.completed}</h4>
                        </div>
                        <div className="col-6 col-sm-3 text-center">
                          <span className="text-muted small">Overdue</span>
                          <h4 className="text-danger fw-bold fs-4 mb-0 mt-1">{metrics.overdue}</h4>
                        </div>
                      </div>

                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Overall Goal Completion %</span>
                          <span className="text-white fw-bold">{metrics.overallProgress}%</span>
                        </div>
                        <div
                          className="progress bg-dark"
                          style={{
                            height: "12px",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${metrics.overallProgress}%`,
                              background: "linear-gradient(90deg, #3B82F6, #10B981)",
                              borderRadius: "10px",
                              transition: "width 0.6s ease",
                            }}
                            aria-valuenow={metrics.overallProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 14. Progress Visualization (Category-wise) */}
                  <div className="col-12 col-lg-6">
                    <div className="ns-card h-100 p-4">
                      <div className="d-flex align-items-center gap-2 mb-4">
                        <div
                          className="p-2 rounded-3 text-white"
                          style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
                        >
                          <FiBarChart2 size={20} />
                        </div>
                        <h2 className="text-white fw-bold fs-5 mb-0">Category Progress</h2>
                      </div>

                      {categoryProgressList.length === 0 ? (
                        <p className="text-muted text-center py-3 mb-0">
                          No category statistics available yet.
                        </p>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {categoryProgressList.map((item) => (
                            <div key={item.category}>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-white fw-semibold small">
                                  🎯 {item.category}
                                </span>
                                <span className="text-muted small">
                                  {item.completed} / {item.total} completed ({item.progress}%)
                                </span>
                              </div>
                              <div
                                className="progress bg-dark"
                                style={{
                                  height: "8px",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(255, 255, 255, 0.05)",
                                }}
                              >
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{
                                    width: `${item.progress}%`,
                                    background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
                                    borderRadius: "10px",
                                    transition: "width 0.5s ease",
                                  }}
                                  aria-valuenow={item.progress}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <DashboardFooter />

      {/* ==================== 2 & 11. CREATE / EDIT GOAL MODAL ==================== */}
      {showGoalModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(6px)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content text-white rounded-4 border-0 shadow-lg overflow-hidden"
              style={{
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FiTarget className="text-primary" />
                  {editingGoal ? "Edit Goal" : "Create Goal"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowGoalModal(false)}
                />
              </div>

              <form onSubmit={handleSaveGoal}>
                <div className="modal-body px-4 py-4">
                  {formError && (
                    <div
                      className="alert d-flex align-items-center justify-content-between rounded-3 p-3 mb-4 border-0"
                      style={{
                        background: "rgba(239, 68, 68, 0.25)",
                        borderLeft: "4px solid #EF4444",
                        color: "#FFFFFF",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <FiAlertCircle size={20} className="text-danger flex-shrink-0" />
                        <span className="fw-semibold" style={{ color: "#FCA5A5", fontSize: "0.9rem" }}>
                          {formError}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setFormError("")}
                      />
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Title * */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Goal Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control text-white rounded-3 p-2.5"
                        placeholder="e.g. Complete Main Project"
                        value={formTitle}
                        onChange={(e) => {
                          setFormTitle(e.target.value);
                          if (formError) setFormError("");
                        }}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        required
                      />
                    </div>

                    {/* Category * */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select text-white rounded-3 p-2.5 bg-dark border-secondary border-opacity-50"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        required
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description (Optional) */}
                    <div className="col-12">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Description <span className="text-muted">(Optional)</span>
                      </label>
                      <textarea
                        className="form-control text-white rounded-3 p-2.5"
                        rows={2}
                        placeholder="Outline key milestones or details..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      />
                    </div>

                    {/* Priority * */}
                    <div className="col-12 col-sm-4">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Priority <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select text-white rounded-3 p-2.5 bg-dark border-secondary border-opacity-50"
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value)}
                        required
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    {/* Start Date * */}
                    <div className="col-12 col-sm-4">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Start Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control text-white rounded-3 p-2.5"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        required
                      />
                    </div>

                    {/* Target Date * */}
                    <div className="col-12 col-sm-4">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Target Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control text-white rounded-3 p-2.5"
                        value={formTargetDate}
                        onChange={(e) => setFormTargetDate(e.target.value)}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        required
                      />
                    </div>

                    {/* Initial Progress Slider */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label text-white fw-semibold small mb-0">
                          Current Progress
                        </label>
                        <span className="text-primary fw-bold small">{formProgress}%</span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        step="5"
                        value={formProgress}
                        onChange={(e) => setFormProgress(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-3 px-4"
                    onClick={() => setShowGoalModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 px-4 fw-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      border: "none",
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingGoal
                      ? "Update Goal"
                      : "Create Goal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. UPDATE PROGRESS MODAL ==================== */}
      {showProgressModal && progressGoal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(6px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 border-0 shadow-lg"
              style={{
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FiSliders className="text-primary" /> Update Progress
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowProgressModal(false)}
                />
              </div>

              <form onSubmit={handleSaveProgress}>
                <div className="modal-body px-4 py-4 text-center">
                  <h5 className="text-white fw-bold mb-1">🎯 {progressGoal.title}</h5>
                  <p className="text-muted small mb-4">{progressGoal.category}</p>

                  <div className="mb-4">
                    <div className="fs-1 fw-bold text-primary mb-2">
                      {progressValue}%
                    </div>

                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressValue}
                      onChange={(e) => setProgressValue(Number(e.target.value))}
                      style={{ height: "10px" }}
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`btn btn-sm ${
                          progressValue === val ? "btn-primary" : "btn-outline-secondary text-muted"
                        } rounded-pill px-3`}
                        onClick={() => setProgressValue(val)}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>

                  {progressValue >= 100 && (
                    <div className="alert bg-success bg-opacity-25 text-success border border-success border-opacity-25 rounded-3 py-2 px-3 mt-3 mb-0 small">
                      🎉 Marking progress at 100% will automatically mark this goal as Completed!
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-3 px-4"
                    onClick={() => setShowProgressModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 px-4 fw-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      border: "none",
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Progress"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 12. DELETE CONFIRMATION MODAL ==================== */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(6px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 border-0 shadow-lg"
              style={{
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="modal-body text-center p-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#EF4444",
                  }}
                >
                  <FiAlertTriangle size={36} />
                </div>
                <h4 className="text-white fw-bold mb-2">Delete Goal</h4>
                <p className="text-muted small mb-4">
                  Are you sure you want to delete this goal?
                </p>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-3 px-4"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingGoalId(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-3 px-4 fw-bold"
                    onClick={handleConfirmDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentGoals;
