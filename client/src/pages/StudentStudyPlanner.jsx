import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { getTodayDateString } from "../utils/roleUtils";
import {
  FiCalendar,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiBookOpen,
  FiEdit3,
  FiTrash2,
  FiAlertCircle,
  FiX,
  FiCheck,
  FiPieChart,
  FiLayers,
  FiBarChart2,
  FiTag,
  FiAlertTriangle,
} from "react-icons/fi";
import "../styles/studentDashboard.css";

const priorityOptions = [
  { value: "Low", label: "Low", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" },
  { value: "Medium", label: "Medium", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" },
  { value: "High", label: "High", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)" },
];

const categoryOptions = [
  "Study",
  "Assignment",
  "Revision",
  "Exam Preparation",
  "Project",
  "Other",
];

const durationPresets = [
  "15 minutes",
  "30 minutes",
  "45 minutes",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "3 hours",
];

function StudentStudyPlanner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("study-planner");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // State for study tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Toolbar state: search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // "today", "tomorrow", "this-week", "all"
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null if creating

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formStartTime, setFormStartTime] = useState("");
  const [formDuration, setFormDuration] = useState("1 hour");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formCategory, setFormCategory] = useState("Study");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch logged in student info and tasks on mount
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

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setError("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/study-tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to load study tasks.");
        setLoading(false);
        return;
      }

      setTasks(result.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching study tasks:", err);
      setError("Cannot connect to backend server.");
      setLoading(false);
    }
  };

  // Helper for showing temporary success toast
  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  // Open Modal to Create Task
  const handleOpenCreateModal = (defaultDate = getTodayDateString()) => {
    setEditingTask(null);
    setFormTitle("");
    setFormSubject("");
    setFormDescription("");
    setFormDate(defaultDate);
    setFormStartTime("");
    setFormDuration("1 hour");
    setFormPriority("Medium");
    setFormCategory("Study");
    setFormError("");
    setShowTaskModal(true);
  };

  // Open Modal to Edit Task
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title || "");
    setFormSubject(task.subject || "");
    setFormDescription(task.description || "");
    setFormDate(task.date || getTodayDateString());
    setFormStartTime(task.startTime || "");
    setFormDuration(task.duration || "1 hour");
    setFormPriority(task.priority || "Medium");
    setFormCategory(task.category || "Study");
    setFormError("");
    setShowTaskModal(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (id) => {
    setDeletingTaskId(id);
    setShowDeleteModal(true);
  };

  // Submit Handler (Create / Edit)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    setFormError("");

    // Required Field Validations
    if (!formTitle.trim()) {
      setFormError("Task Title is required.");
      return;
    }

    if (!formSubject.trim()) {
      setFormError("Subject is required.");
      return;
    }

    if (!formDate.trim()) {
      setFormError("Completion Date is required.");
      return;
    }

    if (!formPriority) {
      setFormError("Priority is required.");
      return;
    }

    if (!formCategory) {
      setFormError("Category is required.");
      return;
    }

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setFormError("Authentication token missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingTask
        ? `http://localhost:5000/api/study-tasks/${editingTask._id}`
        : "http://localhost:5000/api/study-tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          subject: formSubject.trim(),
          description: formDescription.trim(),
          date: formDate.trim(),
          startTime: formStartTime.trim(),
          duration: formDuration.trim(),
          priority: formPriority,
          category: formCategory,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setFormError(result.message || "Failed to save study task.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setShowTaskModal(false);
      showToast(
        editingTask
          ? "Study task updated successfully."
          : "Study task added successfully."
      );
      fetchTasks();
    } catch (err) {
      console.error("Save task error:", err);
      setFormError("Server error occurred while saving study task.");
      setIsSubmitting(false);
    }
  };

  // Toggle Mark Complete Status
  const handleToggleComplete = async (taskId, currentStatus) => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setError("Authentication token missing.");
      return;
    }

    const nextStatus = currentStatus === "completed" ? "pending" : "completed";

    try {
      const response = await fetch(
        `http://localhost:5000/api/study-tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update task status.");
        return;
      }

      if (nextStatus === "completed") {
        showToast("Task completed! 🎉");
      } else {
        showToast("Task marked as pending.");
      }

      fetchTasks();
    } catch (err) {
      console.error("Error toggling task status:", err);
      setError("Server error while updating status.");
    }
  };

  // Confirm Delete Task
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setError("Authentication token missing.");
      setShowDeleteModal(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/study-tasks/${deletingTaskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to delete task.");
        setIsSubmitting(false);
        setShowDeleteModal(false);
        return;
      }

      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingTaskId(null);
      showToast("Study task deleted successfully.");
      fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err);
      setError("Server error while deleting study task.");
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  // Date formatting helper
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const today = getTodayDateString();
    if (dateStr === today) return "Today";

    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return dateStr;
  };

  // Get list of unique subjects from tasks for dropdown filter
  const uniqueSubjects = useMemo(() => {
    const subjects = tasks.map((t) => t.subject).filter(Boolean);
    return Array.from(new Set(subjects)).sort();
  }, [tasks]);

  // Derived filtered task list based on Toolbar Filters
  const filteredTasks = useMemo(() => {
    const todayStr = getTodayDateString();
    const tomorrowStr = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })();

    const endOfWeekStr = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })();

    return tasks.filter((task) => {
      // Search term (title, subject, description)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = (task.title || "").toLowerCase().includes(term);
        const matchesSubject = (task.subject || "").toLowerCase().includes(term);
        const matchesDesc = (task.description || "").toLowerCase().includes(term);
        if (!matchesTitle && !matchesSubject && !matchesDesc) return false;
      }

      // Date Filter
      if (dateFilter === "today" && task.date !== todayStr) return false;
      if (dateFilter === "tomorrow" && task.date !== tomorrowStr) return false;
      if (dateFilter === "this-week") {
        if (task.date < todayStr || task.date > endOfWeekStr) return false;
      }

      // Priority Filter
      if (priorityFilter !== "All" && task.priority !== priorityFilter) return false;

      // Status Filter
      if (statusFilter !== "All" && task.status !== statusFilter.toLowerCase()) return false;

      // Subject Filter
      if (subjectFilter !== "All" && task.subject !== subjectFilter) return false;

      return true;
    });
  }, [tasks, searchTerm, dateFilter, priorityFilter, statusFilter, subjectFilter]);

  // Today's Study Tasks
  const todayDateStr = getTodayDateString();
  const todaysTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.date === todayDateStr);
  }, [filteredTasks, todayDateStr]);

  // Upcoming Study Tasks (Future dates)
  const upcomingTasks = useMemo(() => {
    return filteredTasks
      .filter((t) => t.date > todayDateStr)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.startTime || "").localeCompare(b.startTime || "");
      });
  }, [filteredTasks, todayDateStr]);

  // Database Summary Metrics (Calculated from all tasks in database for authenticated student)
  const summaryMetrics = useMemo(() => {
    const todayTasksDb = tasks.filter((t) => t.date === todayDateStr);
    const todayCompletedDb = todayTasksDb.filter((t) => t.status === "completed").length;
    const todayPendingDb = todayTasksDb.filter((t) => t.status === "pending").length;

    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
    const pendingTasksCount = tasks.filter((t) => t.status === "pending").length;

    const completionRate = totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

    return {
      todayTotal: todayTasksDb.length,
      todayCompleted: todayCompletedDb,
      todayPending: todayPendingDb,
      total: totalTasksCount,
      completed: completedTasksCount,
      pending: pendingTasksCount,
      completionRate,
    };
  }, [tasks, todayDateStr]);

  // Subject-wise progress metrics
  const subjectProgressList = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const subj = t.subject || "General";
      if (!map[subj]) map[subj] = { total: 0, completed: 0 };
      map[subj].total += 1;
      if (t.status === "completed") map[subj].completed += 1;
    });

    return Object.keys(map).map((subj) => {
      const total = map[subj].total;
      const completed = map[subj].completed;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { subject: subj, total, completed, progress };
    }).sort((a, b) => b.total - a.total);
  }, [tasks]);

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
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60A5FA",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <FiCalendar className="me-1" /> Student Productivity Module
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">Study Planner</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Plan your study sessions, organize your tasks, and stay on track.
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
            onClick={() => handleOpenCreateModal()}
          >
            <FiPlus size={20} />
            <span>+ Add Study Task</span>
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

        {/* Summary Metric Cards (Today's Tasks from DB) */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-4">
            <div className="ns-card p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Today's Tasks</span>
                <h3 className="text-white fw-bold fs-3 mb-0 mt-1">
                  {summaryMetrics.todayTotal}
                </h3>
              </div>
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA" }}
              >
                <FiCalendar size={24} />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="ns-card p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Completed</span>
                <h3 className="text-white fw-bold fs-3 mb-0 mt-1">
                  {summaryMetrics.todayCompleted}
                </h3>
              </div>
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}
              >
                <FiCheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="ns-card p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Pending</span>
                <h3 className="text-white fw-bold fs-3 mb-0 mt-1">
                  {summaryMetrics.todayPending}
                </h3>
              </div>
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}
              >
                <FiClock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= 7 & 8. SEARCH AND FILTERS TOOLBAR ================= */}
        <div className="ns-card mb-4 p-3">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-lg-4">
              <div className="position-relative">
                <FiSearch
                  className="position-absolute top-50 translate-middle-y text-muted ms-3"
                  size={18}
                />
                <input
                  type="text"
                  className="form-control text-white rounded-3 ps-5 pe-4 py-2"
                  placeholder="Search study tasks..."
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

            {/* Date Filter Tabs */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="d-flex align-items-center gap-1 bg-dark p-1 rounded-3 border border-secondary border-opacity-25">
                {[
                  { id: "all", label: "All" },
                  { id: "today", label: "Today" },
                  { id: "tomorrow", label: "Tomorrow" },
                  { id: "this-week", label: "This Week" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`btn btn-sm flex-fill rounded-2 py-1.5 px-2 fw-medium ${
                      dateFilter === tab.id
                        ? "btn-primary text-white"
                        : "text-muted hover-white"
                    }`}
                    style={{
                      background:
                        dateFilter === tab.id
                          ? "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                          : "transparent",
                      border: "none",
                      fontSize: "0.8rem",
                    }}
                    onClick={() => setDateFilter(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Dropdowns (Priority, Status, Subject) */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="row g-2">
                <div className="col-4">
                  <select
                    className="form-select form-select-sm text-white rounded-3 bg-dark border-secondary border-opacity-50"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{ fontSize: "0.78rem" }}
                  >
                    <option value="All">Priority: All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="col-4">
                  <select
                    className="form-select form-select-sm text-white rounded-3 bg-dark border-secondary border-opacity-50"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ fontSize: "0.78rem" }}
                  >
                    <option value="All">Status: All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="col-4">
                  <select
                    className="form-select form-select-sm text-white rounded-3 bg-dark border-secondary border-opacity-50"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    style={{ fontSize: "0.78rem" }}
                  >
                    <option value="All">Subjects: All</option>
                    {uniqueSubjects.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading study tasks...</span>
            </div>
            <p className="text-muted">Fetching your study plan...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* ================= 4. TODAY'S STUDY PLAN ================= */}
            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-2 rounded-3 text-white"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
                  >
                    <FiCalendar size={18} />
                  </div>
                  <h2 className="text-white fw-bold fs-5 mb-0">Today's Study Plan</h2>
                  <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary ms-1">
                    {todaysTasks.length} {todaysTasks.length === 1 ? "Task" : "Tasks"}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary text-white border-secondary border-opacity-50 rounded-3 px-3"
                  onClick={() => handleOpenCreateModal(todayDateStr)}
                >
                  <FiPlus me={1} /> Add Today Task
                </button>
              </div>

              {todaysTasks.length === 0 ? (
                /* 13. Empty State for Today's Study Plan */
                <div className="ns-card text-center py-5 px-4">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3"
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <FiCalendar size={44} style={{ color: "#60A5FA" }} />
                  </div>
                  <h4 className="text-white fw-bold mb-2">Your study plan is empty for today.</h4>
                  <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "420px", fontSize: "0.92rem" }}>
                    Add a study task to get started and keep your daily momentum going.
                  </p>
                  <button
                    type="button"
                    className="btn px-4 py-2 rounded-3 text-white fw-bold d-inline-flex align-items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      border: "none",
                    }}
                    onClick={() => handleOpenCreateModal(todayDateStr)}
                  >
                    <FiPlus size={18} /> + Add Study Task
                  </button>
                </div>
              ) : (
                /* Today's Tasks Grid */
                <div className="row g-3">
                  {todaysTasks.map((task) => {
                    const isDone = task.status === "completed";
                    const prioObj = priorityOptions.find((p) => p.value === task.priority) || priorityOptions[1];

                    return (
                      <div key={task._id} className="col-12 col-md-6 col-xl-4">
                        <div
                          className={`ns-card h-100 d-flex flex-column justify-content-between transition-all ${
                            isDone ? "opacity-75" : ""
                          }`}
                          style={{
                            borderLeft: `4px solid ${isDone ? "#10B981" : prioObj.color}`,
                            background: isDone
                              ? "rgba(15, 23, 42, 0.6)"
                              : "rgba(30, 41, 59, 0.7)",
                          }}
                        >
                          <div>
                            {/* Subject & Category Badges */}
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span
                                className="badge rounded-pill px-3 py-1 fw-bold text-white d-inline-flex align-items-center gap-1"
                                style={{
                                  background: "rgba(139, 92, 246, 0.25)",
                                  border: "1px solid rgba(139, 92, 246, 0.4)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                📘 {task.subject}
                              </span>

                              <span
                                className="badge rounded-pill px-2.5 py-1"
                                style={{
                                  background: prioObj.bg,
                                  border: `1px solid ${prioObj.border}`,
                                  color: prioObj.color,
                                  fontSize: "0.75rem",
                                }}
                              >
                                Priority: {task.priority}
                              </span>
                            </div>

                            {/* Task Title */}
                            <h3
                              className={`fw-bold fs-5 mb-2 mt-2 ${
                                isDone ? "text-decoration-line-through text-muted" : "text-white"
                              }`}
                            >
                              {isDone && <FiCheck className="text-success me-1" size={20} />}
                              {task.title}
                            </h3>

                            {/* Description */}
                            {task.description && (
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
                                {task.description}
                              </p>
                            )}

                            {/* Time & Duration Info */}
                            <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                              {task.startTime && (
                                <span className="d-flex align-items-center gap-1">
                                  <FiClock size={14} className="text-primary" />
                                  {task.startTime}
                                </span>
                              )}
                              {task.duration && (
                                <span className="d-flex align-items-center gap-1">
                                  <FiLayers size={14} className="text-info" />
                                  {task.duration}
                                </span>
                              )}
                              <span className="badge bg-dark text-muted border border-secondary border-opacity-25 ms-auto">
                                {task.category}
                              </span>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                            {isDone ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success border-success border-opacity-50 text-success rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1"
                                onClick={() => handleToggleComplete(task._id, task.status)}
                              >
                                <FiCheck size={16} /> Completed
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-success rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1 text-white shadow-sm"
                                style={{
                                  background: "linear-gradient(135deg, #10B981, #059669)",
                                  border: "none",
                                }}
                                onClick={() => handleToggleComplete(task._id, task.status)}
                              >
                                <FiCheckCircle size={16} /> Mark Complete
                              </button>
                            )}

                            <div className="d-flex align-items-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm text-muted hover-white p-1.5 rounded-2"
                                onClick={() => handleOpenEditModal(task)}
                                title="Edit Task"
                              >
                                <FiEdit3 size={17} className="text-warning" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm text-muted hover-white p-1.5 rounded-2"
                                onClick={() => handleOpenDeleteModal(task._id)}
                                title="Delete Task"
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

            {/* ================= 6. UPCOMING TASKS ================= */}
            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-2 rounded-3 text-white"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
                  >
                    <FiClock size={18} />
                  </div>
                  <h2 className="text-white fw-bold fs-5 mb-0">Upcoming Tasks</h2>
                  <span className="badge rounded-pill bg-purple bg-opacity-25 text-purple ms-1" style={{ color: "#C084FC" }}>
                    {upcomingTasks.length} {upcomingTasks.length === 1 ? "Task" : "Tasks"}
                  </span>
                </div>
              </div>

              {upcomingTasks.length === 0 ? (
                /* Empty state for upcoming */
                <div className="ns-card text-center py-4 px-4">
                  <p className="text-muted mb-0">No upcoming study tasks scheduled.</p>
                </div>
              ) : (
                /* Upcoming Table / Card list */
                <div className="row g-3">
                  {upcomingTasks.map((task) => {
                    const prioObj = priorityOptions.find((p) => p.value === task.priority) || priorityOptions[1];
                    const isDone = task.status === "completed";

                    return (
                      <div key={task._id} className="col-12 col-md-6 col-xl-4">
                        <div
                          className={`ns-card h-100 d-flex flex-column justify-content-between ${
                            isDone ? "opacity-75" : ""
                          }`}
                          style={{
                            borderLeft: `4px solid ${isDone ? "#10B981" : prioObj.color}`,
                          }}
                        >
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="badge bg-dark text-primary border border-primary border-opacity-25 px-2.5 py-1">
                                📅 {formatDateDisplay(task.date)}
                              </span>
                              <span
                                className="badge rounded-pill px-2.5 py-1"
                                style={{
                                  background: prioObj.bg,
                                  border: `1px solid ${prioObj.border}`,
                                  color: prioObj.color,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <div className="text-muted small mb-1 fw-semibold text-uppercase" style={{ letterSpacing: "0.5px" }}>
                              {task.subject}
                            </div>

                            <h4 className="text-white fw-bold fs-6 mb-2">
                              {task.title}
                            </h4>

                            <div className="d-flex align-items-center gap-3 text-muted small mb-2">
                              {task.startTime && (
                                <span>⏰ {task.startTime}</span>
                              )}
                              {task.duration && (
                                <span>⏳ {task.duration}</span>
                              )}
                              <span className="badge bg-dark text-muted ms-auto">
                                {task.category}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                isDone ? "btn-outline-success text-success" : "btn-outline-primary text-info"
                              } rounded-3 px-2.5 py-1 text-xs`}
                              onClick={() => handleToggleComplete(task._id, task.status)}
                            >
                              {isDone ? "✓ Completed" : "Mark Complete"}
                            </button>

                            <div className="d-flex align-items-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm text-muted hover-white p-1"
                                onClick={() => handleOpenEditModal(task)}
                              >
                                <FiEdit3 size={15} className="text-warning" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm text-muted hover-white p-1"
                                onClick={() => handleOpenDeleteModal(task._id)}
                              >
                                <FiTrash2 size={15} className="text-danger" />
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

            {/* ================= 11 & 12. WEEKLY OVERVIEW & SUBJECT PROGRESS ================= */}
            <div className="row g-4 mb-4">
              {/* 11. Weekly Study Overview */}
              <div className="col-12 col-lg-6">
                <div className="ns-card h-100 p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="p-2 rounded-3 text-white"
                        style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)" }}
                      >
                        <FiPieChart size={20} />
                      </div>
                      <h2 className="text-white fw-bold fs-5 mb-0">Weekly Study Overview</h2>
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-6 col-sm-3 text-center">
                      <span className="text-muted small">Total Tasks</span>
                      <h4 className="text-white fw-bold fs-4 mb-0 mt-1">
                        {summaryMetrics.total}
                      </h4>
                    </div>
                    <div className="col-6 col-sm-3 text-center">
                      <span className="text-muted small">Completed</span>
                      <h4 className="text-success fw-bold fs-4 mb-0 mt-1">
                        {summaryMetrics.completed}
                      </h4>
                    </div>
                    <div className="col-6 col-sm-3 text-center">
                      <span className="text-muted small">Pending</span>
                      <h4 className="text-warning fw-bold fs-4 mb-0 mt-1">
                        {summaryMetrics.pending}
                      </h4>
                    </div>
                    <div className="col-6 col-sm-3 text-center">
                      <span className="text-muted small">Rate</span>
                      <h4 className="text-info fw-bold fs-4 mb-0 mt-1">
                        {summaryMetrics.completionRate}%
                      </h4>
                    </div>
                  </div>

                  {/* Completion Rate Progress Indicator */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Overall Task Completion Rate</span>
                      <span className="text-white fw-bold">{summaryMetrics.completionRate}%</span>
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
                          width: `${summaryMetrics.completionRate}%`,
                          background: "linear-gradient(90deg, #3B82F6, #10B981)",
                          borderRadius: "10px",
                          transition: "width 0.6s ease",
                        }}
                        aria-valuenow={summaryMetrics.completionRate}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 12. Subject-Wise Progress */}
              <div className="col-12 col-lg-6">
                <div className="ns-card h-100 p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="p-2 rounded-3 text-white"
                        style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
                      >
                        <FiBarChart2 size={20} />
                      </div>
                      <h2 className="text-white fw-bold fs-5 mb-0">Subject Progress</h2>
                    </div>
                  </div>

                  {subjectProgressList.length === 0 ? (
                    <p className="text-muted text-center py-3 mb-0">
                      No subject progress available yet. Add tasks with subjects.
                    </p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {subjectProgressList.map((item) => (
                        <div key={item.subject}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-white fw-semibold small">
                              📘 {item.subject}
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
      </main>

      {/* Footer */}
      <DashboardFooter />

      {/* ==================== 2 & 9. ADD / EDIT TASK MODAL ==================== */}
      {showTaskModal && (
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
              {/* Header */}
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FiCalendar className="text-primary" />
                  {editingTask ? "Edit Study Task" : "Add Study Task"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowTaskModal(false)}
                />
              </div>

              <form onSubmit={handleSaveTask}>
                <div className="modal-body px-4 py-4">
                  {/* Validation Error Message */}
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
                    {/* Task Title * */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Task Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control text-white rounded-3 p-2.5"
                        placeholder="e.g. Study DBMS Normalization"
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

                    {/* Subject * */}
                    <div className="col-12 col-md-6">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Subject <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control text-white rounded-3 p-2.5"
                        placeholder="e.g. Database Management Systems"
                        value={formSubject}
                        onChange={(e) => {
                          setFormSubject(e.target.value);
                          if (formError) setFormError("");
                        }}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        required
                      />
                    </div>

                    {/* Description (Optional) */}
                    <div className="col-12">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Description <span className="text-muted">(Optional)</span>
                      </label>
                      <textarea
                        className="form-control text-white rounded-3 p-2.5"
                        rows={2}
                        placeholder="Add notes, chapter references, or specifics..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      />
                    </div>

                    {/* Date * */}
                    <div className="col-12 col-sm-4">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Completion Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control text-white rounded-3 p-2.5"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        required
                      />
                    </div>

                    {/* Start Time */}
                    <div className="col-12 col-sm-4">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Start Time <span className="text-muted">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control text-white rounded-3 p-2.5"
                        placeholder="e.g. 7:00 PM"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      />
                    </div>

                    {/* Duration */}
                    <div className="col-12 col-sm-4">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Duration
                      </label>
                      <select
                        className="form-select text-white rounded-3 p-2.5 bg-dark border-secondary border-opacity-50"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                      >
                        {durationPresets.map((dur) => (
                          <option key={dur} value={dur}>
                            {dur}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority * */}
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-white fw-semibold small mb-1">
                        Priority <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-2">
                        {priorityOptions.map((prio) => {
                          const isSelected = formPriority === prio.value;
                          return (
                            <button
                              key={prio.value}
                              type="button"
                              className="btn flex-fill py-2 rounded-3 text-white fw-semibold text-xs"
                              style={{
                                background: isSelected ? prio.bg : "rgba(255, 255, 255, 0.03)",
                                border: isSelected
                                  ? `2px solid ${prio.color}`
                                  : "1px solid rgba(255, 255, 255, 0.1)",
                                color: isSelected ? "#FFF" : prio.color,
                              }}
                              onClick={() => setFormPriority(prio.value)}
                            >
                              {prio.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category * */}
                    <div className="col-12 col-sm-6">
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
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-3 px-4"
                    onClick={() => setShowTaskModal(false)}
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
                      : editingTask
                      ? "Update Task"
                      : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 10. DELETE CONFIRMATION MODAL ==================== */}
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
                <h4 className="text-white fw-bold mb-2">Delete Study Task</h4>
                <p className="text-muted small mb-4">
                  Are you sure you want to delete this study task?
                </p>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-3 px-4"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingTaskId(null);
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

export default StudentStudyPlanner;
