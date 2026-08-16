import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import "../styles/studentAICompanion.css";
import {
  FiClock,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiCheckCircle,
  FiTarget,
  FiZap,
  FiArrowLeft,
} from "react-icons/fi";

function StudentFocusTimer() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Timer modes in seconds
  const MODES = {
    pomodoro: { label: "Focus Session", duration: 25 * 60, color: "#8b5cf6" },
    shortBreak: { label: "Short Break", duration: 5 * 60, color: "#10b981" },
    longBreak: { label: "Long Break", duration: 15 * 60, color: "#3b82f6" },
  };

  const [activeMode, setActiveMode] = useState("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState("General Study & Revision");

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }

    // Fetch initial focus session summary for today
    const fetchTodayFocus = async () => {
      const token = localStorage.getItem("neurosync_token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/focus/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCompletedSessions(data.completedCount || 0);
        }
      } catch (err) {
        console.error("Error fetching focus summary:", err);
      }
    };

    fetchTodayFocus();
  }, []);

  const handleSessionComplete = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (activeMode === "pomodoro") {
      setCompletedSessions((prev) => prev + 1);
      if (token) {
        try {
          await fetch("http://localhost:5000/api/focus/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              durationMinutes: 25,
              taskName: selectedTask || "General Study & Revision",
            }),
          });
        } catch (err) {
          console.error("Error logging focus session:", err);
        }
      }
      alert("🎉 Focus Session Completed! Time to take a short break.");
      switchMode("shortBreak");
    } else {
      alert("Break over! Ready to lock back in?");
      switchMode("pomodoro");
    }
  };

  // Timer interval countdown
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, activeMode]);

  const switchMode = (modeKey) => {
    setIsRunning(false);
    setActiveMode(modeKey);
    setTimeLeft(MODES[modeKey].duration);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[activeMode].duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const totalDuration = MODES[activeMode].duration;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="focus-timer"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <TopNavbar
        studentName={studentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <button
              className="btn btn-link text-white-50 p-0 mb-2 text-decoration-none d-flex align-items-center gap-1"
              onClick={() => navigate("/student/ai-companion")}
              style={{ fontSize: "0.88rem" }}
            >
              <FiArrowLeft /> Back to AI Companion
            </button>
            <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
              <FiClock className="text-purple-400" style={{ color: "#a855f7" }} /> Focus Session & Pomodoro
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Eliminate distractions and build effective study momentum.
            </p>
          </div>

          <div className="ns-ai-header-badge">
            <FiZap /> {completedSessions} Session{completedSessions === 1 ? "" : "s"} Completed Today
          </div>
        </div>

        <div className="row g-4">
          {/* Main Timer Display */}
          <div className="col-lg-8">
            <div className="ns-card p-4 text-center">
              {/* Mode Selector Pills */}
              <div className="d-flex justify-content-center gap-2 mb-4">
                {Object.keys(MODES).map((modeKey) => (
                  <button
                    key={modeKey}
                    type="button"
                    className={`btn px-3 py-2 rounded-pill fw-semibold style-btn ${
                      activeMode === modeKey
                        ? "btn-primary"
                        : "btn-outline-secondary text-white-50"
                    }`}
                    style={{
                      fontSize: "0.88rem",
                      backgroundColor:
                        activeMode === modeKey ? MODES[modeKey].color : "transparent",
                      borderColor:
                        activeMode === modeKey ? MODES[modeKey].color : "rgba(255,255,255,0.15)",
                    }}
                    onClick={() => switchMode(modeKey)}
                  >
                    {MODES[modeKey].label}
                  </button>
                ))}
              </div>

              {/* Progress Circle & Time */}
              <div
                className="my-4 mx-auto position-relative d-flex align-items-center justify-content-center"
                style={{
                  width: "240px",
                  height: "240px",
                  borderRadius: "50%",
                  background: `conic-gradient(${MODES[activeMode].color} ${progressPercent}%, rgba(255,255,255,0.06) 0%)`,
                  boxShadow: `0 0 30px ${MODES[activeMode].color}33`,
                  padding: "12px",
                }}
              >
                <div
                  className="w-100 h-100 rounded-circle d-flex flex-column align-items-center justify-content-center"
                  style={{ background: "#0f172a" }}
                >
                  <span
                    className="fw-bold text-white display-3"
                    style={{ letterSpacing: "2px", fontFamily: "monospace" }}
                  >
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-muted small mt-1">
                    {isRunning ? "Focusing..." : "Paused"}
                  </span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                <button
                  type="button"
                  className="ns-btn-primary px-4 py-2 text-white"
                  style={{
                    background: MODES[activeMode].color,
                    fontSize: "1.05rem",
                  }}
                  onClick={toggleTimer}
                >
                  {isRunning ? (
                    <>
                      <FiPause /> Pause
                    </>
                  ) : (
                    <>
                      <FiPlay /> Start
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary text-white-50 p-2 rounded-circle"
                  onClick={resetTimer}
                  title="Reset Timer"
                >
                  <FiRotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info & Task Focus */}
          <div className="col-lg-4">
            <div className="ns-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiTarget className="text-primary" /> Active Study Focus
              </h5>
              <div className="mb-3">
                <label className="text-muted small mb-1">Current Subject / Task</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  placeholder="e.g. DBMS Unit 3 Revision"
                />
              </div>
              <div className="p-3 rounded" style={{ background: "rgba(30,41,59,0.6)", fontSize: "0.86rem" }}>
                <p className="text-white-50 mb-1 fw-semibold">Pro Focus Tip:</p>
                <p className="text-muted mb-0">
                  Put your mobile phone in silent mode and keep a bottle of water nearby.
                </p>
              </div>
            </div>

            <div className="ns-card p-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiCheckCircle className="text-success" /> Session Streak
              </h5>
              <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div>
                  <div className="text-success fw-bold fs-5">{completedSessions * 25} mins</div>
                  <div className="text-muted small">Total Focus Time Today</div>
                </div>
                <FiZap size={28} className="text-success" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}

export default StudentFocusTimer;
