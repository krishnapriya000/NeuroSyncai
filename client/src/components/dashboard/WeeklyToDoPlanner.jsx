import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiPrinter,
  FiZap,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiCheckCircle,
  FiStar,
  FiShare2,
  FiEdit3,
  FiClock,
  FiBookOpen,
  FiTarget,
  FiSmile
} from "react-icons/fi";

const INITIAL_WEEKLY_DATA = {
  Monday: [
    { id: "m1", text: "Morning mindfulness & daily check-in", completed: true },
    { id: "m2", text: "Review weekly goals & prioritize focus areas", completed: false },
    { id: "m3", text: "Complete core study / workspace project", completed: false },
    { id: "m4", text: "30-min brisk walk or light workout", completed: false },
    { id: "m5", text: "Reflective journal entry", completed: false },
  ],
  Tuesday: [
    { id: "t1", text: "Deep focus session (90 mins)", completed: false },
    { id: "t2", text: "Cognitive brain training game", completed: true },
    { id: "t3", text: "Review progress & update metrics", completed: false },
    { id: "t4", text: "Hydration check (8 glasses)", completed: false },
    { id: "t5", text: "Evening relaxation & reading", completed: false },
  ],
  Wednesday: [
    { id: "w1", text: "Mid-week review & milestone check", completed: false },
    { id: "w2", text: "Memory exercise session", completed: false },
    { id: "w3", text: "Organize digital notes & resources", completed: false },
    { id: "w4", text: "Healthy meal prep & nutrition log", completed: false },
    { id: "w5", text: "NeuroPlan AI schedule optimization", completed: false },
  ],
  Thursday: [
    { id: "th1", text: "Group collab / peer check-in", completed: false },
    { id: "th2", text: "Complete secondary project deliverables", completed: false },
    { id: "th3", text: "30-min focus timer sprint", completed: false },
    { id: "th4", text: "Evening gratitude reflection", completed: false },
    { id: "th5", text: "Prepare for upcoming weekend goals", completed: false },
  ],
  Friday: [
    { id: "f1", text: "Wrap up weekly pending action items", completed: false },
    { id: "f2", text: "Celebrate weekly achievements & wins", completed: false },
    { id: "f3", text: "Log weekly mood summary in tracker", completed: false },
    { id: "f4", text: "Plan weekend wellness activities", completed: false },
    { id: "f5", text: "Digital detox session (no screens 9 PM)", completed: false },
  ],
  Weekend: [
    { id: "wk1", text: "Outdoor nature walk or leisure activity", completed: false },
    { id: "wk2", text: "Family connection & quality time", completed: false },
    { id: "wk3", text: "Self-care & mental rejuvenation", completed: false },
    { id: "wk4", text: "Prep study/work roadmap for next week", completed: false },
    { id: "wk5", text: "Restful sleep & recovery", completed: false },
  ],
};

const INITIAL_DAILY_TASKS = [
  { id: "d1", text: "Review today's top 3 priorities", completed: true, priority: "High" },
  { id: "d2", text: "Morning deep focus work session (90 mins)", completed: false, priority: "High" },
  { id: "d3", text: "Complete daily mood & wellness check-in", completed: true, priority: "Medium" },
  { id: "d4", text: "Cognitive brain exercise or study review", completed: false, priority: "Medium" },
  { id: "d5", text: "Drink 8 glasses of water & 20-min walk", completed: false, priority: "Low" },
  { id: "d6", text: "Evening reflection & prep for tomorrow", completed: false, priority: "Low" },
];

const INITIAL_TIME_BLOCKS = [
  { id: "b1", time: "08:00 AM - 10:00 AM", title: "Morning Focus Block", completed: false },
  { id: "b2", time: "10:30 AM - 12:30 PM", title: "Core Work / Learning Session", completed: false },
  { id: "b3", time: "02:00 PM - 04:00 PM", title: "Collaborative / Practical Sprint", completed: false },
  { id: "b4", time: "05:00 PM - 06:00 PM", title: "Physical Wellness & Exercise", completed: false },
  { id: "b5", time: "08:00 PM - 09:30 PM", title: "Evening Unwind & Reading", completed: false },
];

const DAYS_LIST = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Weekend"];

