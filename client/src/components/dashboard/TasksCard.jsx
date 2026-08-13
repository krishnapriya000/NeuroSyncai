import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiCheck, FiArrowRight, FiClock, FiPlus } from "react-icons/fi";

function TasksCard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, completed: 0, pending: 0 });
  const [nextTask, setNextTask] = useState(null);

  const fetchTodayStudyPlan = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch summary and today's tasks
      const [tasksRes, summaryRes] = await Promise.all([
        fetch("http://localhost:5000/api/study-tasks?dateFilter=today", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/study-tasks/summary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tasksData = await tasksRes.json();
      const summaryData = await summaryRes.json();

      if (tasksRes.ok && tasksData.success) {
        setTasks(tasksData.data || []);
      }

      if (summaryRes.ok && summaryData.success && summaryData.data) {
        setSummary(summaryData.data.today || { total: 0, completed: 0, pending: 0 });
        setNextTask(summaryData.data.nextUpcomingTask || null);
      }
    } catch (err) {
      console.error("Error loading today study plan widget:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStudyPlan();
  }, []);

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    const nextStatus = currentStatus === "completed" ? "pending" : "completed";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`http://localhost:5000/api/study-tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchTodayStudyPlan();
    } catch (err) {
      console.error("Error toggling task status:", err);
    }
  };

  const progressPercent = summary.total > 0
    ? Math.round((summary.completed / summary.total) * 100)
    : 0;

  return (
    <div className="ns-card h-100 d-flex flex-column justify-content-between p-3">
      <div>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <FiCalendar className="text-primary fs-5" />
            <h5 className="mb-0 text-white fw-bold fs-6">Today's Study Plan</h5>
          </div>
          <span
            className="badge rounded-pill bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-2 py-1"
            style={{ fontSize: "0.78rem" }}
          >
            {progressPercent}% Done
          </span>
        </div>

        {/* Small Summary Badge Row: X Tasks | Y Completed | Z Pending */}
        <div className="d-flex align-items-center gap-2 mb-3 small" style={{ fontSize: "0.78rem" }}>
          <span className="text-muted">{summary.total} Tasks</span>
          <span className="text-muted">•</span>
          <span className="text-success">{summary.completed} Completed</span>
          <span className="text-muted">•</span>
          <span className="text-warning">{summary.pending} Pending</span>
        </div>

        {/* Progress Bar */}
        <div
          className="progress bg-dark mb-3"
          style={{ height: "6px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)" }}
        >
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
              transition: "width 0.4s ease",
            }}
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-muted small py-3 text-center">Loading study plan...</div>
        ) : tasks.length === 0 ? (
          <div className="text-muted small py-3 text-center">
            No study tasks scheduled for today.
          </div>
        ) : (
          <div className="mb-3 d-flex flex-column gap-2" style={{ maxHeight: "180px", overflowY: "auto" }}>
            {tasks.slice(0, 4).map((task) => {
              const isDone = task.status === "completed";
              return (
                <div
                  key={task._id}
                  className={`ns-task-item p-2 rounded-3 d-flex align-items-center justify-content-between ${
                    isDone ? "completed opacity-75" : ""
                  }`}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleTaskStatus(task._id, task.status)}
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                        isDone ? "bg-success text-white" : "border border-secondary"
                      }`}
                      style={{ width: "18px", height: "18px" }}
                    >
                      {isDone && <FiCheck size={12} />}
                    </div>
                    <span
                      className={`text-truncate small ${
                        isDone ? "text-decoration-line-through text-muted" : "text-white"
                      }`}
                      style={{ fontSize: "0.85rem" }}
                    >
                      <strong className="text-info me-1">[{task.subject}]</strong> {task.title}
                    </span>
                  </div>
                  {task.startTime && (
                    <span className="text-muted text-nowrap ms-2" style={{ fontSize: "0.72rem" }}>
                      {task.startTime}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Next Upcoming Task display if available */}
        {nextTask && (
          <div
            className="p-2 mb-3 rounded-3 d-flex align-items-center justify-content-between"
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
            }}
          >
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <FiClock className="text-purple flex-shrink-0" style={{ color: "#C084FC" }} />
              <span className="text-white text-truncate small" style={{ fontSize: "0.8rem" }}>
                <strong>Next:</strong> {nextTask.subject} - {nextTask.title}
              </span>
            </div>
            {nextTask.startTime && (
              <span className="badge bg-purple text-white px-2 py-0.5 ms-2 text-nowrap" style={{ fontSize: "0.7rem", background: "#8B5CF6" }}>
                {nextTask.startTime}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation Link */}
      <button
        type="button"
        className="btn btn-sm btn-outline-primary text-white border-secondary border-opacity-25 w-100 d-flex align-items-center justify-content-center gap-2 py-2"
        style={{ borderRadius: "10px", background: "rgba(255, 255, 255, 0.02)" }}
        onClick={() => navigate("/student/study-planner")}
      >
        <span>View Study Planner</span>
        <FiArrowRight size={14} />
      </button>
    </div>
  );
}

export default TasksCard;
