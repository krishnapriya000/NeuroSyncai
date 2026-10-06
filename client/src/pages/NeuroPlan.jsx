import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import WeeklyToDoPlanner from "../components/dashboard/WeeklyToDoPlanner";

import {
  FiCalendar,
  FiClock,
  FiZap,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiSun,
  FiMoon,
  FiAlertCircle,
  FiBell,
  FiAward,
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiActivity,
  FiTarget,
  FiHeart,
  FiBarChart2,
  FiCheck,
  FiX
} from "react-icons/fi";

function NeuroPlan() {
  const navigate = useNavigate();

  // Helper to format long concatenated task titles into clean bullet points
  const renderFormattedTaskContent = (titleText, descText, isCompleted) => {
    if (!titleText) return null;

    let cleanText = titleText.replace(/([a-z0-9])([A-Z])/g, "$1 | $2");
    const commonVerbs = ["Attend", "Review", "Complete", "Study", "Practice", "Work", "Read", "Prepare", "Spend", "Write", "Finish", "Check", "Organize", "Submit"];
    commonVerbs.forEach((v) => {
      const regex = new RegExp(`(?<=[a-z0-9])\\s+(${v})`, "g");
      cleanText = cleanText.replace(regex, " | $1");
    });

    const parts = cleanText.split("|").map((p) => p.trim()).filter(Boolean);

    if (parts.length <= 1) {
      return (
        <div>
          <h6 className={`fw-bold mb-1 fs-6 journal-handwriting ${isCompleted ? "text-decoration-line-through text-success opacity-75" : ""}`}>
            {titleText}
          </h6>
          {descText && <p className="text-muted small mb-1" style={{ fontSize: "0.84rem", lineHeight: "1.4" }}>{descText}</p>}
        </div>
      );
    }

    return (
      <div>
        <h6 className={`fw-bold mb-2 fs-6 journal-handwriting ${isCompleted ? "text-decoration-line-through text-success opacity-75" : ""}`} style={{ color: "#a855f7" }}>
          📌 Scheduled Focus Block ({parts.length} Core Actions)
        </h6>
        <ul className="mb-2 ps-3 small" style={{ fontSize: "0.86rem", lineHeight: "1.5" }}>
          {parts.map((item, idx) => (
            <li key={idx} className={`mb-1 ${isCompleted ? "text-decoration-line-through text-muted" : ""}`}>
              {item}
            </li>
          ))}
        </ul>
        {descText && <p className="text-muted extra-small mb-1 opacity-75">{descText}</p>}
      </div>
    );
  };

  // View Mode: "weekly-todo" (Aesthetic Weekly To-Do Planner) vs "ai-daily" (AI Daily Schedule)
  const [activeViewTab, setActiveViewTab] = useState("weekly-todo");

  // Navigation & User State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfessional, setIsProfessional] = useState(false);

  // Date State ("YYYY-MM-DD")
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  // Plan State
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [historicalStats, setHistoricalStats] = useState(null);

  // Rough Plan Form State
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [energyLevel, setEnergyLevel] = useState("Medium");
  const [roughTasks, setRoughTasks] = useState([
    { id: "1", title: "", description: "", priority: "High" }
  ]);
  const [fixedCommitments, setFixedCommitments] = useState([]);

  // Toast / Feedback State
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Modals
  const [editTaskModal, setEditTaskModal] = useState(null); // task object
  const [rescheduleModal, setRescheduleModal] = useState(null); // task object
  const [rescheduleTarget, setRescheduleTarget] = useState("tomorrow"); // "later_today", "choose_time", "tomorrow"
  const [rescheduleTime, setRescheduleTime] = useState("17:00");
  const [rescheduleDate, setRescheduleDate] = useState("");

  // Reflection State
  const [userReflectionNotes, setUserReflectionNotes] = useState("");
  const [submittingReflection, setSubmittingReflection] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        const roleClean = (u.role || "").trim().toLowerCase();
        if (roleClean === "working professional" || roleClean === "professional") {
          setIsProfessional(true);
        }
      } catch (e) {
        console.error("Error parsing user profile:", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchPlanForDate(selectedDate);
    fetchHistoricalAnalytics();
  }, [selectedDate]);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setFeedbackMsg(msg);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const fetchPlanForDate = async (dateStr) => {
    setLoading(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/neuroplan/${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.data) {
          setPlan(json.data);
          setWakeUpTime(json.data.wakeUpTime || "07:00");
          setSleepTime(json.data.sleepTime || "23:00");
          setEnergyLevel(json.data.energyLevel || "Medium");
          if (json.data.fixedCommitments) setFixedCommitments(json.data.fixedCommitments);
          if (json.data.reflection && json.data.reflection.userNotes) {
            setUserReflectionNotes(json.data.reflection.userNotes);
          }
        } else {
          setPlan(null);
        }
      } else {
        setPlan(null);
      }
    } catch (err) {
      console.error("Error fetching daily plan:", err);
      showToast("Failed to load plan for selected date", true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalAnalytics = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/neuroplan/history/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setHistoricalStats(json.data);
      }
    } catch (err) {
      console.error("Error fetching historical analytics:", err);
    }
  };

  // Date selector handlers
  const handleDateChange = (offset) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayStr());
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, options);
  };

  // Rough tasks list management
  const handleAddRoughTask = () => {
    setRoughTasks([
      ...roughTasks,
      { id: Date.now().toString(), title: "", description: "", priority: "Medium" }
    ]);
  };

  const handleRemoveRoughTask = (id) => {
    setRoughTasks(roughTasks.filter((t) => t.id !== id));
  };

  const handleRoughTaskChange = (id, field, value) => {
    setRoughTasks(
      roughTasks.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Fixed commitments management
  const handleAddCommitment = () => {
    setFixedCommitments([
      ...fixedCommitments,
      { title: "College/Work", startTime: "09:00", endTime: "16:00" }
    ]);
  };

  const handleRemoveCommitment = (idx) => {
    setFixedCommitments(fixedCommitments.filter((_, i) => i !== idx));
  };

  const handleCommitmentChange = (idx, field, value) => {
    setFixedCommitments(
      fixedCommitments.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  // Generate Plan Handler
  const handleGeneratePlan = async () => {
    const validRoughTasks = roughTasks.filter((t) => t.title && t.title.trim());
    if (validRoughTasks.length === 0 && fixedCommitments.length === 0) {
      showToast("Please enter at least one task or fixed commitment to generate your plan.", true);
      return;
    }

    setGenerating(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/neuroplan/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          wakeUpTime,
          sleepTime,
          energyLevel,
          roughTasks: validRoughTasks,
          fixedCommitments,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlan(json.data);
        showToast(json.message || "✨ AI Daily Plan successfully generated!");
        window.dispatchEvent(new Event("neurosync_unread_notifications_updated"));
      } else {
        showToast(json.message || "Failed to generate plan", true);
      }
    } catch (err) {
      console.error("Generate Plan error:", err);
      showToast("Network error generating daily plan", true);
    } finally {
      setGenerating(false);
    }
  };

  // Complete Task Handler
  const handleToggleComplete = async (task) => {
    const token = localStorage.getItem("neurosync_token");
    const isCompletedNow = task.status !== "completed";

    try {
      const res = await fetch(`http://localhost:5000/api/neuroplan/task/${task.taskId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          completed: isCompletedNow,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlan(json.data);
        showToast(json.message || "Task status updated!");
      } else {
        showToast(json.message || "Error updating task completion", true);
      }
    } catch (err) {
      console.error("Complete task error:", err);
      showToast("Failed to update task completion", true);
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task from your plan?")) return;
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/neuroplan/task/${taskId}?date=${selectedDate}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlan(json.data);
        showToast("Task removed from plan.");
      } else {
        showToast(json.message || "Failed to delete task", true);
      }
    } catch (err) {
      console.error("Delete task error:", err);
      showToast("Error deleting task", true);
    }
  };

  // Save Edit Task Handler
  const handleSaveEditTask = async () => {
    if (!editTaskModal || !editTaskModal.title.trim()) return;
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/neuroplan/task/${editTaskModal.taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          title: editTaskModal.title,
          description: editTaskModal.description,
          startTime: editTaskModal.startTime,
          duration: editTaskModal.duration,
          priority: editTaskModal.priority,
          type: editTaskModal.type,
          reminderOption: editTaskModal.reminderOption,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlan(json.data);
        setEditTaskModal(null);
        showToast("Task updated successfully!");
      } else {
        showToast(json.message || "Failed to update task", true);
      }
    } catch (err) {
      console.error("Save edit task error:", err);
      showToast("Error saving task edits", true);
    }
  };

  // Reschedule Task Handler
  const handleConfirmReschedule = async () => {
    if (!rescheduleModal) return;
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/neuroplan/task/${rescheduleModal.taskId}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          targetOption: rescheduleTarget,
          newTime: rescheduleTime,
          newDate: rescheduleDate,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlan(json.data);
        setRescheduleModal(null);
        showToast(json.message || "Task rescheduled!");
      } else {
        showToast(json.message || "Failed to reschedule task", true);
      }
    } catch (err) {
      console.error("Reschedule task error:", err);
      showToast("Error rescheduling task", true);
    }
  };

  // Submit Reflection Handler
  const handleSubmitReflection = async () => {
    if (!plan || !plan._id) return;
    setSubmittingReflection(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/neuroplan/${plan._id}/reflect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userNotes: userReflectionNotes }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlan(json.data);
        showToast("🌙 Reflection recorded! Check out your AI suggestions.");
      } else {
        showToast(json.message || "Failed to save reflection", true);
      }
    } catch (err) {
      console.error("Reflection submit error:", err);
      showToast("Error submitting reflection", true);
    } finally {
      setSubmittingReflection(false);
    }
  };

  // Calculate stats from plan
  const tasksList = plan ? plan.tasks || [] : [];
  const countableTasks = tasksList.filter((t) => t.type !== "break");
  const completedTasks = countableTasks.filter((t) => t.status === "completed");
  const highPriorityTasks = countableTasks.filter((t) => t.priority === "High");
  const completedHighPriority = highPriorityTasks.filter((t) => t.status === "completed");
  const completionRate = plan ? plan.completionPercentage || 0 : 0;

  return (
    <div className="dashboard-container">
      {/* 1. SIDEBAR */}
      {isProfessional ? (
        <ProfessionalSidebar
          activeTab="neuroplan"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      ) : (
        <Sidebar
          activeTab="neuroplan"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      )}

      {/* 2. NAVBAR */}
      {isProfessional ? (
        <ProfessionalNavbar
          userName={user?.fullName || "User"}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      ) : (
        <TopNavbar
          userName={user?.fullName || "User"}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="ns-main-content">
        {/* Toast Feedbacks */}
        {feedbackMsg && (
          <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
            <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 shadow-lg border-0 text-white" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
              <FiCheckCircle size={20} />
              <span>{feedbackMsg}</span>
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
            <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 shadow-lg border-0 text-white" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}>
              <FiAlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* SECTION A: HEADER BANNER */}
        <div
          className="p-4 mb-4 rounded-4 text-white ns-keep-white position-relative overflow-hidden shadow-lg border border-secondary border-opacity-25"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #311B92 100%)",
          }}
        >
          <div
            className="position-absolute"
            style={{
              top: "-60px",
              right: "-60px",
              width: "280px",
              height: "280px",
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)",
              pointerEvents: "none"
            }}
          />

          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-7 mb-3 mb-lg-0">
              <span className="badge bg-purple-900 bg-opacity-50 text-purple-200 px-3 py-1.5 rounded-pill mb-2 border border-purple-400 border-opacity-30 d-inline-flex align-items-center gap-1.5" style={{ fontSize: "0.82rem", background: "rgba(124, 58, 237, 0.2)", color: "#C4B5FD" }}>
                <FiStar className="text-warning" /> NeuroPlan – AI Personalized Daily Planner
              </span>
              <h1 className="fw-bold fs-2 mb-1 text-white ns-keep-white">Plan your day. Focus on what matters. Grow every day.</h1>
              <p className="mb-0 ns-keep-white" style={{ fontSize: "0.95rem", color: "#CBD5E1" }}>
                Transform your rough input into a realistic, balanced schedule powered by AI.
              </p>
            </div>

            {/* DATE SELECTOR */}
            <div className="col-lg-5 d-flex flex-column align-items-lg-end">
              <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-60 p-2 rounded-4 border border-secondary border-opacity-25 shadow-sm">
                <button
                  className="btn btn-sm btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                  onClick={() => handleDateChange(-1)}
                  title="Previous Day"
                >
                  <FiChevronLeft size={18} />
                </button>

                <div className="text-center px-3">
                  <div className="fw-bold text-white fs-6 d-flex align-items-center gap-1.5">
                    <FiCalendar className="text-primary" /> {formatDisplayDate(selectedDate)}
                  </div>
                  {selectedDate === getTodayStr() && (
                    <span className="badge bg-success bg-opacity-25 text-success extra-small rounded-pill" style={{ fontSize: "0.68rem" }}>
                      Today
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-sm btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                  onClick={() => handleDateChange(1)}
                  title="Next Day"
                >
                  <FiChevronRight size={18} />
                </button>

                <button
                  className="btn btn-sm btn-primary rounded-pill px-3 py-1 ms-1 d-flex align-items-center gap-1"
                  onClick={handleSetToday}
                  style={{ fontSize: "0.78rem" }}
                >
                  Today
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary rounded-circle p-2 text-white-50 ms-1 d-flex align-items-center justify-content-center"
                  onClick={() => fetchPlanForDate(selectedDate)}
                  title="Refresh Plan"
                >
                  <FiRefreshCw size={14} className={loading ? "spin" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VIEW MODE SELECTION TABS */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 p-2.5 rounded-4 ns-view-tab-container">
          <div className="nav nav-pills gap-2">
            <button
              type="button"
              className={`nav-link rounded-pill px-3.5 py-2.5 fw-bold d-flex align-items-center gap-2 border-0 transition-all ${
                activeViewTab === "weekly-todo" ? "text-white shadow-lg ns-keep-white" : "ns-view-tab-btn-inactive"
              }`}
              style={activeViewTab === "weekly-todo" ? { background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)" } : { background: "transparent" }}
              onClick={() => setActiveViewTab("weekly-todo")}
            >
              <span>🌸 Aesthetic Weekly To-Do Planner</span>
              <span className="badge bg-white text-dark rounded-pill px-2 py-0.5 ms-1" style={{ fontSize: "0.68rem" }}>Popular</span>
            </button>

            <button
              type="button"
              className={`nav-link rounded-pill px-3.5 py-2.5 fw-bold d-flex align-items-center gap-2 border-0 transition-all ${
                activeViewTab === "ai-daily" ? "text-white shadow-lg ns-keep-white" : "ns-view-tab-btn-inactive"
              }`}
              style={activeViewTab === "ai-daily" ? { background: "linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)", boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)" } : { background: "transparent" }}
              onClick={() => setActiveViewTab("ai-daily")}
            >
              <FiZap />
              <span>AI Daily Focus Schedule</span>
            </button>
          </div>
        </div>

        {activeViewTab === "weekly-todo" ? (
          <div className="mb-5">
            <WeeklyToDoPlanner userRole={user?.role} />
          </div>
        ) : (
          <>
            {/* SECTION B: DAILY OVERVIEW CARDS */}
            <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-lg-2">
            <div className="ns-overview-metric-card h-100 d-flex flex-column justify-content-between">
              <span className="text-muted extra-small fw-semibold text-uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>Wake Up</span>
              <div className="d-flex align-items-center gap-2.5 mt-2">
                <div className="ns-metric-icon-pod ns-metric-pod-warning">
                  <FiSun />
                </div>
                <span className="fw-bold fs-5">{wakeUpTime}</span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ns-overview-metric-card h-100 d-flex flex-column justify-content-between">
              <span className="text-muted extra-small fw-semibold text-uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>Sleep Time</span>
              <div className="d-flex align-items-center gap-2.5 mt-2">
                <div className="ns-metric-icon-pod ns-metric-pod-indigo">
                  <FiMoon />
                </div>
                <span className="fw-bold fs-5">{sleepTime}</span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ns-overview-metric-card h-100 d-flex flex-column justify-content-between">
              <span className="text-muted extra-small fw-semibold text-uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>Energy Level</span>
              <div className="d-flex align-items-center gap-2 mt-2">
                <div className="ns-metric-icon-pod ns-metric-pod-primary">
                  <FiZap />
                </div>
                <span className={`badge px-2.5 py-1.5 rounded-pill fw-bold ${energyLevel === "High" ? "bg-success" : energyLevel === "Medium" ? "bg-primary" : "bg-warning text-dark"}`}>
                  {energyLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ns-overview-metric-card h-100 d-flex flex-column justify-content-between">
              <span className="text-muted extra-small fw-semibold text-uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>Tasks Done</span>
              <div className="d-flex align-items-center gap-2.5 mt-2">
                <div className="ns-metric-icon-pod ns-metric-pod-success">
                  <FiCheckCircle />
                </div>
                <span className="fw-bold fs-5">
                  {completedTasks.length} / {countableTasks.length}
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ns-overview-metric-card h-100 d-flex flex-column justify-content-between">
              <span className="text-muted extra-small fw-semibold text-uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>Completion</span>
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold fs-6">{completionRate}%</span>
                </div>
                <div className="progress bg-dark bg-opacity-50" style={{ height: "6px", borderRadius: "10px" }}>
                  <div
                    className="progress-bar bg-success rounded-pill"
                    role="progressbar"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ns-overview-metric-card h-100 d-flex flex-column justify-content-between">
              <span className="text-muted extra-small fw-semibold text-uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>High Priority</span>
              <div className="d-flex align-items-center gap-2.5 mt-2">
                <div className="ns-metric-icon-pod ns-metric-pod-rose">
                  <FiAward />
                </div>
                <span className="fw-bold fs-5">
                  {completedHighPriority.length} / {highPriorityTasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: PLAN YOUR DAY INPUT FORM */}
        <div className="ns-planner-card mb-4 p-4 shadow-lg">
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-primary bg-opacity-15 text-primary">
                <FiStar className="fs-5 text-warning" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold fs-5 d-flex align-items-center gap-2">
                  Plan Your Day Input
                </h5>
                <span className="text-muted extra-small">
                  Smart AI Schedule Command Center
                </span>
              </div>
            </div>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill border border-primary border-opacity-25 fw-semibold" style={{ fontSize: "0.78rem" }}>
              ✨ Enter rough schedule & let AI optimize timings
            </span>
          </div>

          <div>
            <div className="row g-3 mb-4">
              {/* Wake-up Time */}
              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-semibold mb-1.5">Wake-up Time</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary border-opacity-25 text-warning">
                    <FiSun size={18} />
                  </span>
                  <input
                    type="time"
                    className="form-control ns-planner-input border-start-0"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Sleep Time */}
              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-semibold mb-1.5">Sleep Time</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary border-opacity-25 text-info">
                    <FiMoon size={18} />
                  </span>
                  <input
                    type="time"
                    className="form-control ns-planner-input border-start-0"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Energy Level Selector */}
              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-semibold mb-1.5">Energy Level for the Day</label>
                <div className="d-flex gap-2">
                  {[
                    { id: "Low", label: "🔋 Low", activeClass: "active-low" },
                    { id: "Medium", label: "⚡ Medium", activeClass: "active-medium" },
                    { id: "High", label: "🚀 High", activeClass: "active-high" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`btn flex-grow-1 ns-energy-btn ${energyLevel === lvl.id ? lvl.activeClass : ""}`}
                      onClick={() => setEnergyLevel(lvl.id)}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixed Commitments */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2.5">
                <label className="form-label text-muted small fw-semibold mb-0 d-flex align-items-center gap-1.5">
                  🏢 Fixed Commitments (College / Work / Meetings)
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={handleAddCommitment}
                  style={{ fontSize: "0.8rem" }}
                >
                  <FiPlus size={15} /> Add Commitment
                </button>
              </div>

              {fixedCommitments.length === 0 ? (
                <div className="p-3 text-muted small rounded-3 ns-planner-row-card text-center opacity-75">
                  No fixed commitments added (Optional). e.g. College 9:00 AM – 4:00 PM
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {fixedCommitments.map((fc, idx) => (
                    <div key={idx} className="ns-planner-row-card">
                      <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-5">
                          <input
                            type="text"
                            className="form-control ns-planner-input"
                            placeholder="Commitment Title (e.g. College / Work)"
                            value={fc.title}
                            onChange={(e) => handleCommitmentChange(idx, "title", e.target.value)}
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          <input
                            type="time"
                            className="form-control ns-planner-input"
                            value={fc.startTime}
                            onChange={(e) => handleCommitmentChange(idx, "startTime", e.target.value)}
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          <input
                            type="time"
                            className="form-control ns-planner-input"
                            value={fc.endTime}
                            onChange={(e) => handleCommitmentChange(idx, "endTime", e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-1 text-md-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-1"
                            onClick={() => handleRemoveCommitment(idx)}
                            title="Remove Commitment"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks You Want To Complete Today (Single-Line 12-Col Grid) */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2.5">
                <label className="form-label text-muted small fw-semibold mb-0 d-flex align-items-center gap-1.5">
                  📝 Tasks You Want To Complete Today
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={handleAddRoughTask}
                  style={{ fontSize: "0.8rem" }}
                >
                  <FiPlus size={15} /> Add Task
                </button>
              </div>

              <div className="d-flex flex-column gap-2.5">
                {roughTasks.map((t, index) => (
                  <div key={t.id} className="ns-planner-row-card">
                    <div className="row g-2 align-items-center">
                      <div className="col-12 col-md-5">
                        <input
                          type="text"
                          className="form-control ns-planner-input"
                          placeholder={`Task ${index + 1} (e.g. Complete Java assignment, Exercise...)`}
                          value={t.title}
                          onChange={(e) => handleRoughTaskChange(t.id, "title", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <input
                          type="text"
                          className="form-control ns-planner-input"
                          placeholder="Optional description"
                          value={t.description}
                          onChange={(e) => handleRoughTaskChange(t.id, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-8 col-md-2">
                        <select
                          className="form-select ns-planner-input fw-semibold"
                          value={t.priority}
                          onChange={(e) => handleRoughTaskChange(t.id, "priority", e.target.value)}
                        >
                          <option value="High">🔴 High</option>
                          <option value="Medium">🔵 Medium</option>
                          <option value="Low">🟢 Low</option>
                        </select>
                      </div>
                      <div className="col-4 col-md-1 text-end">
                        {roughTasks.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-1"
                            onClick={() => handleRemoveRoughTask(t.id)}
                            title="Delete Task"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GENERATE BUTTON BAR */}
            <div className="mt-4 pt-2 text-end">
              <button
                type="button"
                className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg d-inline-flex align-items-center gap-2.5"
                onClick={handleGeneratePlan}
                disabled={generating}
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #06B6D4 100%)",
                  border: "none",
                  boxShadow: "0 8px 25px rgba(124, 58, 237, 0.35)",
                  transition: "all 0.3s ease",
                }}
              >
                {generating ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>AI Analyzing & Optimizing Schedule...</span>
                  </>
                ) : (
                  <>
                    <FiStar className="text-warning fs-5" />
                    <span className="fs-6">✨ Generate My Day</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOTIVATIONAL STICKY NOTES PIN-BOARD FOR DAILY PLAN */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
              📌 Today's Motive & Mindset Sticky Board
            </h5>
            <span className="text-muted small">Daily Focus Affirmations</span>
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-3">
              <div className="ns-sticky-note-card ns-sticky-yellow h-100" style={{ transform: "rotate(-1.8deg)" }}>
                <div className="ns-push-pin" />
                <h6 className="fw-bold mb-2 journal-handwriting fs-4">✨ Daily Motive</h6>
                <p className="journal-handwriting fs-5 mb-0" style={{ lineHeight: "1.3" }}>
                  “Focus on completing tasks one step at a time. High quality effort brings deep mastery!”
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="ns-sticky-note-card ns-sticky-cyan h-100" style={{ transform: "rotate(1.5deg)" }}>
                <div className="ns-sticky-tape" />
                <h6 className="fw-bold mb-2 journal-handwriting fs-4">💡 Rest & Energy</h6>
                <p className="journal-handwriting fs-5 mb-0" style={{ lineHeight: "1.3" }}>
                  “Respect your break intervals. Short rests prevent fatigue and keep your focus peak.”
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="ns-sticky-note-card ns-sticky-pink h-100" style={{ transform: "rotate(-1.2deg)" }}>
                <div className="ns-push-pin" />
                <h6 className="fw-bold mb-2 journal-handwriting fs-4">💖 Mindful Growth</h6>
                <p className="journal-handwriting fs-5 mb-0" style={{ lineHeight: "1.3" }}>
                  “Every completed block is a win. Celebrate your daily discipline!”
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="ns-sticky-note-card ns-sticky-mint h-100" style={{ transform: "rotate(2.2deg)" }}>
                <div className="ns-sticky-tape" />
                <h6 className="fw-bold mb-2 journal-handwriting fs-4">🎯 High Priority</h6>
                <p className="journal-handwriting fs-5 mb-0" style={{ lineHeight: "1.3" }}>
                  “Tackle your high-priority target during your optimal morning focus window.”
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: DAILY SCHEDULE TIMELINE - STYLED AS DIARY NOTEBOOK */}
        <div className="ns-diary-book mb-4">
          <div className="ns-diary-margin-line" />
          <div className="ns-diary-bookmark" title="Diary Planner Bookmark" />

          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h4 className="text-white fw-bold mb-0 d-flex align-items-center gap-2 journal-handwriting fs-2">
                🗓️ Today's AI Personalized Schedule
              </h4>
              <span className="text-muted small">
                {formatDisplayDate(selectedDate)}
              </span>
            </div>
            {plan && plan.tasks && plan.tasks.length > 0 && (
              <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 px-3 py-1.5 rounded-pill text-xs">
                ✨ {plan.tasks.length} Scheduled Blocks
              </span>
            )}
          </div>

          <div>
            {loading ? (
              <div className="py-5 text-center text-muted">
                <div className="spinner-border text-primary mb-2" role="status" />
                <p className="mb-0">Loading your schedule...</p>
              </div>
            ) : !plan || !plan.tasks || plan.tasks.length === 0 ? (
              <div className="py-5 text-center">
                <div className="fs-1 text-muted mb-2">🗓️</div>
                <h6 className="fw-bold text-white mb-2">No Plan Generated For This Date Yet</h6>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto" }}>
                  Fill in your wake-up time, sleep time, and rough tasks above, then click <strong>✨ Generate My Day</strong> to create your AI schedule.
                </p>
              </div>
            ) : (
              <div>
                {/* AI Guidance Summary Banner */}
                {(plan.daySummary || plan.aiGuidance) && (
                  <div className="p-3 mb-4 rounded-3 border border-purple-500 border-opacity-30 bg-purple-950 bg-opacity-40" style={{ background: "rgba(88, 28, 135, 0.25)", color: "#E9D5FF" }}>
                    {plan.daySummary && (
                      <div className="fw-bold mb-1 d-flex align-items-center gap-2 text-white journal-handwriting fs-4">
                        <FiStar className="text-warning" /> {plan.daySummary}
                      </div>
                    )}
                    {plan.aiGuidance && (
                      <div className="small text-purple-200" style={{ color: "#DDD6FE" }}>
                        💡 <strong>AI Guidance:</strong> {plan.aiGuidance}
                      </div>
                    )}
                  </div>
                )}

                {/* TIMELINE LIST */}
                <div className="d-flex flex-column gap-3">
                  {plan.tasks.map((task) => {
                    const isCompleted = task.status === "completed";
                    const isBreak = task.type === "break";
                    const isRescheduled = task.status === "rescheduled";

                    return (
                      <div
                        key={task.taskId || task._id}
                        className={`p-3.5 rounded-4 border transition-all ${
                          isCompleted
                            ? "bg-dark bg-opacity-30 border-success border-opacity-40 opacity-75"
                            : isBreak
                            ? "bg-dark bg-opacity-40 border-info border-opacity-25"
                            : isRescheduled
                            ? "bg-dark bg-opacity-20 border-secondary border-opacity-25 opacity-50"
                            : task.priority === "High"
                            ? "bg-dark bg-opacity-60 border-primary border-opacity-50"
                            : "bg-dark bg-opacity-50 border-secondary border-opacity-25"
                        }`}
                      >
                        <div className="row align-items-center g-3">
                          {/* Time & Duration */}
                          <div className="col-12 col-md-3 border-end border-secondary border-opacity-25 pe-md-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold text-white fs-6">
                                {task.startTime || "09:00"} – {task.endTime || "09:45"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <span className="badge bg-dark text-muted border border-secondary border-opacity-25 px-2 py-0.5" style={{ fontSize: "0.72rem" }}>
                                ⏱️ {task.duration || 30} min
                              </span>
                              {task.priority && !isBreak && (
                                <span
                                  className={`badge px-2 py-0.5 rounded-pill ${
                                    task.priority === "High"
                                      ? "bg-danger bg-opacity-25 text-danger border border-danger border-opacity-30"
                                      : task.priority === "Medium"
                                      ? "bg-primary bg-opacity-25 text-primary"
                                      : "bg-secondary bg-opacity-25 text-muted"
                                  }`}
                                  style={{ fontSize: "0.72rem" }}
                                >
                                  {task.priority} Priority
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title & Description & Type Badge */}
                          <div className="col-12 col-md-6">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fs-5">
                                {isBreak
                                  ? "☕"
                                  : task.type === "study"
                                  ? "📚"
                                  : task.type === "work"
                                  ? "💻"
                                  : task.type === "exercise"
                                  ? "🏃"
                                  : task.type === "meal"
                                  ? "🍽️"
                                  : "🧠"}
                              </span>

                              {isCompleted && (
                                <span className="badge bg-success bg-opacity-25 text-success rounded-pill" style={{ fontSize: "0.68rem" }}>
                                  ✓ Completed
                                </span>
                              )}

                              {isRescheduled && (
                                <span className="badge bg-secondary bg-opacity-25 text-warning rounded-pill" style={{ fontSize: "0.68rem" }}>
                                  Postponed
                                </span>
                              )}

                              {task.postponedCount > 0 && !isRescheduled && (
                                <span className="badge bg-warning bg-opacity-25 text-warning rounded-pill" style={{ fontSize: "0.65rem" }}>
                                  Postponed {task.postponedCount}x
                                </span>
                              )}
                            </div>

                            {/* Clean Formatted Title & Bullet Items */}
                            {renderFormattedTaskContent(task.title, task.description, isCompleted)}

                            {task.reason && !isCompleted && (
                              <div className="extra-small text-info opacity-75 mt-1" style={{ fontSize: "0.75rem" }}>
                                💡 {task.reason}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="col-12 col-md-3 text-md-end">
                            <div className="d-flex align-items-center justify-md-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 ${
                                  isCompleted ? "btn-outline-success" : "btn-success text-white"
                                }`}
                                onClick={() => handleToggleComplete(task)}
                                style={{ fontSize: "0.78rem" }}
                              >
                                <FiCheck size={14} />
                                {isCompleted ? "Done ✓" : "Complete"}
                              </button>

                              {!isCompleted && !isBreak && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning rounded-pill px-2.5 py-1 text-warning d-inline-flex align-items-center gap-1"
                                  onClick={() => setRescheduleModal(task)}
                                  style={{ fontSize: "0.78rem" }}
                                >
                                  Reschedule
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-circle p-1.5 text-white-50"
                                onClick={() => setEditTaskModal(task)}
                                title="Edit Task"
                              >
                                <FiEdit3 size={14} />
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-circle p-1.5 text-danger-50"
                                onClick={() => handleDeleteTask(task.taskId)}
                                title="Delete Task"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION E: SMART REMINDERS PREVIEW */}
        {plan && plan.tasks && plan.tasks.length > 0 && (
          <div className="card mb-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-white shadow-sm">
            <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold fs-6 text-white d-flex align-items-center gap-2">
                <FiBell className="text-warning" /> Smart Reminders & Contextual Notifications
              </h5>
              <span className="badge bg-primary bg-opacity-25 text-primary">
                Integrated with NeuroSync Notifications
              </span>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3" style={{ fontSize: "0.86rem" }}>
                NeuroPlan automatically generates positive, contextual reminders for your planned tasks to help you stay on track throughout your day.
              </p>
              <div className="row g-3">
                {plan.tasks.slice(0, 4).map((task, idx) => (
                  <div key={idx} className="col-12 col-md-6">
                    <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 h-100">
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span className="fw-bold text-white small d-flex align-items-center gap-1.5">
                          <FiClock className="text-primary" /> {task.startTime} – {task.title}
                        </span>
                        <span className="badge bg-secondary bg-opacity-25 text-gray-300" style={{ fontSize: "0.68rem" }}>
                          {task.reminderOption === "ai_smart" ? "AI Smart Reminder" : "At Start"}
                        </span>
                      </div>
                      <p className="mb-0 text-gray-300 italic" style={{ fontSize: "0.82rem", color: "#CBD5E1" }}>
                        "{task.reminderMessage || "Scheduled task starting soon."}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION F: END-OF-DAY REFLECTION */}
        <div className="card mb-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-white shadow-sm">
          <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
            <h5 className="mb-0 fw-bold fs-6 text-white d-flex align-items-center gap-2">
              <FiMoon className="text-indigo" style={{ color: "#A5B4FC" }} /> 🌙 Daily Reflection
            </h5>
            <span className="badge bg-indigo bg-opacity-25 text-indigo" style={{ color: "#C7D2FE" }}>
              End of Day Insights
            </span>
          </div>

          <div className="card-body">
            <div className="row g-4">
              <div className="col-12 col-lg-5">
                <label className="form-label text-muted small fw-semibold">How was your day?</label>
                <textarea
                  className="form-control bg-dark text-white border-secondary mb-3"
                  rows="4"
                  placeholder="e.g., Today was productive! Completed my assignment early, but postponed my revision session..."
                  value={userReflectionNotes}
                  onChange={(e) => setUserReflectionNotes(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 py-2 w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSubmitReflection}
                  disabled={submittingReflection || !plan}
                >
                  {submittingReflection ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Saving & Generating Insights...
                    </>
                  ) : (
                    <>
                      <FiStar /> Submit Daily Reflection
                    </>
                  )}
                </button>
              </div>

              <div className="col-12 col-lg-7">
                {plan && plan.reflection && plan.reflection.reflectedAt ? (
                  <div className="p-3.5 rounded-4 bg-dark bg-opacity-60 border border-purple-500 border-opacity-30">
                    <h6 className="fw-bold text-white mb-2 d-flex align-items-center gap-1.5 fs-6">
                      <FiStar className="text-warning" /> AI Daily Reflection Feedback
                    </h6>
                    <div className="d-flex flex-column gap-2.5" style={{ fontSize: "0.86rem" }}>
                      {plan.reflection.whatWentWell && (
                        <div className="p-2.5 rounded bg-dark bg-opacity-50 border border-success border-opacity-25 text-light">
                          🌟 <strong>What Went Well:</strong> {plan.reflection.whatWentWell}
                        </div>
                      )}
                      {plan.reflection.whatCouldBeImproved && (
                        <div className="p-2.5 rounded bg-dark bg-opacity-50 border border-warning border-opacity-25 text-light">
                          💡 <strong>What Could Be Improved:</strong> {plan.reflection.whatCouldBeImproved}
                        </div>
                      )}
                      {plan.reflection.tomorrowSuggestion && (
                        <div className="p-2.5 rounded bg-dark bg-opacity-50 border border-info border-opacity-25 text-light">
                          🚀 <strong>Suggestion For Tomorrow:</strong> {plan.reflection.tomorrowSuggestion}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-4 bg-dark bg-opacity-30 border border-secondary border-opacity-25 text-center text-muted">
                    <FiMoon size={32} className="mb-2 text-indigo" />
                    <h6>No Reflection Logged Yet For Today</h6>
                    <p className="small mb-0">
                      Share a quick summary of how your day went to unlock AI reflection insights and personalized suggestions for tomorrow.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION G: HISTORICAL LEARNING & PATTERNS */}
        {historicalStats && (
          <div className="card mb-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-white shadow-sm">
            <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3">
              <h5 className="mb-0 fw-bold fs-6 text-white d-flex align-items-center gap-2">
                <FiBarChart2 className="text-primary" /> Learning From Previous Days
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 text-center">
                    <span className="text-muted extra-small text-uppercase">Logged Plans</span>
                    <div className="fs-3 fw-bold text-white mt-1">{historicalStats.totalPlansLogged}</div>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 text-center">
                    <span className="text-muted extra-small text-uppercase">Avg Completion Rate</span>
                    <div className="fs-3 fw-bold text-success mt-1">{historicalStats.averageCompletionRate}%</div>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 text-center">
                    <span className="text-muted extra-small text-uppercase">Total Completed Tasks</span>
                    <div className="fs-3 fw-bold text-primary mt-1">{historicalStats.completedTasks}</div>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 text-center">
                    <span className="text-muted extra-small text-uppercase">Postponed Tasks</span>
                    <div className="fs-3 fw-bold text-warning mt-1">{historicalStats.totalPostponed}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </main>

      {/* EDIT TASK MODAL */}
      {editTaskModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(5, 8, 22, 0.8)", backdropFilter: "blur(8px)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white rounded-4 shadow-lg border border-secondary border-opacity-25" style={{ background: "#0F172A" }}>
              <div className="modal-header border-bottom border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white fs-6 d-flex align-items-center gap-2">
                  <FiEdit3 className="text-primary" /> Edit Scheduled Task
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditTaskModal(null)} />
              </div>
              <div className="modal-body py-3">
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Task Title</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={editTaskModal.title}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Description</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={editTaskModal.description || ""}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, description: e.target.value })}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-muted small fw-semibold">Start Time</label>
                    <input
                      type="time"
                      className="form-control bg-dark text-white border-secondary"
                      value={editTaskModal.startTime || "09:00"}
                      onChange={(e) => setEditTaskModal({ ...editTaskModal, startTime: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small fw-semibold">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control bg-dark text-white border-secondary"
                      value={editTaskModal.duration || 30}
                      onChange={(e) => setEditTaskModal({ ...editTaskModal, duration: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label text-muted small fw-semibold">Priority</label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={editTaskModal.priority || "Medium"}
                      onChange={(e) => setEditTaskModal({ ...editTaskModal, priority: e.target.value })}
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small fw-semibold">Reminder</label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={editTaskModal.reminderOption || "ai_smart"}
                      onChange={(e) => setEditTaskModal({ ...editTaskModal, reminderOption: e.target.value })}
                    >
                      <option value="ai_smart">AI Smart Reminder</option>
                      <option value="at_start">At Start Time</option>
                      <option value="5_min_before">5 min before</option>
                      <option value="15_min_before">15 min before</option>
                      <option value="none">No reminder</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top border-secondary border-opacity-25">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setEditTaskModal(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary rounded-pill px-4" onClick={handleSaveEditTask}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE TASK MODAL */}
      {rescheduleModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(5, 8, 22, 0.8)", backdropFilter: "blur(8px)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white rounded-4 shadow-lg border border-secondary border-opacity-25" style={{ background: "#0F172A" }}>
              <div className="modal-header border-bottom border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white fs-6 d-flex align-items-center gap-2">
                  <FiClock className="text-warning" /> Reschedule Task: "{rescheduleModal.title}"
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setRescheduleModal(null)} />
              </div>
              <div className="modal-body py-3">
                <label className="form-label text-muted small fw-semibold">Choose Reschedule Option</label>
                <div className="d-flex flex-column gap-2 mb-3">
                  <button
                    type="button"
                    className={`btn text-start p-3 rounded-3 border ${
                      rescheduleTarget === "later_today"
                        ? "btn-primary border-primary"
                        : "btn-outline-secondary border-secondary text-white"
                    }`}
                    onClick={() => setRescheduleTarget("later_today")}
                  >
                    <div className="fw-bold">Later Today</div>
                    <div className="small opacity-75">Keep task on today's schedule at a later time</div>
                  </button>

                  <button
                    type="button"
                    className={`btn text-start p-3 rounded-3 border ${
                      rescheduleTarget === "tomorrow"
                        ? "btn-primary border-primary"
                        : "btn-outline-secondary border-secondary text-white"
                    }`}
                    onClick={() => setRescheduleTarget("tomorrow")}
                  >
                    <div className="fw-bold">Tomorrow</div>
                    <div className="small opacity-75">Move task to tomorrow's daily plan</div>
                  </button>

                  <button
                    type="button"
                    className={`btn text-start p-3 rounded-3 border ${
                      rescheduleTarget === "choose_time"
                        ? "btn-primary border-primary"
                        : "btn-outline-secondary border-secondary text-white"
                    }`}
                    onClick={() => setRescheduleTarget("choose_time")}
                  >
                    <div className="fw-bold">Choose Specific Time / Date</div>
                    <div className="small opacity-75">Specify exact time or date</div>
                  </button>
                </div>

                {rescheduleTarget === "later_today" && (
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">New Time Today</label>
                    <input
                      type="time"
                      className="form-control bg-dark text-white border-secondary"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    />
                  </div>
                )}

                {rescheduleTarget === "choose_time" && (
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Target Date</label>
                      <input
                        type="date"
                        className="form-control bg-dark text-white border-secondary"
                        value={rescheduleDate || selectedDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Target Time</label>
                      <input
                        type="time"
                        className="form-control bg-dark text-white border-secondary"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top border-secondary border-opacity-25">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setRescheduleModal(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-warning rounded-pill px-4 text-dark fw-bold" onClick={handleConfirmReschedule}>
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD FOOTER */}
      <DashboardFooter />
    </div>
  );
}

export default NeuroPlan;