function WeeklyToDoPlanner({ userRole = "Student" }) {
  // Planner View Mode: "daily" (Today's Sheet) vs "weekly" (6-Card Sheet)
  const [plannerMode, setPlannerMode] = useState("daily");

  // Theme mode: "pastel" vs "dark"
  const [themeMode, setThemeMode] = useState("pastel");

  // Date selection state for Daily Mode
  const getTodayISO = () => new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(getTodayISO());

  // Week selection offset for Weekly Mode (0 = current week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Weekly tasks state
  const [weeklyTasks, setWeeklyTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("neurosync_weekly_todo_data");
      return saved ? JSON.parse(saved) : INITIAL_WEEKLY_DATA;
    } catch (e) {
      return INITIAL_WEEKLY_DATA;
    }
  });

  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("neurosync_daily_todo_data");
      return saved ? JSON.parse(saved) : INITIAL_DAILY_TASKS;
    } catch (e) {
      return INITIAL_DAILY_TASKS;
    }
  });

  // Daily time blocks
  const [timeBlocks, setTimeBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem("neurosync_daily_timeblocks");
      return saved ? JSON.parse(saved) : INITIAL_TIME_BLOCKS;
    } catch (e) {
      return INITIAL_TIME_BLOCKS;
    }
  });

  // Daily notes / reflection
  const [dailyNotes, setDailyNotes] = useState(() => {
    return localStorage.getItem("neurosync_daily_notes") || "• Focus on quality over quantity today.\n• Remember to take short breaks after deep work.";
  });

  // New task input state per day card in Weekly Mode
  const [inputValues, setInputValues] = useState({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Weekend: "",
  });

  // Single task input for Daily Mode
  const [newDailyTaskInput, setNewDailyTaskInput] = useState("");
  const [newDailyTaskPriority, setNewDailyTaskPriority] = useState("Medium");

  const [generatingAI, setGeneratingAI] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Persist state changes
  useEffect(() => {
    localStorage.setItem("neurosync_weekly_todo_data", JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);

  useEffect(() => {
    localStorage.setItem("neurosync_daily_todo_data", JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem("neurosync_daily_timeblocks", JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  useEffect(() => {
    localStorage.setItem("neurosync_daily_notes", dailyNotes);
  }, [dailyNotes]);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Date formatting helpers
  const formatDailyDateDisplay = (isoStr) => {
    const parts = isoStr.split("-");
    if (parts.length !== 3) return isoStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
    return d.toLocaleDateString("en-US", options);
  };

  const shiftDailyDate = (days) => {
    const parts = selectedDate.split("-");
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const getWeekRangeStr = (offset) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + distanceToMonday + offset * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const options = { month: "short", day: "numeric" };
    return `${startOfWeek.toLocaleDateString("en-US", options)} – ${endOfWeek.toLocaleDateString("en-US", options)}, ${endOfWeek.getFullYear()}`;
  };

  // Weekly Task Toggle & Operations
  const toggleWeeklyTask = (day, taskId) => {
    setWeeklyTasks((prev) => {
      const dayTasks = prev[day] || [];
      const updated = dayTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, [day]: updated };
    });
  };

  const handleAddWeeklyTask = (day) => {
    const text = (inputValues[day] || "").trim();
    if (!text) return;

    const newTask = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      text,
      completed: false,
    };

    setWeeklyTasks((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newTask],
    }));

    setInputValues((prev) => ({ ...prev, [day]: "" }));
    showNotification(`Added task to ${day}`);
  };

  const deleteWeeklyTask = (day, taskId) => {
    setWeeklyTasks((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((t) => t.id !== taskId),
    }));
  };

  const clearCompletedWeeklyDay = (day) => {
    setWeeklyTasks((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((t) => !t.completed),
    }));
    showNotification(`Cleared completed tasks in ${day}`);
  };

  // Daily Task Toggle & Operations
  const toggleDailyTask = (taskId) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddDailyTask = (e) => {
    if (e) e.preventDefault();
    const text = newDailyTaskInput.trim();
    if (!text) return;

    const newTask = {
      id: "dtask_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      text,
      completed: false,
      priority: newDailyTaskPriority,
    };

    setDailyTasks((prev) => [...prev, newTask]);
    setNewDailyTaskInput("");
    showNotification("Added task to Today's List!");
  };

  const deleteDailyTask = (taskId) => {
    setDailyTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const toggleTimeBlock = (blockId) => {
    setTimeBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b))
    );
  };

  // AI Generator for Daily / Weekly
  const handleAIGenerate = async () => {
    setGeneratingAI(true);
    setTimeout(() => {
      if (plannerMode === "daily") {
        const aiDailyPresets = [
          { id: "ai_d1", text: "🧠 Morning 20-min Mindfulness & Priority Setup", completed: false, priority: "High" },
          { id: "ai_d2", text: "🎯 Core Goal Sprint: High Priority Task", completed: false, priority: "High" },
          { id: "ai_d3", text: "⚡ Brain Training & Memory Exercise", completed: false, priority: "Medium" },
          { id: "ai_d4", text: "💧 Hydration check & 15-min stretch walk", completed: false, priority: "Low" },
          { id: "ai_d5", text: "📝 Nightly Reflection & Gratitude Log", completed: false, priority: "Low" },
        ];
        setDailyTasks((prev) => [...prev, ...aiDailyPresets]);
        showNotification("✨ AI generated today's focus schedule!");
      } else {
        const aiWeeklyPresets = {
          Monday: [{ id: "ai_m1", text: "🎯 Priority Roadmap Setup", completed: false }],
          Tuesday: [{ id: "ai_t1", text: "⚡ Deep Focus Work Sprint", completed: false }],
          Wednesday: [{ id: "ai_w1", text: "📖 Mid-week Skill & Review", completed: false }],
          Thursday: [{ id: "ai_th1", text: "💡 Milestone Completion", completed: false }],
          Friday: [{ id: "ai_f1", text: "🏆 Weekly Wins Celebration", completed: false }],
          Weekend: [{ id: "ai_wk1", text: "🌿 Vitality & Outdoor Recovery", completed: false }],
        };
        setWeeklyTasks((prev) => {
          const merged = { ...prev };
          DAYS_LIST.forEach((d) => {
            merged[d] = [...(merged[d] || []), ...(aiWeeklyPresets[d] || [])];
          });
          return merged;
        });
        showNotification("✨ AI populated smart weekly goals!");
      }
      setGeneratingAI(false);
    }, 750);
  };

  const handlePrint = () => {
    window.print();
  };

  // Stats calculation
  const isPastel = themeMode === "pastel";

  // Daily stats
  const totalDaily = dailyTasks.length;
  const completedDailyCount = dailyTasks.filter((t) => t.completed).length;
  const dailyProgressPercent = totalDaily > 0 ? Math.round((completedDailyCount / totalDaily) * 100) : 0;

  // Weekly stats
  let totalWeekly = 0;
  let completedWeeklyCount = 0;
  DAYS_LIST.forEach((d) => {
    const list = weeklyTasks[d] || [];
    totalWeekly += list.length;
    completedWeeklyCount += list.filter((t) => t.completed).length;
  });
  const weeklyProgressPercent = totalWeekly > 0 ? Math.round((completedWeeklyCount / totalWeekly) * 100) : 0;

  return (
    <div
      className={`weekly-planner-wrapper position-relative p-3 p-md-4 rounded-4 transition-all ${
        isPastel ? "pastel-theme-bg" : "dark-theme-bg"
      }`}
      style={{
        background: isPastel
          ? "#FAF4ED"
          : "linear-gradient(135deg, #0b0f19 0%, #171c2f 100%)",
        color: isPastel ? "#332924" : "#F8FAFC",
        minHeight: "850px",
        boxShadow: isPastel
          ? "0 20px 50px rgba(220, 180, 160, 0.25)"
          : "0 20px 50px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1100 }}
        >
          <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 shadow-lg border-0 text-white" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
            <FiCheckCircle size={18} />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Decorative Pastel Motif Shapes */}
      {isPastel && (
        <>
          <div
            className="position-absolute pe-none"
            style={{
              top: "-20px",
              left: "-10px",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, #FDBA74 0%, transparent 70%)",
              opacity: 0.35,
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
          <div
            className="position-absolute pe-none"
            style={{
              top: "40px",
              right: "-20px",
              width: "240px",
              height: "240px",
              background: "radial-gradient(circle, #FBCFE8 0%, transparent 70%)",
              opacity: 0.45,
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
        </>
      )}

      {/* TOP TOOLBAR & VIEW MODE SWITCHER */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 position-relative z-1 print-hide">
        {/* INTERFACE MODE TOGGLE (Daily vs Weekly) */}
        <div
          className={`d-flex align-items-center p-1 rounded-pill shadow-sm ${
            isPastel
              ? "bg-white border border-secondary border-opacity-25"
              : "bg-dark border border-secondary border-opacity-25"
          }`}
        >
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold transition-all ${
              plannerMode === "daily"
                ? "text-white shadow-sm"
                : isPastel
                ? "text-secondary"
                : "text-white-50"
            }`}
            style={{
              background:
                plannerMode === "daily"
                  ? "linear-gradient(135deg, #F97316 0%, #EC4899 100%)"
                  : "transparent",
              fontSize: "0.84rem",
            }}
            onClick={() => setPlannerMode("daily")}
          >
            <span>📅 Today's Daily Sheet</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold transition-all ${
              plannerMode === "weekly"
                ? "text-white shadow-sm"
                : isPastel
                ? "text-secondary"
                : "text-white-50"
            }`}
            style={{
              background:
                plannerMode === "weekly"
                  ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                  : "transparent",
              fontSize: "0.84rem",
            }}
            onClick={() => setPlannerMode("weekly")}
          >
            <span>🗓️ Weekly Overview Sheet</span>
          </button>
        </div>

        {/* Center / Right Action Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Theme Switcher */}
          <button
            className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5 fw-semibold ${
              isPastel
                ? "btn-light text-dark shadow-sm border border-secondary border-opacity-25"
                : "btn-dark text-white border border-secondary border-opacity-25"
            }`}
            onClick={() => setThemeMode(isPastel ? "dark" : "pastel")}
            title="Toggle Theme Mode"
            style={{ fontSize: "0.82rem" }}
          >
            {isPastel ? <FiMoon className="text-purple-600" /> : <FiSun className="text-warning" />}
            <span>{isPastel ? "Dark Mode" : "Pastel Theme"}</span>
          </button>

          {/* AI Auto-Fill */}
          <button
            className="btn btn-sm text-white rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
            onClick={handleAIGenerate}
            disabled={generatingAI}
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
              border: "none",
              fontSize: "0.82rem",
            }}
          >
            <FiZap className={generatingAI ? "spin-animation" : ""} />
            <span>{generatingAI ? "AI Generating..." : "✨ Auto-Fill AI Plan"}</span>
          </button>

          {/* Print */}
          <button
            className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5 fw-medium ${
              isPastel
                ? "btn-outline-dark bg-white border-secondary border-opacity-25"
                : "btn-outline-light"
            }`}
            onClick={handlePrint}
            title="Print Planner"
            style={{ fontSize: "0.82rem" }}
          >
            <FiPrinter size={14} />
            <span className="d-none d-sm-inline">Print</span>
          </button>

          {/* Reset */}
          <button
            className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1.5 fw-medium d-flex align-items-center gap-1"
            onClick={() => {
              if (window.confirm("Reset all task data?")) {
                if (plannerMode === "daily") {
                  setDailyTasks(INITIAL_DAILY_TASKS);
                  setTimeBlocks(INITIAL_TIME_BLOCKS);
                } else {
                  setWeeklyTasks(INITIAL_WEEKLY_DATA);
                }
                showNotification("Planner data reset.");
              }
            }}
            style={{ fontSize: "0.82rem" }}
            title="Reset Data"
          >
            <FiRefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ELEGANT TITLE HEADER */}
      <div className="text-center mb-4 position-relative z-1 py-1">
        <h1
          className="weekly-title display-4 fw-bold mb-1"
          style={{
            fontFamily: "'Caveat', 'Dancing Script', 'Pacifico', cursive, serif",
            color: isPastel ? "#4A3728" : "#F3E8FF",
            letterSpacing: "0.02em",
            fontSize: "3.2rem",
            lineHeight: "1.1",
            textShadow: isPastel ? "0 2px 4px rgba(0,0,0,0.03)" : "0 4px 12px rgba(168,85,247,0.3)",
          }}
        >
          {plannerMode === "daily" ? "Daily To Do List" : "Weekly To Do List"}
        </h1>

        {/* DATE SELECTOR BAR */}
        {plannerMode === "daily" ? (
          <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
            <button
              className="btn btn-sm btn-link text-secondary p-1"
              onClick={() => shiftDailyDate(-1)}
              title="Previous Day"
            >
              <FiChevronLeft size={20} />
            </button>

            <span
              className={`fw-bold px-3 py-1 rounded-pill shadow-sm ${
                isPastel ? "bg-white text-dark border" : "bg-dark text-white border border-secondary"
              }`}
              style={{ fontSize: "0.92rem" }}
            >
              {formatDailyDateDisplay(selectedDate)}
            </span>

            <button
              className="btn btn-sm btn-link text-secondary p-1"
              onClick={() => shiftDailyDate(1)}
              title="Next Day"
            >
              <FiChevronRight size={20} />
            </button>

            {selectedDate !== getTodayISO() && (
              <button
                className="btn btn-sm btn-primary rounded-pill px-2.5 py-0.5 ms-1 text-white"
                onClick={() => setSelectedDate(getTodayISO())}
                style={{ fontSize: "0.75rem" }}
              >
                Today
              </button>
            )}
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
            <button
              className="btn btn-link p-1 text-secondary"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              title="Previous Week"
            >
              <FiChevronLeft size={18} />
            </button>
            <span
              className={`fw-bold px-3 py-1 rounded-pill shadow-sm ${
                isPastel ? "bg-white text-dark border" : "bg-dark text-white border border-secondary"
              }`}
              style={{ fontSize: "0.88rem" }}
            >
              {getWeekRangeStr(weekOffset)}
            </span>
            <button
              className="btn btn-link p-1 text-secondary"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              title="Next Week"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PROGRESS BAR */}
        <div className="d-flex align-items-center justify-content-center gap-3 mt-3 print-hide">
          <div
            className="progress rounded-pill overflow-hidden"
            style={{
              width: "220px",
              height: "8px",
              background: isPastel ? "rgba(74, 55, 40, 0.12)" : "rgba(255, 255, 255, 0.15)",
            }}
          >
            <div
              className="progress-bar rounded-pill transition-all"
              role="progressbar"
              style={{
                width: `${plannerMode === "daily" ? dailyProgressPercent : weeklyProgressPercent}%`,
                background: isPastel
                  ? "linear-gradient(90deg, #F97316 0%, #EC4899 100%)"
                  : "linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)",
              }}
            />
          </div>
          <span
            className="fw-bold"
            style={{
              fontSize: "0.82rem",
              color: isPastel ? "#7C5D47" : "#CBD5E1",
            }}
          >
            {plannerMode === "daily"
              ? `${completedDailyCount} of ${totalDaily} Done (${dailyProgressPercent}%)`
              : `${completedWeeklyCount} of ${totalWeekly} Done (${weeklyProgressPercent}%)`}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* INTERFACE 1: TODAY'S DAILY SHEET (Single-Day Focus Layout) */}
      {/* ========================================================= */}
      {plannerMode === "daily" ? (
        <div className="row g-4 position-relative z-1">
          {/* LEFT COLUMN: TODAY'S TASK CHECKLIST & PRIORITIES */}
          <div className="col-12 col-lg-7">
            {/* TOP 3 PRIORITIES CARD */}
            <div
              className={`card border-0 rounded-4 mb-4 transition-all shadow-sm ${
                isPastel ? "pastel-card" : "dark-card"
              }`}
              style={{
                background: isPastel ? "#FFFFFF" : "rgba(23, 28, 47, 0.85)",
                borderRadius: "20px",
                border: isPastel
                  ? "1px solid rgba(220, 200, 190, 0.6)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                padding: "1.2rem 1.25rem",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isPastel ? "rgba(220, 200, 190, 0.4)" : "rgba(255, 255, 255, 0.1)" }}>
                <h3
                  className="fw-bold mb-0 d-flex align-items-center gap-2"
                  style={{
                    fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                    color: isPastel ? "#3B2B20" : "#F1F5F9",
                    fontSize: "1.85rem",
                  }}
                >
                  <FiStar className="text-warning" size={22} /> Today's Top Priorities
                </h3>
                <span className="badge bg-warning bg-opacity-25 text-warning px-2.5 py-1 rounded-pill" style={{ fontSize: "0.72rem" }}>
                  Must Complete
                </span>
              </div>

              <div className="d-flex flex-column gap-2">
                {dailyTasks.filter(t => t.priority === "High").map((task, idx) => (
                  <div
                    key={task.id}
                    className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border transition-all"
                    style={{
                      background: isPastel ? "#FEFCE8" : "rgba(245, 158, 11, 0.1)",
                      borderColor: isPastel ? "#FEF08A" : "rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2.5 flex-grow-1 overflow-hidden">
                      <button
                        type="button"
                        className="btn p-0 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        onClick={() => toggleDailyTask(task.id)}
                        style={{
                          width: "22px",
                          height: "22px",
                          border: task.completed ? "none" : isPastel ? "2px solid #D97706" : "2px solid #F59E0B",
                          background: task.completed ? "#D97706" : "transparent",
                          color: "#FFF",
                        }}
                      >
                        {task.completed && <FiCheck size={14} strokeWidth={3} />}
                      </button>

                      <span
                        className={`fw-semibold text-truncate ${task.completed ? "text-decoration-line-through opacity-60" : ""}`}
                        onClick={() => toggleDailyTask(task.id)}
                        style={{ fontSize: "0.93rem", color: isPastel ? "#78350F" : "#FEF3C7", cursor: "pointer" }}
                      >
                        {idx + 1}. {task.text}
                      </span>
                    </div>

                    <button
                      className="btn btn-link p-0 text-muted opacity-50 hover-opacity-100 print-hide ms-2"
                      onClick={() => deleteDailyTask(task.id)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}

                {dailyTasks.filter(t => t.priority === "High").length === 0 && (
                  <p className="text-muted extra-small mb-0 italic">No high priority tasks set for today.</p>
                )}
              </div>
            </div>

            {/* MASTER TODAY'S TASK CHECKLIST */}
            <div
              className={`card border-0 rounded-4 transition-all shadow-sm ${
                isPastel ? "pastel-card" : "dark-card"
              }`}
              style={{
                background: isPastel ? "#FFFFFF" : "rgba(23, 28, 47, 0.85)",
                borderRadius: "20px",
                border: isPastel
                  ? "1px solid rgba(220, 200, 190, 0.6)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                padding: "1.2rem 1.25rem",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isPastel ? "rgba(220, 200, 190, 0.4)" : "rgba(255, 255, 255, 0.1)" }}>
                <h3
                  className="fw-bold mb-0"
                  style={{
                    fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                    color: isPastel ? "#3B2B20" : "#F1F5F9",
                    fontSize: "1.85rem",
                  }}
                >
                  Today's Action Items
                </h3>

                <span className="text-muted extra-small">
                  {completedDailyCount} / {totalDaily} Completed
                </span>
              </div>

              {/* TASK LIST */}
              <ul className="list-unstyled mb-3 d-flex flex-column gap-1">
                {dailyTasks.map((task) => (
                  <li
                    key={task.id}
                    className="d-flex align-items-center justify-content-between py-2 px-2 border-bottom task-row"
                    style={{
                      borderColor: isPastel ? "rgba(230, 215, 205, 0.6)" : "rgba(255, 255, 255, 0.05)",
                      minHeight: "40px",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2.5 flex-grow-1 overflow-hidden me-2">
                      <button
                        type="button"
                        className={`btn p-0 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 transition-all ${
                          task.completed ? "task-checked" : "task-unchecked"
                        }`}
                        onClick={() => toggleDailyTask(task.id)}
                        style={{
                          width: "22px",
                          height: "22px",
                          border: task.completed
                            ? "none"
                            : isPastel
                            ? "2px solid #5C4A3E"
                            : "2px solid #94A3B8",
                          background: task.completed
                            ? isPastel
                              ? "linear-gradient(135deg, #10B981, #059669)"
                              : "linear-gradient(135deg, #8B5CF6, #6366F1)"
                            : "transparent",
                          color: "#FFFFFF",
                          cursor: "pointer",
                        }}
                      >
                        {task.completed && <FiCheck size={14} strokeWidth={3} />}
                      </button>

                      <span
                        className={`task-text text-truncate flex-grow-1 ${
                          task.completed ? "text-decoration-line-through opacity-60 fw-normal" : "fw-medium"
                        }`}
                        onClick={() => toggleDailyTask(task.id)}
                        style={{
                          fontSize: "0.93rem",
                          color: task.completed
                            ? isPastel
                              ? "#8C7462"
                              : "#64748B"
                            : isPastel
                            ? "#2C2018"
                            : "#F1F5F9",
                          cursor: "pointer",
                        }}
                      >
                        {task.text}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge rounded-pill extra-small ${
                          task.priority === "High"
                            ? "bg-danger bg-opacity-25 text-danger"
                            : task.priority === "Medium"
                            ? "bg-warning bg-opacity-25 text-warning"
                            : "bg-info bg-opacity-25 text-info"
                        }`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        {task.priority}
                      </span>

                      <button
                        className="btn btn-link p-0 text-muted opacity-25 hover-opacity-100 print-hide ms-1"
                        onClick={() => deleteDailyTask(task.id)}
                        title="Delete task"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* INLINE ADD TASK FORM */}
              <form onSubmit={handleAddDailyTask} className="d-flex align-items-center gap-2 print-hide pt-2">
                <input
                  type="text"
                  className="form-control rounded-pill border-0 shadow-none px-3"
                  placeholder="+ Add new task for today..."
                  value={newDailyTaskInput}
                  onChange={(e) => setNewDailyTaskInput(e.target.value)}
                  style={{
                    background: isPastel ? "#FAF5EF" : "rgba(15, 23, 42, 0.6)",
                    color: isPastel ? "#3B2B20" : "#FFFFFF",
                    fontSize: "0.88rem",
                  }}
                />

                <select
                  className="form-select form-select-sm rounded-pill border-0 shadow-none px-2"
                  value={newDailyTaskPriority}
                  onChange={(e) => setNewDailyTaskPriority(e.target.value)}
                  style={{
                    width: "100px",
                    background: isPastel ? "#FAF5EF" : "rgba(15, 23, 42, 0.6)",
                    color: isPastel ? "#3B2B20" : "#FFFFFF",
                    fontSize: "0.8rem",
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "32px",
                    height: "32px",
                    background: isPastel
                      ? "linear-gradient(135deg, #F97316 0%, #EA580C 100%)"
                      : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                    border: "none",
                  }}
                >
                  <FiPlus size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: DAILY SCHEDULE TIME BLOCKS & REFLECTION */}
          <div className="col-12 col-lg-5">
            {/* HOURLY SCHEDULE TIME BLOCKS */}
            <div
              className={`card border-0 rounded-4 mb-4 transition-all shadow-sm ${
                isPastel ? "pastel-card" : "dark-card"
              }`}
              style={{
                background: isPastel ? "#FFFFFF" : "rgba(23, 28, 47, 0.85)",
                borderRadius: "20px",
                border: isPastel
                  ? "1px solid rgba(220, 200, 190, 0.6)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                padding: "1.2rem 1.25rem",
              }}
            >
              <h3
                className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2"
                style={{
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  color: isPastel ? "#3B2B20" : "#F1F5F9",
                  fontSize: "1.85rem",
                  borderColor: isPastel ? "rgba(220, 200, 190, 0.4)" : "rgba(255, 255, 255, 0.1)",
                }}
              >
                <FiClock size={20} className="text-primary" /> Today's Time Blocks
              </h3>

              <div className="d-flex flex-column gap-2">
                {timeBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border transition-all"
                    style={{
                      background: block.completed
                        ? isPastel
                          ? "#ECFDF5"
                          : "rgba(16, 185, 129, 0.1)"
                        : isPastel
                        ? "#FAF5EF"
                        : "rgba(15, 23, 42, 0.5)",
                      borderColor: isPastel ? "rgba(220, 200, 190, 0.5)" : "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2.5 flex-grow-1 overflow-hidden">
                      <button
                        type="button"
                        className="btn p-0 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        onClick={() => toggleTimeBlock(block.id)}
                        style={{
                          width: "20px",
                          height: "20px",
                          border: block.completed ? "none" : isPastel ? "2px solid #5C4A3E" : "2px solid #94A3B8",
                          background: block.completed ? "#10B981" : "transparent",
                          color: "#FFF",
                        }}
                      >
                        {block.completed && <FiCheck size={12} strokeWidth={3} />}
                      </button>

                      <div className="d-flex flex-column overflow-hidden">
                        <span className="extra-small fw-bold text-primary" style={{ fontSize: "0.72rem" }}>
                          {block.time}
                        </span>
                        <span
                          className={`fw-medium text-truncate ${block.completed ? "text-decoration-line-through opacity-60" : ""}`}
                          style={{ fontSize: "0.88rem", color: isPastel ? "#3B2B20" : "#F8FAFC" }}
                        >
                          {block.title}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DAILY REFLECTION & SCRATCHPAD */}
            <div
              className={`card border-0 rounded-4 transition-all shadow-sm ${
                isPastel ? "pastel-card" : "dark-card"
              }`}
              style={{
                background: isPastel ? "#FFFFFF" : "rgba(23, 28, 47, 0.85)",
                borderRadius: "20px",
                border: isPastel
                  ? "1px solid rgba(220, 200, 190, 0.6)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                padding: "1.2rem 1.25rem",
              }}
            >
              <h3
                className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2"
                style={{
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  color: isPastel ? "#3B2B20" : "#F1F5F9",
                  fontSize: "1.85rem",
                  borderColor: isPastel ? "rgba(220, 200, 190, 0.4)" : "rgba(255, 255, 255, 0.1)",
                }}
              >
                <FiBookOpen size={20} className="text-purple-500" /> Daily Notes & Thoughts
              </h3>

              <textarea
                className="form-control border-0 shadow-none p-3 rounded-3"
                rows="5"
                placeholder="Write your thoughts, daily gratitude, or reminders..."
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
                style={{
                  background: isPastel ? "#FAF5EF" : "rgba(15, 23, 42, 0.6)",
                  color: isPastel ? "#3B2B20" : "#F8FAFC",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* INTERFACE 2: WEEKLY OVERVIEW SHEET (6-Card Grid Layout)   */
        /* ========================================================= */
        <div className="row g-3 g-md-4 position-relative z-1">
          {DAYS_LIST.map((day) => {
            const tasks = weeklyTasks[day] || [];
            const completedDayCount = tasks.filter((t) => t.completed).length;

            return (
              <div key={day} className="col-12 col-md-6 col-lg-4">
                <div
                  className={`card h-100 border-0 rounded-4 transition-all shadow-sm ${
                    isPastel ? "pastel-card" : "dark-card"
                  }`}
                  style={{
                    background: isPastel ? "#FFFFFF" : "rgba(23, 28, 47, 0.85)",
                    backdropFilter: isPastel ? "none" : "blur(16px)",
                    borderRadius: "20px",
                    border: isPastel
                      ? "1px solid rgba(220, 200, 190, 0.6)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: isPastel
                      ? "0 10px 25px rgba(230, 210, 200, 0.35)"
                      : "0 10px 25px rgba(0, 0, 0, 0.3)",
                    padding: "1.2rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* DAY CARD HEADER */}
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isPastel ? "rgba(220, 200, 190, 0.4)" : "rgba(255, 255, 255, 0.1)" }}>
                    <h3
                      className="fw-bold mb-0"
                      style={{
                        fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                        color: isPastel ? "#3B2B20" : "#F1F5F9",
                        fontSize: "1.85rem",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {day}
                    </h3>

                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="badge rounded-pill"
                        style={{
                          fontSize: "0.68rem",
                          padding: "0.25rem 0.6rem",
                          background: isPastel ? "#FBF3EB" : "rgba(139, 92, 246, 0.2)",
                          color: isPastel ? "#9A6B4C" : "#C4B5FD",
                          border: isPastel
                            ? "1px solid rgba(200, 160, 140, 0.3)"
                            : "1px solid rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        {completedDayCount}/{tasks.length}
                      </span>

                      {completedDayCount > 0 && (
                        <button
                          className="btn btn-link p-0 text-muted extra-small print-hide"
                          onClick={() => clearCompletedWeeklyDay(day)}
                          title="Clear completed tasks"
                          style={{ fontSize: "0.72rem", color: isPastel ? "#9A6B4C" : "#94A3B8" }}
                        >
                          Clear done
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TASK ITEMS LIST */}
                  <div className="flex-grow-1 mb-3">
                    {tasks.length === 0 ? (
                      <div
                        className="text-center py-4 my-2 text-muted italic"
                        style={{ fontSize: "0.85rem", color: isPastel ? "#B09580" : "#64748B" }}
                      >
                        No tasks yet. Add one below! ✨
                      </div>
                    ) : (
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                        {tasks.map((task) => (
                          <li
                            key={task.id}
                            className="d-flex align-items-center justify-content-between py-1.5 px-1 border-bottom task-row"
                            style={{
                              borderColor: isPastel ? "rgba(230, 215, 205, 0.6)" : "rgba(255, 255, 255, 0.05)",
                              minHeight: "38px",
                            }}
                          >
                            <div className="d-flex align-items-center gap-2.5 flex-grow-1 overflow-hidden me-2">
                              {/* CIRCULAR CHECKBOX */}
                              <button
                                type="button"
                                className={`btn p-0 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 transition-all ${
                                  task.completed ? "task-checked" : "task-unchecked"
                                }`}
                                onClick={() => toggleWeeklyTask(day, task.id)}
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  border: task.completed
                                    ? "none"
                                    : isPastel
                                    ? "2px solid #5C4A3E"
                                    : "2px solid #94A3B8",
                                  background: task.completed
                                    ? isPastel
                                      ? "linear-gradient(135deg, #10B981, #059669)"
                                      : "linear-gradient(135deg, #8B5CF6, #6366F1)"
                                    : "transparent",
                                  color: "#FFFFFF",
                                  cursor: "pointer",
                                }}
                              >
                                {task.completed && <FiCheck size={14} strokeWidth={3} />}
                              </button>

                              {/* TASK TEXT */}
                              <span
                                className={`task-text text-truncate flex-grow-1 ${
                                  task.completed ? "text-decoration-line-through opacity-60 fw-normal" : "fw-medium"
                                }`}
                                onClick={() => toggleWeeklyTask(day, task.id)}
                                style={{
                                  fontSize: "0.92rem",
                                  color: task.completed
                                    ? isPastel
                                      ? "#8C7462"
                                      : "#64748B"
                                    : isPastel
                                    ? "#2C2018"
                                    : "#F1F5F9",
                                  cursor: "pointer",
                                }}
                              >
                                {task.text}
                              </span>
                            </div>

                            {/* DELETE ACTION */}
                            <button
                              className="btn btn-link p-0 text-muted opacity-25 hover-opacity-100 print-hide"
                              onClick={() => deleteWeeklyTask(day, task.id)}
                              title="Delete task"
                              style={{ color: isPastel ? "#A0806B" : "#94A3B8" }}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* INLINE QUICK ADD TASK INPUT */}
                  <div className="mt-auto pt-2 print-hide border-top" style={{ borderColor: isPastel ? "rgba(220, 200, 190, 0.3)" : "rgba(255, 255, 255, 0.08)" }}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddWeeklyTask(day);
                      }}
                      className="d-flex align-items-center gap-2"
                    >
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-pill border-0 shadow-none px-3"
                        placeholder="+ Add task..."
                        value={inputValues[day] || ""}
                        onChange={(e) =>
                          setInputValues({ ...inputValues, [day]: e.target.value })
                        }
                        style={{
                          background: isPastel ? "#FAF5EF" : "rgba(15, 23, 42, 0.6)",
                          color: isPastel ? "#3B2B20" : "#FFFFFF",
                          fontSize: "0.85rem",
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-sm btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "28px",
                          height: "28px",
                          background: isPastel
                            ? "linear-gradient(135deg, #F97316 0%, #EA580C 100%)"
                            : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                          border: "none",
                        }}
                        title="Add task"
                      >
                        <FiPlus size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRINT-ONLY STYLES & LAYOUT */}
      <style>{`
        @media print {
          .print-hide, .ns-sidebar, .ns-topbar, footer, header {
            display: none !important;
          }
          body, html, .dashboard-container, .ns-main-content, .weekly-planner-wrapper {
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .weekly-title {
            color: #2D1D13 !important;
            font-size: 3.5rem !important;
          }
          .pastel-card {
            border: 1px solid #D6C2B4 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            break-inside: avoid;
          }
          .task-row {
            border-bottom: 1px solid #E5D5CA !important;
          }
        }
        .task-row:hover .hover-opacity-100 {
          opacity: 1 !important;
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default WeeklyToDoPlanner;
