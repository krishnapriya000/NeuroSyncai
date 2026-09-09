import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import "../styles/studentDashboard.css";

import {
  FiClock,
  FiPlay,
  FiPause,
  FiSquare,
  FiCheckCircle,
  FiZap,
  FiRotateCcw,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiShield,
  FiPlus,
  FiCalendar
} from "react-icons/fi";

const INITIAL_SESSIONS_SEED = [
  {
    id: 101,
    name: "Deep Work Session",
    dateTime: "Today • 09:30 AM",
    timestamp: Date.now() - 3600000 * 2,
    durationMinutes: 45,
    duration: "45 min",
    status: "Completed",
  },
  {
    id: 102,
    name: "Quarterly Strategy Review",
    dateTime: "Today • 11:15 AM",
    timestamp: Date.now() - 3600000,
    durationMinutes: 60,
    duration: "60 min",
    status: "Completed",
  },
  {
    id: 103,
    name: "Meeting Preparation",
    dateTime: "Yesterday • 04:00 PM",
    timestamp: Date.now() - 86400000,
    durationMinutes: 25,
    duration: "25 min",
    status: "Completed",
  },
];

function ProfessionalFocusSessions() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profName, setProfName] = useState("Professional User");

  // Session Input State
  const [sessionName, setSessionName] = useState("Deep Work Session");
  const [durationPreset, setDurationPreset] = useState(25); // 25 | 45 | 60 | 'custom'
  const [customInput, setCustomInput] = useState(30);

  // Timer State
  const [timerStatus, setTimerStatus] = useState("idle"); // 'idle' | 'running' | 'paused' | 'completed'
  const [selectedDuration, setSelectedDuration] = useState(25); // in minutes
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);

  // History & Metrics State
  const [sessionsHistory, setSessionsHistory] = useState([]);

  // Load User & LocalStorage Sessions
  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setProfName(u.fullName || u.name);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    const storedSessions = localStorage.getItem("neurosync_prof_focus_sessions");
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessionsHistory(parsed);
        } else {
          setSessionsHistory(INITIAL_SESSIONS_SEED);
          localStorage.setItem("neurosync_prof_focus_sessions", JSON.stringify(INITIAL_SESSIONS_SEED));
        }
      } catch (e) {
        setSessionsHistory(INITIAL_SESSIONS_SEED);
      }
    } else {
      setSessionsHistory(INITIAL_SESSIONS_SEED);
      localStorage.setItem("neurosync_prof_focus_sessions", JSON.stringify(INITIAL_SESSIONS_SEED));
    }
  }, []);

  // Countdown Interval Effect
  useEffect(() => {
    let intervalId = null;

    if (timerStatus === "running") {
      intervalId = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            handleSessionCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [timerStatus, selectedDuration, sessionName]);

  // Handle Session Completion
  const handleSessionCompleted = () => {
    setTimerStatus("completed");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newSession = {
      id: Date.now(),
      name: sessionName.trim() || "Deep Work Session",
      dateTime: `Today • ${timeStr}`,
      timestamp: Date.now(),
      durationMinutes: selectedDuration,
      duration: `${selectedDuration} min`,
      status: "Completed",
    };

    setSessionsHistory((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem("neurosync_prof_focus_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  // Start Session Action
  const handleStartSession = (overrideDuration, overrideName) => {
    const durMinutes = overrideDuration || (durationPreset === "custom" ? parseInt(customInput) || 25 : durationPreset);
    const sName = overrideName || (sessionName.trim() || "Deep Work Session");

    setSelectedDuration(durMinutes);
    setSessionName(sName);
    setSecondsRemaining(durMinutes * 60);
    setTimerStatus("running");
  };

  // Pause Action
  const handlePauseSession = () => {
    setTimerStatus("paused");
  };

  // Resume Action
  const handleResumeSession = () => {
    setTimerStatus("running");
  };

  // End Action
  const handleEndSession = () => {
    setTimerStatus("idle");
    setSecondsRemaining(selectedDuration * 60);
  };

  // Reset for Next Session
  const handleStartNewSession = () => {
    setTimerStatus("idle");
    setSecondsRemaining(selectedDuration * 60);
  };

  // Quick Preset Selector
  const handleSelectPreset = (mins, defaultName) => {
    setDurationPreset(mins);
    if (defaultName) setSessionName(defaultName);
  };

  // Format Helper: MM:SS
  const formatTime = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Compute Today's Metrics
  const getTodayMetrics = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySessions = sessionsHistory.filter(
      (s) => s.timestamp && s.timestamp >= todayStart.getTime() && s.status === "Completed"
    );

    const todayCount = todaySessions.length;
    const totalMinutesToday = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const hours = Math.floor(totalMinutesToday / 60);
    const mins = totalMinutesToday % 60;
    const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const totalSessionsAll = sessionsHistory.filter((s) => s.status === "Completed");
    const avgDuration = totalSessionsAll.length > 0
      ? Math.round(totalSessionsAll.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / totalSessionsAll.length)
      : 30;

    return {
      todayCount,
      formattedTime,
      totalMinutesToday,
      streakDays: 4, // Realistic active streak
      avgDuration: `${avgDuration} min`,
    };
  };

  const metrics = getTodayMetrics();
  const progressPercent = selectedDuration > 0
    ? Math.round(((selectedDuration * 60 - secondsRemaining) / (selectedDuration * 60)) * 100)
    : 0;

  return (
    <div className="ns-dashboard-wrapper">
      {/* Sidebar Navigation */}
      <ProfessionalSidebar
        activeTab="focus"
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Top Navbar */}
      <ProfessionalNavbar
        userName={profName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Page Area */}
      <main className="ns-main-content">
        {/* PAGE HEADER */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 rounded-pill px-3 py-1" style={{ color: "#c084fc" }}>
              ⚡ Focus & Productivity
            </span>
          </div>
          <h1 className="text-white fw-bold display-6 mb-1">Focus Sessions</h1>
          <p className="text-secondary mb-0" style={{ maxWidth: "650px", fontSize: "0.95rem", color: "#CBD5E1" }}>
            Stay focused, reduce distractions, and make meaningful progress on your work.
          </p>
        </div>

        {/* 4 SUMMARY CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card d-flex align-items-center gap-3">
              <div
                className="p-3 rounded-4 d-flex align-items-center justify-content-center text-primary"
                style={{ background: "rgba(59, 130, 246, 0.15)", width: "52px", height: "52px" }}
              >
                <FiCheckCircle size={26} />
              </div>
              <div>
                <div className="text-muted extra-small font-uppercase fw-semibold" style={{ letterSpacing: "0.05em" }}>
                  Sessions Completed Today
                </div>
                <div className="text-white fw-bold fs-3 lh-1 mt-1">{metrics.todayCount}</div>
                <div className="text-emerald-400 extra-small mt-1 d-flex align-items-center gap-1" style={{ color: "#34D399" }}>
                  <FiTrendingUp size={12} /> Target: 4 sessions
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card d-flex align-items-center gap-3">
              <div
                className="p-3 rounded-4 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa", width: "52px", height: "52px" }}
              >
                <FiClock size={26} />
              </div>
              <div>
                <div className="text-muted extra-small font-uppercase fw-semibold" style={{ letterSpacing: "0.05em" }}>
                  Total Focus Time
                </div>
                <div className="text-white fw-bold fs-3 lh-1 mt-1">{metrics.formattedTime}</div>
                <div className="text-muted extra-small mt-1">Logged today</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card d-flex align-items-center gap-3">
              <div
                className="p-3 rounded-4 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", width: "52px", height: "52px" }}
              >
                <FiZap size={26} />
              </div>
              <div>
                <div className="text-muted extra-small font-uppercase fw-semibold" style={{ letterSpacing: "0.05em" }}>
                  Current Streak
                </div>
                <div className="text-white fw-bold fs-3 lh-1 mt-1">{metrics.streakDays} days</div>
                <div className="text-warning extra-small mt-1" style={{ color: "#fbbf24" }}>Personal Best 🔥</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card d-flex align-items-center gap-3">
              <div
                className="p-3 rounded-4 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(20, 184, 166, 0.15)", color: "#14b8a6", width: "52px", height: "52px" }}
              >
                <FiTarget size={26} />
              </div>
              <div>
                <div className="text-muted extra-small font-uppercase fw-semibold" style={{ letterSpacing: "0.05em" }}>
                  Average Session
                </div>
                <div className="text-white fw-bold fs-3 lh-1 mt-1">{metrics.avgDuration}</div>
                <div className="text-muted extra-small mt-1">Optimal work block</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN ROW: TIMER & START SESSION CARD */}
        <div className="row g-4 mb-4">
          {/* TIMER CARD (Left/Center) */}
          <div className="col-12 col-lg-6">
            <div className="ns-card h-100 d-flex flex-column justify-content-between text-center p-4 position-relative overflow-hidden">
              {/* Background Ambient Glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "250px",
                  height: "250px",
                  background: timerStatus === "running"
                    ? "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0) 70%)"
                    : timerStatus === "completed"
                    ? "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(0,0,0,0) 70%)"
                    : "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0,0,0,0) 70%)",
                  pointerEvents: "none",
                  zIndex: 0
                }}
              />

              <div className="position-relative z-1">
                {/* Header Badge */}
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <span
                    className={`badge rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 ${
                      timerStatus === "running"
                        ? "bg-primary bg-opacity-25 text-info border border-primary border-opacity-30"
                        : timerStatus === "paused"
                        ? "bg-warning bg-opacity-25 text-warning border border-warning border-opacity-30"
                        : timerStatus === "completed"
                        ? "bg-success bg-opacity-25 text-success border border-success border-opacity-30"
                        : "bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-30"
                    }`}
                    style={{ fontSize: "0.82rem" }}
                  >
                    {timerStatus === "running" && <><span className="spinner-grow spinner-grow-sm text-info ms-0 me-1" style={{ width: "8px", height: "8px" }} /> Focus in progress</>}
                    {timerStatus === "paused" && <>⏸ Session Paused</>}
                    {timerStatus === "completed" && <>🎉 Focus Session Completed</>}
                    {timerStatus === "idle" && <>⏱ Ready to Focus</>}
                  </span>
                </div>

                <h4 className="text-white fw-bold mb-1 fs-5">
                  {timerStatus === "completed" ? "Great job!" : sessionName || "Deep Work Session"}
                </h4>
                <p className="text-muted small mb-4">
                  {timerStatus === "completed"
                    ? `You completed ${selectedDuration} minutes of focused work.`
                    : `${selectedDuration} Minutes • Dedicated Focus Block`}
                </p>

                {/* TIMER DISPLAY */}
                <div className="my-3 py-2 d-flex flex-column align-items-center justify-content-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-column position-relative shadow-lg"
                    style={{
                      width: "230px",
                      height: "230px",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: timerStatus === "running"
                        ? "4px solid #3B82F6"
                        : timerStatus === "completed"
                        ? "4px solid #10B981"
                        : "4px solid rgba(255, 255, 255, 0.12)",
                      boxShadow: timerStatus === "running"
                        ? "0 0 30px rgba(59, 130, 246, 0.35)"
                        : timerStatus === "completed"
                        ? "0 0 30px rgba(16, 185, 129, 0.35)"
                        : "none",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div className="display-3 fw-extrabold text-white tracking-wider mb-0" style={{ letterSpacing: "2px", fontFamily: "monospace" }}>
                      {formatTime(secondsRemaining)}
                    </div>
                    {timerStatus === "running" && (
                      <span className="text-info extra-small mt-2" style={{ fontSize: "0.76rem" }}>
                        {progressPercent}% Complete
                      </span>
                    )}
                  </div>
                  <p className="text-muted mt-3 mb-0" style={{ fontSize: "0.88rem", fontStyle: "italic" }}>
                    {timerStatus === "completed" ? "Ready for your next deep work block?" : "Stay focused. You've got this!"}
                  </p>
                </div>
              </div>

              {/* TIMER CONTROLS */}
              <div className="position-relative z-1 pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-center gap-3">
                {timerStatus === "idle" && (
                  <button
                    className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold ns-btn-primary d-flex align-items-center gap-2"
                    onClick={() => handleStartSession()}
                    style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none" }}
                  >
                    <FiPlay size={18} /> Start Focus Session
                  </button>
                )}

                {timerStatus === "running" && (
                  <>
                    <button
                      className="btn btn-outline-warning rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                      onClick={handlePauseSession}
                    >
                      <FiPause size={18} /> Pause
                    </button>
                    <button
                      className="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                      onClick={handleEndSession}
                    >
                      <FiSquare size={16} /> End Session
                    </button>
                  </>
                )}

                {timerStatus === "paused" && (
                  <>
                    <button
                      className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 text-white"
                      onClick={handleResumeSession}
                      style={{ background: "#10B981", border: "none" }}
                    >
                      <FiPlay size={18} /> Resume
                    </button>
                    <button
                      className="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                      onClick={handleEndSession}
                    >
                      <FiSquare size={16} /> End Session
                    </button>
                  </>
                )}

                {timerStatus === "completed" && (
                  <button
                    className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold ns-btn-primary d-flex align-items-center gap-2"
                    onClick={handleStartNewSession}
                    style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)", border: "none" }}
                  >
                    <FiRotateCcw size={18} /> Start Another Session
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* START FOCUS SESSION CONFIGURATION CARD (Right) */}
          <div className="col-12 col-lg-6">
            <div className="ns-card h-100 d-flex flex-column justify-content-between p-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="p-2 rounded-3 bg-purple-500 bg-opacity-25 text-purple-400" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}>
                    <FiShield size={20} />
                  </div>
                  <div>
                    <h5 className="mb-0 text-white fw-bold fs-6">Configure Focus Session</h5>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                      Customize your work block & duration
                    </p>
                  </div>
                </div>

                {/* INPUT: Session Name */}
                <div className="mb-4">
                  <label className="form-label text-white fw-semibold small mb-2">Session Name / Task</label>
                  <input
                    type="text"
                    className="form-control bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 rounded-3 py-2 px-3"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. Deep Work Session, Meeting Prep..."
                    disabled={timerStatus === "running"}
                  />
                  {/* Quick Preset Names */}
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {["Deep Work", "Meeting Prep", "Project Work", "Task Completion", "Learning"].map((pName) => (
                      <button
                        key={pName}
                        type="button"
                        className={`btn btn-sm rounded-pill px-2.5 py-1 ${sessionName === pName ? "btn-primary" : "btn-outline-secondary text-light"}`}
                        style={{ fontSize: "0.73rem" }}
                        onClick={() => setSessionName(pName)}
                        disabled={timerStatus === "running"}
                      >
                        + {pName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DURATION SELECTOR */}
                <div className="mb-4">
                  <label className="form-label text-white fw-semibold small mb-2">Duration (Minutes)</label>
                  <div className="row g-2 mb-2">
                    {[25, 45, 60].map((mins) => (
                      <div key={mins} className="col-4">
                        <button
                          type="button"
                          className={`w-100 btn py-2.5 rounded-3 fw-bold d-flex flex-column align-items-center justify-content-center ${
                            durationPreset === mins
                              ? "btn-primary text-white"
                              : "btn-outline-secondary text-white-50 border-secondary border-opacity-25"
                          }`}
                          style={durationPreset === mins ? { background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none" } : {}}
                          onClick={() => handleSelectPreset(mins)}
                          disabled={timerStatus === "running"}
                        >
                          <span style={{ fontSize: "1.1rem" }}>{mins} min</span>
                          <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                            {mins === 25 ? "Quick Focus" : mins === 45 ? "Deep Focus" : "Extended"}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* CUSTOM DURATION */}
                  <div className="mt-3">
                    <div className="form-check d-flex align-items-center gap-2 mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="durationOption"
                        id="customRadio"
                        checked={durationPreset === "custom"}
                        onChange={() => setDurationPreset("custom")}
                        disabled={timerStatus === "running"}
                      />
                      <label className="form-check-label text-white small" htmlFor="customRadio">
                        Custom Duration (Minutes)
                      </label>
                    </div>
                    {durationPreset === "custom" && (
                      <input
                        type="number"
                        min="5"
                        max="180"
                        className="form-control bg-dark bg-opacity-50 text-white border-secondary border-opacity-25 rounded-3 py-2"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        disabled={timerStatus === "running"}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* START BUTTON */}
              <div>
                <button
                  className="btn btn-primary w-100 rounded-3 py-2.5 fw-bold ns-btn-primary d-flex align-items-center justify-content-center gap-2"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none" }}
                  onClick={() => handleStartSession()}
                  disabled={timerStatus === "running"}
                >
                  <FiPlay /> {timerStatus === "running" ? "Session Currently Running" : "Start Focus Session"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK FOCUS OPTIONS SECTION */}
        <div className="mb-4">
          <h5 className="text-white fw-bold fs-6 mb-3 d-flex align-items-center gap-2">
            <FiZap className="text-warning" /> Quick Focus Options
          </h5>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div
                className="ns-card p-3 d-flex align-items-center justify-content-between hover-bg-light cursor-pointer"
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                onClick={() => handleStartSession(25, "Deep Work")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-3 text-info" style={{ background: "rgba(59, 130, 246, 0.2)" }}>
                    <FiClock size={20} />
                  </div>
                  <div>
                    <div className="text-white fw-bold fs-6">Quick Focus</div>
                    <div className="text-muted extra-small">25 min • Pomodoro block</div>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Start</button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="ns-card p-3 d-flex align-items-center justify-content-between hover-bg-light cursor-pointer"
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                onClick={() => handleStartSession(45, "Deep Focus Session")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-3 text-purple-400" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}>
                    <FiShield size={20} />
                  </div>
                  <div>
                    <div className="text-white fw-bold fs-6">Deep Focus</div>
                    <div className="text-muted extra-small">45 min • High productivity</div>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-purple rounded-pill px-3" style={{ color: "#c084fc", borderColor: "rgba(192, 132, 252, 0.4)" }}>Start</button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="ns-card p-3 d-flex align-items-center justify-content-between hover-bg-light cursor-pointer"
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                onClick={() => handleStartSession(60, "Extended Project Sprint")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-3 text-warning" style={{ background: "rgba(245, 158, 11, 0.2)" }}>
                    <FiZap size={20} />
                  </div>
                  <div>
                    <div className="text-white fw-bold fs-6">Extended Focus</div>
                    <div className="text-muted extra-small">60 min • Project sprint</div>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-warning rounded-pill px-3">Start</button>
              </div>
            </div>
          </div>
        </div>

        {/* FOCUS HISTORY SECTION */}
        <div className="ns-card mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
            <div>
              <h5 className="text-white fw-bold fs-6 mb-0 d-flex align-items-center gap-2">
                <FiCalendar className="text-primary" /> Recent Focus History
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
                Log of your completed deep work & focus blocks
              </p>
            </div>
            <span className="badge bg-dark bg-opacity-75 text-light border border-secondary border-opacity-30 px-3 py-1.5" style={{ fontSize: "0.76rem" }}>
              {sessionsHistory.length} Sessions Saved
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
              <thead>
                <tr className="text-muted extra-small text-uppercase" style={{ fontSize: "0.72rem", borderBottomColor: "rgba(255, 255, 255, 0.08)" }}>
                  <th scope="col" className="ps-3">Session Name</th>
                  <th scope="col">Date / Time</th>
                  <th scope="col">Duration</th>
                  <th scope="col" className="pe-3 text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessionsHistory.map((item) => (
                  <tr key={item.id} style={{ borderBottomColor: "rgba(255, 255, 255, 0.05)" }}>
                    <td className="ps-3 py-3">
                      <div className="fw-semibold text-white d-flex align-items-center gap-2">
                        <FiShield size={16} className="text-primary" /> {item.name}
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: "0.84rem" }}>{item.dateTime}</td>
                    <td>
                      <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 px-2.5 py-1" style={{ color: "#c084fc" }}>
                        {item.duration}
                      </span>
                    </td>
                    <td className="pe-3 text-end">
                      <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-30 px-2.5 py-1">
                        ✓ {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

export default ProfessionalFocusSessions;
