import { API_BASE_URL } from "../utils/apiConfig.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiSmile,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiSave,
  FiAlertTriangle,
  FiTrendingUp,
  FiPieChart,
  FiTag,
  FiCpu,
  FiRefreshCw,
  FiActivity,
  FiPlay,
  FiZap,
} from "react-icons/fi";
import "../styles/studentDashboard.css";

const moodOptions = [
  { id: "Very Happy", label: "Very Happy", emoji: "😄", color: "#10B981" },
  { id: "Happy", label: "Happy", emoji: "🙂", color: "#3B82F6" },
  { id: "Neutral", label: "Neutral", emoji: "😐", color: "#94A3B8" },
  { id: "Sad", label: "Sad", emoji: "😔", color: "#6366F1" },
  { id: "Stressed", label: "Stressed", emoji: "😣", color: "#EF4444" },
  { id: "Tired", label: "Tired", emoji: "😴", color: "#8B5CF6" },
];

const emotionColors = {
  happy: "#10B981",
  calm: "#3B82F6",
  tired: "#8B5CF6",
  stressed: "#EF4444",
};

const emotionEmojis = {
  happy: "😊",
  calm: "😌",
  tired: "😴",
  stressed: "😣",
};

const journalPrompts = [
  {
    title: "🌟 Daily Wins & Gratitude",
    promptTitle: "My Daily Wins & Gratitude",
    content: "1. Today I felt proud when...\n2. One thing I'm deeply grateful for is...\n3. A small victory I achieved was...",
    mood: "Happy"
  },
  {
    title: "💡 Challenge & Overcoming",
    promptTitle: "Overcoming Today's Obstacle",
    content: "Today I faced a challenge when...\nHow I handled it:\nWhat I learned about my inner strength:",
    mood: "Neutral"
  },
  {
    title: "🧘 Mindful Inner Check-In",
    promptTitle: "Mindful Inner Check-In",
    content: "Right now my mind feels...\nMy physical energy level is...\nWhat I need most to feel balanced right now:",
    mood: "Very Happy"
  },
  {
    title: "🚀 Tomorrow's Core Motive",
    promptTitle: "Tomorrow's Core Motive & Goals",
    content: "My #1 priority for tomorrow is...\nI will stay motivated by...\nOne healthy habit I will practice:",
    mood: "Happy"
  }
];

const stickyNotesSeed = [
  {
    color: "ns-sticky-yellow",
    rotate: "-2deg",
    title: "✨ Motive of the Day",
    text: "“Small daily improvements over time lead to stunning results. Focus on progress, not perfection!”"
  },
  {
    color: "ns-sticky-cyan",
    rotate: "1.5deg",
    title: "💡 Mindset Anchor",
    text: "“Protect your inner peace. Your emotional clarity is your superpower in everything you study & build.”"
  },
  {
    color: "ns-sticky-pink",
    rotate: "-1deg",
    title: "💖 Joy & Gratitude",
    text: "“Take a deep breath. Celebrate how far you’ve come, even on tough days.”"
  },
  {
    color: "ns-sticky-mint",
    rotate: "2.5deg",
    title: "🎯 Focus Reminder",
    text: "“One task at a time. High quality effort brings deep cognitive mastery!”"
  }
];

function StudentJournal() {
  const navigate = useNavigate();
  const writeSectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState("journal");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Journal Entry Form State (Section 1)
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [writeMood, setWriteMood] = useState("");
  const [isSavingAndAnalyzing, setIsSavingAndAnalyzing] = useState(false);
  const [writeError, setWriteError] = useState("");

  // Latest Analysis State (Section 2)
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  // Analytics & Charts State (Section 3 & 4)
  const [timePeriod, setTimePeriod] = useState("7days"); // '7days' | '30days' | 'all'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // General Journals List & Modals State (Section 5)
  const [journals, setJournals] = useState([]);
  const [journalsLoading, setJournalsLoading] = useState(true);
  const [journalsError, setJournalsError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("All");

  // Modals
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formMood, setFormMood] = useState("");
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [modalError, setModalError] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJournal, setViewingJournal] = useState(null);
  const [viewAnalysis, setViewAnalysis] = useState(null);
  const [loadingViewAnalysis, setLoadingViewAnalysis] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJournalId, setDeletingJournalId] = useState(null);

  // Hover state for interactive Mood Trend chart
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchJournals();
  }, []);

  useEffect(() => {
    fetchAnalytics(timePeriod);
  }, [timePeriod]);

  // Fetch journals history
  const fetchJournals = async () => {
    setJournalsLoading(true);
    setJournalsError(null);
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setJournalsError("Authentication required. Please log in.");
      setJournalsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/journal`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setJournalsError(result.message || "Failed to load journal entries.");
        setJournalsLoading(false);
        return;
      }

      const list = result.data || [];
      setJournals(list);

      // Set initial latest analysis from newest entry if present
      if (list.length > 0 && list[0].analysis) {
        setLatestAnalysis(list[0].analysis);
      }

      setJournalsLoading(false);
    } catch (err) {
      console.error("Fetch Journals error:", err);
      setJournalsError("Cannot connect to backend server.");
      setJournalsLoading(false);
    }
  };

  // Fetch Analytics from MongoDB API
  const fetchAnalytics = async (period) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setAnalyticsError("Authentication required.");
      setAnalyticsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/journal/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setAnalyticsError(result.message || "Unable to load emotional insights.");
        setAnalyticsLoading(false);
        return;
      }

      setAnalyticsData(result.data);

      if (result.data && result.data.latestAnalysis) {
        setLatestAnalysis(result.data.latestAnalysis);
      }

      setAnalyticsLoading(false);
    } catch (err) {
      console.error("Fetch Analytics error:", err);
      setAnalyticsError("Unable to load emotional insights.");
      setAnalyticsLoading(false);
    }
  };

  // Handle SECTION 1: Save & Analyze
  const handleSaveAndAnalyze = async (e) => {
    e.preventDefault();
    setWriteError("");

    if (!writeTitle.trim()) {
      setWriteError("Please enter a title for your journal entry.");
      return;
    }

    if (!writeContent.trim()) {
      setWriteError("Please write your journal entry content.");
      return;
    }

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setWriteError("Authentication required. Please log in.");
      return;
    }

    setIsSavingAndAnalyzing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/journal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: writeTitle.trim(),
          content: writeContent.trim(),
          mood: writeMood,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setWriteError(result.message || "Unable to analyze this Journal right now.");
        setIsSavingAndAnalyzing(false);
        return;
      }

      const savedEntry = result.data;
      const analysis = savedEntry.analysis || null;

      // Reset form
      setWriteTitle("");
      setWriteContent("");
      setWriteMood("");
      setIsSavingAndAnalyzing(false);

      if (analysis) {
        setLatestAnalysis(analysis);
      }

      setSuccessMessage("Journal saved and analyzed successfully! ✨");
      setTimeout(() => setSuccessMessage(""), 4000);

      // Refresh data dynamically
      fetchJournals();
      fetchAnalytics(timePeriod);
    } catch (err) {
      console.error("Save and Analyze error:", err);
      setWriteError("Unable to analyze this Journal right now.");
      setIsSavingAndAnalyzing(false);
    }
  };

  // Handle Open View Modal
  const handleOpenViewModal = async (journal) => {
    setViewingJournal(journal);
    setViewAnalysis(journal.analysis || null);
    setShowViewModal(true);

    if (!journal.analysis && journal._id) {
      setLoadingViewAnalysis(true);
      const token = localStorage.getItem("neurosync_token");
      try {
        const response = await fetch(`http://localhost:5000/api/journal/${journal._id}/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok && result.success && result.data) {
          setViewAnalysis(result.data);
        }
      } catch (err) {
        console.error("Error fetching view analysis:", err);
      } finally {
        setLoadingViewAnalysis(false);
      }
    }
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (journal) => {
    setEditingJournal(journal);
    setFormTitle(journal.title || "");
    setFormContent(journal.content || "");
    setFormMood(journal.mood || "");
    setModalError("");
    if (showViewModal) setShowViewModal(false);
    setShowEditorModal(true);
  };

  // Handle Save Edit in Modal
  const handleSaveModalEdit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formTitle.trim() || !formContent.trim()) {
      setModalError("Title and content are required.");
      return;
    }

    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    setIsSubmittingModal(true);

    try {
      const response = await fetch(`http://localhost:5000/api/journal/${editingJournal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          content: formContent.trim(),
          mood: formMood,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setModalError(result.message || "Failed to update entry.");
        setIsSubmittingModal(false);
        return;
      }

      setIsSubmittingModal(false);
      setShowEditorModal(false);
      setSuccessMessage("Journal entry updated! ✏️");
      setTimeout(() => setSuccessMessage(""), 4000);

      fetchJournals();
      fetchAnalytics(timePeriod);
    } catch (err) {
      console.error("Update entry error:", err);
      setModalError("Server error while updating entry.");
      setIsSubmittingModal(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingJournalId) return;
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    setIsSubmittingModal(true);

    try {
      const response = await fetch(`http://localhost:5000/api/journal/${deletingJournalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setJournalsError(result.message || "Failed to delete journal entry.");
        setIsSubmittingModal(false);
        setShowDeleteModal(false);
        return;
      }

      setIsSubmittingModal(false);
      setShowDeleteModal(false);
      setDeletingJournalId(null);
      setSuccessMessage("Journal entry deleted. 🗑️");
      setTimeout(() => setSuccessMessage(""), 4000);

      fetchJournals();
      fetchAnalytics(timePeriod);
    } catch (err) {
      console.error("Delete error:", err);
      setJournalsError("Server error while deleting entry.");
      setIsSubmittingModal(false);
      setShowDeleteModal(false);
    }
  };

  const scrollToWriteSection = () => {
    if (writeSectionRef.current) {
      writeSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper date formatter
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter journals
  const filteredJournals = journals.filter((entry) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMood =
      selectedMoodFilter === "All" ||
      (entry.mood || "").toLowerCase() === selectedMoodFilter.toLowerCase();

    return matchesSearch && matchesMood;
  });

  // Dynamic SVG Donut Chart Calculation
  const renderEmotionDonutChart = (distribution) => {
    if (!distribution) return null;
    const { happy = 0, calm = 0, tired = 0, stressed = 0 } = distribution;

    const categories = [
      { key: "happy", label: "Happy", val: happy, color: emotionColors.happy },
      { key: "calm", label: "Calm", val: calm, color: emotionColors.calm },
      { key: "tired", label: "Tired", val: tired, color: emotionColors.tired },
      { key: "stressed", label: "Stressed", val: stressed, color: emotionColors.stressed },
    ].filter((c) => c.val > 0);

    if (categories.length === 0) {
      return (
        <div className="text-center text-muted py-4 small">
          No emotion categories recorded for this timeframe.
        </div>
      );
    }

    const totalVal = categories.reduce((acc, c) => acc + c.val, 0);
    const radius = 65;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPct = 0;

    return (
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-4 py-2">
        {/* SVG Donut */}
        <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: "170px", height: "170px" }}>
          <svg viewBox="0 0 180 180" className="w-100 h-100">
            {categories.map((cat, idx) => {
              const pct = cat.val / totalVal;
              const strokeDasharray = `${pct * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPct * circumference;
              accumulatedPct += pct;

              return (
                <circle
                  key={idx}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "all 0.5s ease" }}
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div className="position-absolute text-center">
            <div className="fs-3">{emotionEmojis[categories[0]?.key] || "💙"}</div>
            <div className="text-white fw-bold extra-small text-uppercase tracking-wider">
              {categories[0]?.label}
            </div>
            <div className="text-muted extra-small" style={{ fontSize: "0.68rem" }}>
              {categories[0]?.val}%
            </div>
          </div>
        </div>

        {/* Dynamic Legend Badges */}
        <div className="d-flex flex-column gap-2" style={{ minWidth: "140px" }}>
          {categories.map((cat) => (
            <div key={cat.key} className="d-flex align-items-center justify-content-between gap-3 p-2 rounded" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div className="d-flex align-items-center gap-2">
                <span className="rounded-circle" style={{ width: "10px", height: "10px", background: cat.color, boxShadow: `0 0 6px ${cat.color}` }} />
                <span className="text-white fw-semibold small">{cat.label}</span>
              </div>
              <span className="text-muted fw-bold small">{cat.val}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Dynamic SVG Interactive Line Chart Calculation
  const renderMoodTrendChart = (trendData) => {
    if (!trendData || trendData.length === 0) return null;

    const isLight = typeof document !== "undefined" && (document.body.classList.contains("light-theme") || document.documentElement.getAttribute("data-theme") === "light");

    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 30;

    const points = trendData.map((d, i) => {
      const x = paddingX + (i / Math.max(1, trendData.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((d.score - 1) / 9) * (height - 2 * paddingY);
      return { x, y, ...d };
    });

    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
    const areaStr = `${pointsStr} L${points[points.length - 1].x},${height - 15} L${points[0].x},${height - 15} Z`;

    return (
      <div className="position-relative w-100">
        <div className="d-flex justify-content-between align-items-center mb-2 px-2 text-muted extra-small fw-semibold">
          <span>Date</span>
          <span>Mood Score (1-10)</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-100" style={{ maxHeight: "200px" }}>
          <defs>
            <linearGradient id="moodLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines for 2, 4, 6, 8, 10 */}
          {[2, 4, 6, 8, 10].map((level) => {
            const y = height - paddingY - ((level - 1) / 9) * (height - 2 * paddingY);
            return (
              <g key={level}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.08)"} strokeDasharray="3" />
                <text x={paddingX - 10} y={y + 4} fill={isLight ? "#475569" : "rgba(255,255,255,0.7)"} fontSize="10" fontWeight="600" textAnchor="end">
                  {level}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaStr} fill="url(#moodAreaGrad)" />

          {/* Line Path */}
          <path d={`M ${pointsStr}`} fill="none" stroke="url(#moodLineGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Data Points */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={p.x} cy={p.y} r="6" fill={isLight ? "#FFFFFF" : "#0F172A"} stroke="#8B5CF6" strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
              <text x={p.x} y={height - 5} fill={isLight ? "#475569" : "rgba(255,255,255,0.8)"} fontSize="10" fontWeight="600" textAnchor="middle">
                {p.date}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="position-absolute bg-dark text-white p-2 rounded shadow-lg border border-purple border-opacity-50 extra-small pointer-events-none"
            style={{
              top: "10px",
              right: "20px",
              zIndex: 10,
              background: "rgba(15, 23, 42, 0.95)",
            }}
          >
            <div className="fw-bold text-purple-300 mb-0.5">{hoveredPoint.title || "Journal Entry"}</div>
            <div className="text-white-50">Date: {hoveredPoint.date}</div>
            <div className="text-info fw-bold">Mood Score: {hoveredPoint.score}/10</div>
          </div>
        )}
      </div>
    );
  };

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

      {/* Main Content */}
      <main className="ns-main-content">
        {/* Header Title Banner */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#A78BFA",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <FiBookOpen className="me-1" /> NeuroSync Personal Diary Notebook
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">My Daily Journal & Motive Space 📖</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Reflect on your day, capture inspiration, and discover emotional clarity with AI guidance.
            </p>
          </div>
        </div>

        {/* Motive & Affirmation Banner */}
        <div className="ns-motive-banner p-4 mb-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-pill bg-warning text-dark fw-bold px-3 py-1">
                  🔥 Daily Mindset Builder
                </span>
                <span className="text-purple-300 small fw-semibold" style={{ color: "#C084FC" }}>
                  Need inspiration to write? Choose a template below:
                </span>
              </div>
              <p className="journal-handwriting text-white fs-4 mb-3" style={{ lineHeight: "1.3" }}>
                “Every reflection is a seed for personal growth. Be honest with your heart.”
              </p>
            </div>
          </div>

          {/* Quick Journal Prompt Selector Buttons */}
          <div className="d-flex flex-wrap gap-2 pt-2 border-top border-purple border-opacity-25">
            {journalPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-sm rounded-pill text-white border border-purple border-opacity-30 px-3 py-1.5 d-inline-flex align-items-center gap-1.5"
                style={{ background: "rgba(255, 255, 255, 0.06)", fontSize: "0.82rem" }}
                onClick={() => {
                  setWriteTitle(p.promptTitle);
                  setWriteContent(p.content);
                  setWriteMood(p.mood);
                  if (writeSectionRef.current) {
                    writeSectionRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Success Feedback Alert */}
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

        {/* =========================================================================
            MOTIVATIONAL STICKY NOTES PIN-BOARD (POST-IT STYLES)
        ========================================================================= */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
              📌 Inspiration & Motive Sticky Board
            </h5>
            <span className="text-muted small">Daily Post-it Affirmations</span>
          </div>

          <div className="row g-3">
            {stickyNotesSeed.map((note, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-md-3">
                <div 
                  className={`ns-sticky-note-card ${note.color} h-100 d-flex flex-column justify-content-between`}
                  style={{ transform: `rotate(${note.rotate})` }}
                >
                  <div className="ns-push-pin" />
                  <h6 className="fw-bold mb-2 journal-handwriting fs-4">{note.title}</h6>
                  <p className="journal-handwriting fs-5 mb-0" style={{ lineHeight: "1.3" }}>
                    {note.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: REAL DIARY NOTEBOOK WRITING PAGE
        ========================================================================= */}
        <div ref={writeSectionRef} className="ns-diary-book mb-5">
          {/* Notebook Margin Line & Ribbon */}
          <div className="ns-diary-margin-line" />
          <div className="ns-diary-bookmark" title="Bookmark" />

          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h4 className="text-white fw-bold mb-0 d-flex align-items-center gap-2 journal-handwriting fs-2">
                ✍️ Dear Diary...
              </h4>
              <span className="text-muted small">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 px-3 py-1.5 rounded-pill text-xs">
              ✨ AI Emotion Analysis Active
            </span>
          </div>

          {/* Error message in Section 1 with Retry */}
          {writeError && (
            <div className="alert alert-danger d-flex align-items-center justify-content-between rounded-3 p-3 mb-3 border-0" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#FCA5A5" }}>
              <div className="d-flex align-items-center gap-2">
                <FiAlertCircle size={18} className="text-danger flex-shrink-0" />
                <span>{writeError}</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger text-white rounded-2 px-3 py-1 text-xs"
                onClick={handleSaveAndAnalyze}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State Animation when AI Analysis is Running */}
          {isSavingAndAnalyzing ? (
            <div className="text-center py-5 my-3 rounded-4 bg-dark bg-opacity-50 border border-purple border-opacity-30">
              <div className="spinner-border text-purple mb-3" style={{ width: "2.8rem", height: "2.8rem", color: "#8B5CF6" }} role="status">
                <span className="visually-hidden">Analyzing your Diary Entry...</span>
              </div>
              <h5 className="text-white fw-bold mb-1">Analyzing your Diary Entry...</h5>
              <p className="text-muted small mb-0" style={{ maxWidth: "450px", margin: "0 auto" }}>
                Generating structured emotional insights, wellness metrics, and saving to your MongoDB profile.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveAndAnalyze}>
              {/* Mood Badge Selector */}
              <div className="mb-4">
                <label className="form-label text-purple-300 fw-semibold extra-small text-uppercase mb-2 tracking-wider">
                  How are you feeling right now?
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {moodOptions.map((m) => {
                    const isSelected = writeMood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 transition-all"
                        style={{
                          background: isSelected ? m.color : "rgba(255, 255, 255, 0.05)",
                          color: isSelected ? "#FFFFFF" : "#94A3B8",
                          border: isSelected ? `2px solid ${m.color}` : "1px solid rgba(255, 255, 255, 0.1)",
                          boxShadow: isSelected ? `0 0 12px ${m.color}66` : "none"
                        }}
                        onClick={() => setWriteMood(m.id)}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Journal Title Input */}
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control ns-diary-title-input"
                  placeholder="Title of today's page (e.g. A breakthrough moment during study)..."
                  value={writeTitle}
                  onChange={(e) => {
                    setWriteTitle(e.target.value);
                    if (writeError) setWriteError("");
                  }}
                  required
                />
              </div>

              {/* Journal Content Textarea */}
              <div className="mb-4">
                <textarea
                  className="form-control ns-diary-textarea"
                  rows="7"
                  placeholder="Start typing your thoughts here... How was your day? What inspired you?"
                  value={writeContent}
                  onChange={(e) => {
                    setWriteContent(e.target.value);
                    if (writeError) setWriteError("");
                  }}
                  required
                />
              </div>

              {/* Action Toolbar */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pt-3 border-top border-secondary border-opacity-25">
                <span className="text-muted extra-small">
                  💡 AI will automatically detect sentiment score, stress metrics & key themes.
                </span>

                <button
                  type="submit"
                  className="btn px-4 py-2.5 rounded-pill text-white fw-bold d-inline-flex align-items-center gap-2 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
                    border: "none",
                    boxShadow: "0 4px 18px rgba(139, 92, 246, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                  disabled={isSavingAndAnalyzing || !writeTitle.trim() || !writeContent.trim()}
                >
                  <FiCpu size={18} />
                  <span>Save Page & AI Analyze</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* =========================================================================
            SECTION 2: LATEST AI ANALYSIS CARD
        ========================================================================= */}
        {latestAnalysis && (
          <div
            className="ns-card p-4 mb-4 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(88, 28, 135, 0.25) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.35)",
              borderRadius: "16px",
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                ✨ AI Journal Analysis
              </h5>
              <span className="badge rounded-pill bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 px-3 py-1 text-xs">
                Wellness Indicators
              </span>
            </div>

            {/* Quick Metrics Grid (5 Cards) */}
            <div className="row g-3 mb-3">
              {/* Overall Mood */}
              <div className="col-12 col-sm-6 col-md-2.4 col-lg">
                <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25 text-center h-100">
                  <span className="text-muted extra-small d-block mb-1">Overall Mood</span>
                  <div className="text-white fw-bold fs-6 capitalize">
                    {latestAnalysis.sentiment === "positive" ? "😊 Positive" : latestAnalysis.sentiment === "negative" ? "😔 Negative" : "😐 Neutral"}
                  </div>
                </div>
              </div>

              {/* Mood Score */}
              <div className="col-12 col-sm-6 col-md-2.4 col-lg">
                <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25 text-center h-100">
                  <span className="text-muted extra-small d-block mb-1">Mood Score</span>
                  <div className="text-primary fw-extrabold fs-5">
                    {latestAnalysis.moodScore || 5}/10
                  </div>
                </div>
              </div>

              {/* Stress Level */}
              <div className="col-12 col-sm-6 col-md-2.4 col-lg">
                <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25 text-center h-100">
                  <span className="text-muted extra-small d-block mb-1">Stress Level</span>
                  <div className="text-warning fw-bold fs-6 capitalize">
                    {latestAnalysis.stressLevel || "Low"}
                  </div>
                </div>
              </div>

              {/* Energy Level */}
              <div className="col-12 col-sm-6 col-md-2.4 col-lg">
                <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25 text-center h-100">
                  <span className="text-muted extra-small d-block mb-1">Energy Level</span>
                  <div className="text-info fw-bold fs-6 capitalize">
                    {latestAnalysis.energyLevel || "Medium"}
                  </div>
                </div>
              </div>

              {/* Dominant Emotion */}
              <div className="col-12 col-sm-6 col-md-2.4 col-lg">
                <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25 text-center h-100">
                  <span className="text-muted extra-small d-block mb-1">Dominant Emotion</span>
                  <div className="text-purple-300 fw-bold fs-6 capitalize" style={{ color: "#C084FC" }}>
                    {latestAnalysis.emotion || "Calm"}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary Box */}
            {latestAnalysis.summary && (
              <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                <span className="text-purple-300 fw-bold small d-block mb-1" style={{ color: "#C084FC" }}>
                  AI Summary:
                </span>
                <p className="text-white-50 mb-0 small" style={{ lineHeight: "1.6" }}>
                  "{latestAnalysis.summary}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            SECTION 3: EMOTIONAL ANALYTICS (MOOD TREND, DONUT CHART, KEY THEMES)
        ========================================================================= */}
        <div className="ns-card p-4 mb-4">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
            <div>
              <h4 className="text-white fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: "1.15rem" }}>
                <FiActivity className="text-primary" /> Emotional Analytics
              </h4>
              <p className="text-muted small mb-0">
                Dynamic line trend and donut distribution computed directly from MongoDB.
              </p>
            </div>

            {/* Date Filter Tabs */}
            <div className="d-flex align-items-center gap-1 bg-dark p-1 rounded-3 border border-secondary border-opacity-25 align-self-start align-self-sm-center">
              <button
                className={`ns-chart-tab-btn ${timePeriod === "7days" ? "active" : ""}`}
                onClick={() => setTimePeriod("7days")}
              >
                Last 7 Days
              </button>
              <button
                className={`ns-chart-tab-btn ${timePeriod === "30days" ? "active" : ""}`}
                onClick={() => setTimePeriod("30days")}
              >
                Last 30 Days
              </button>
              <button
                className={`ns-chart-tab-btn ${timePeriod === "all" ? "active" : ""}`}
                onClick={() => setTimePeriod("all")}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Analytics Loading / Error / Empty / Content */}
          {analyticsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading emotional insights...</span>
              </div>
              <p className="text-muted small">Fetching interactive charts from database...</p>
            </div>
          ) : analyticsError ? (
            <div className="ns-card p-4 text-center border-danger border-opacity-50 my-2">
              <FiAlertCircle size={36} className="text-danger mb-2" />
              <h5 className="text-white fw-bold mb-1">Unable to load emotional insights</h5>
              <p className="text-muted small mb-3">{analyticsError}</p>
              <button className="btn btn-sm btn-outline-primary px-4 py-2" onClick={() => fetchAnalytics(timePeriod)}>
                <FiRefreshCw className="me-2" /> Retry
              </button>
            </div>
          ) : !analyticsData || !analyticsData.hasData || analyticsData.totalEntries === 0 ? (
            /* Empty State */
            <div className="p-5 text-center rounded-4 bg-dark bg-opacity-40 border border-secondary border-opacity-25 my-2">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3 bg-primary bg-opacity-10 text-primary">
                <FiSmile size={36} />
              </div>
              <h5 className="text-white fw-bold mb-1">No emotional insights yet</h5>
              <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: "420px" }}>
                Write a few Journal entries to start discovering your emotional patterns across time.
              </p>
              <button className="btn px-4 py-2 rounded-3 text-white fw-bold btn-primary" onClick={scrollToWriteSection}>
                <FiPlus className="me-1" /> Write Journal
              </button>
            </div>
          ) : (
            <>
              {/* GRID FOR CHARTS */}
              <div className="row g-4 mb-4">
                {/* 1. MOOD TREND GRAPH */}
                <div className="col-12 col-lg-7">
                  <div className="p-3.5 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 h-100">
                    <h5 className="text-white fw-bold small mb-3 d-flex align-items-center gap-2">
                      <FiTrendingUp className="text-primary" /> Your Mood Trend
                    </h5>

                    {renderMoodTrendChart(analyticsData.moodTrend)}
                  </div>
                </div>

                {/* 2. EMOTIONAL DISTRIBUTION DONUT CHART & KEY THEMES */}
                <div className="col-12 col-lg-5">
                  <div className="p-3.5 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="text-white fw-bold small mb-3 d-flex align-items-center gap-2">
                        <FiPieChart className="text-purple-400" style={{ color: "#C084FC" }} /> Emotional Distribution
                      </h5>

                      {renderEmotionDonutChart(analyticsData.emotionDistribution)}
                    </div>

                    {/* KEY THEMES TAGS */}
                    <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                      <h6 className="text-white-50 extra-small fw-bold text-uppercase mb-2 tracking-wider d-flex align-items-center gap-1">
                        <FiTag /> Key Themes
                      </h6>
                      <div className="d-flex flex-wrap gap-1.5">
                        {analyticsData.keyThemes && analyticsData.keyThemes.length > 0 ? (
                          analyticsData.keyThemes.map((theme, idx) => (
                            <span
                              key={idx}
                              className="badge rounded-pill px-3 py-1.5 fw-medium ns-key-theme-badge"
                              style={{
                                fontSize: "0.8rem",
                              }}
                            >
                              🏷️ {theme}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted extra-small">No themes detected.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =========================================================================
            SECTION 4: EMOTIONAL PATTERN SUMMARY
        ========================================================================= */}
        {analyticsData && analyticsData.hasData && analyticsData.emotionalPatternSummary && (
          <div
            className="ns-card p-4 mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(88, 28, 135, 0.2) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              borderLeft: "4px solid #A855F7",
              borderRadius: "16px",
            }}
          >
            <h5 className="text-purple-300 fw-bold fs-6 mb-2 d-flex align-items-center gap-2" style={{ color: "#C084FC" }}>
              💡 Your Emotional Pattern
            </h5>
            <p className="text-white-50 mb-0" style={{ lineHeight: "1.65", fontSize: "0.93rem" }}>
              "{analyticsData.emotionalPatternSummary}"
            </p>
          </div>
        )}

        {/* =========================================================================
            SECTION 5: PREVIOUS JOURNAL ENTRIES HISTORY & SEARCH/FILTERS
        ========================================================================= */}
        <div className="mt-5 mb-4">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3">
            <h4 className="text-white fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.15rem" }}>
              <FiBookOpen className="text-warning" /> Journal History
            </h4>

            <span className="text-muted small">
              Total Entries: <strong>{journals.length}</strong>
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="ns-card mb-4 p-3">
            <div className="row g-3 align-items-center">
              {/* Search */}
              <div className="col-12 col-md-5 col-lg-4">
                <div className="position-relative">
                  <FiSearch className="position-absolute top-50 translate-middle-y text-muted ms-3" size={18} />
                  <input
                    type="text"
                    className="form-control text-white rounded-3 ps-5 pe-4 py-2"
                    placeholder="Search entries by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFF",
                    }}
                  />
                  {searchTerm && (
                    <button type="button" className="btn p-0 position-absolute top-50 end-0 translate-middle-y me-3 text-muted" onClick={() => setSearchTerm("")}>
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Mood Filter Chips */}
              <div className="col-12 col-md-7 col-lg-8">
                <div className="d-flex align-items-center gap-2 overflow-auto py-1">
                  <span className="text-muted small fw-medium d-flex align-items-center me-1 flex-shrink-0">
                    <FiFilter className="me-1" /> Mood:
                  </span>

                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-medium flex-shrink-0 ${selectedMoodFilter === "All" ? "btn-primary text-white" : "btn-outline-secondary text-muted"}`}
                    onClick={() => setSelectedMoodFilter("All")}
                  >
                    All ({journals.length})
                  </button>

                  {moodOptions.map((m) => {
                    const isSelected = selectedMoodFilter === m.id;
                    const count = journals.filter((j) => (j.mood || "").toLowerCase() === m.id.toLowerCase()).length;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className="btn btn-sm rounded-pill px-3 py-1 fw-medium flex-shrink-0"
                        style={{
                          background: isSelected ? `${m.color}33` : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? `1px solid ${m.color}` : "1px solid rgba(255, 255, 255, 0.08)",
                          color: isSelected ? "#FFFFFF" : "#94A3B8",
                        }}
                        onClick={() => setSelectedMoodFilter(m.id)}
                      >
                        <span className="me-1">{m.emoji}</span> {m.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Journal Cards */}
          {journalsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading journals...</span>
              </div>
              <p className="text-muted">Loading your past journal entries...</p>
            </div>
          ) : filteredJournals.length === 0 ? (
            <div className="ns-card text-center py-5 px-4">
              <h5 className="text-white fw-bold mb-2">No Matching Entries Found</h5>
              <p className="text-muted small mb-3">No journal entries matched your search query or filter.</p>
              <button
                className="btn btn-sm btn-outline-secondary text-white rounded-3 px-3"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMoodFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="row g-4 mb-4">
              {filteredJournals.map((journal, idx) => {
                const analysisObj = journal.analysis;
                const stickyColors = [
                  "ns-sticky-yellow",
                  "ns-sticky-pink",
                  "ns-sticky-cyan",
                  "ns-sticky-mint",
                  "ns-sticky-lavender",
                  "ns-sticky-orange"
                ];
                const rotations = ["-2deg", "1.5deg", "-1.2deg", "2deg", "-1.8deg", "1deg"];
                const colorClass = stickyColors[idx % stickyColors.length];
                const rot = rotations[idx % rotations.length];

                return (
                  <div key={journal._id} className="col-12 col-md-6 col-lg-4">
                    <div 
                      className={`ns-sticky-note-card ${colorClass} h-100 d-flex flex-column justify-content-between`}
                      style={{ transform: `rotate(${rot})` }}
                    >
                      {/* Push Pin Header */}
                      {idx % 2 === 0 ? <div className="ns-push-pin" /> : <div className="ns-sticky-tape" />}

                      <div>
                        {/* Meta Badge & Date */}
                        <div className="d-flex align-items-center justify-content-between mb-2 mt-2">
                          <span className="badge rounded-pill px-2.5 py-1 bg-dark bg-opacity-25 text-dark extra-small fw-bold">
                            {journal.mood ? `Mood: ${journal.mood}` : "Reflection"}
                          </span>

                          <span className="extra-small d-flex align-items-center gap-1 opacity-75 fw-semibold">
                            <FiCalendar size={13} />
                            {formatDate(journal.createdAt)}
                          </span>
                        </div>

                        {/* Title */}
                        <h5 className="fw-bold mb-2 journal-handwriting fs-3 text-truncate" title={journal.title}>
                          {journal.title}
                        </h5>

                        {/* Content Preview */}
                        <p
                          className="journal-handwriting fs-5 mb-3"
                          style={{
                            lineHeight: "1.35",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "4rem",
                          }}
                        >
                          {journal.content}
                        </p>

                        {/* Analysis Indicator */}
                        {analysisObj ? (
                          <div className="p-2 rounded bg-black bg-opacity-10 border border-black border-opacity-10 d-flex align-items-center justify-content-between mb-2" style={{ fontSize: "0.78rem" }}>
                            <span className="fw-bold extra-small">
                              Score: {analysisObj.moodScore || 5}/10 • {analysisObj.sentiment}
                            </span>
                            <span className="badge bg-dark text-white extra-small">Analyzed</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-top border-black border-opacity-10 d-flex align-items-center justify-content-between">
                        <button
                          type="button"
                          className="btn btn-sm btn-dark rounded-pill d-inline-flex align-items-center gap-1 px-3 py-1 text-xs text-white ns-keep-white"
                          onClick={() => handleOpenViewModal(journal)}
                        >
                          <FiEye size={13} className="text-white ns-keep-white" /> Read Entry
                        </button>

                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm p-1 border-0"
                            onClick={() => handleOpenEditModal(journal)}
                            title="Edit"
                          >
                            <FiEdit3 size={16} className="text-dark" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm p-1 border-0"
                            onClick={() => {
                              setDeletingJournalId(journal._id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete"
                          >
                            <FiTrash2 size={16} className="text-danger" />
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
      </main>

      {/* Footer */}
      <DashboardFooter />

      {/* ==================== VIEW ENTRY MODAL ==================== */}
      {showViewModal && viewingJournal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content text-white rounded-4 border-0 shadow-lg overflow-hidden" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
                <div>
                  <h5 className="modal-title fw-bold text-white mb-0">{viewingJournal.title}</h5>
                  <span className="text-muted extra-small"><FiCalendar className="me-1" /> {formatDate(viewingJournal.createdAt)}</span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)} />
              </div>

              <div className="modal-body px-4 py-4" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                <div className="ns-diary-book mb-4 p-4">
                  <div className="ns-diary-margin-line" />
                  <div className="ns-diary-bookmark" />
                  <h4 className="journal-handwriting text-journal-title fs-2 mb-3">{viewingJournal.title}</h4>
                  <div className="journal-handwriting text-journal-ink fs-4" style={{ whiteSpace: "pre-wrap", lineHeight: "2.1rem" }}>
                    {viewingJournal.content}
                  </div>
                </div>

                {/* Analysis Card in View Modal */}
                <div className="p-4 rounded-4 position-relative overflow-hidden mb-2" style={{ background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(88, 28, 135, 0.25) 100%)", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
                  <h5 className="text-white fw-bold mb-3 small d-flex align-items-center gap-2">
                    ✨ AI Journal Analysis
                  </h5>

                  {loadingViewAnalysis ? (
                    <div className="text-center py-3 text-muted small">Loading analysis...</div>
                  ) : viewAnalysis ? (
                    <div className="d-flex flex-column gap-3">
                      <div className="row g-3">
                        <div className="col-6">
                          <span className="text-muted extra-small d-block mb-1">Sentiment:</span>
                          <span className="badge rounded-pill px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 capitalize">
                            {viewAnalysis.sentiment || "neutral"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="text-muted extra-small d-block mb-1">Mood Score:</span>
                          <span className="text-white fw-bold fs-6">{viewAnalysis.moodScore || 5}/10</span>
                        </div>
                      </div>

                      {viewAnalysis.summary && (
                        <div className="p-3 rounded-3 bg-dark bg-opacity-40">
                          <span className="text-purple-300 extra-small fw-bold d-block mb-1">Summary:</span>
                          <p className="text-white-50 extra-small mb-0">"{viewAnalysis.summary}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted small">Analysis unavailable for this entry.</div>
                  )}
                </div>
              </div>

              <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3 d-flex justify-content-between">
                <button type="button" className="btn btn-outline-danger btn-sm rounded-3" onClick={() => handleOpenDeleteModal(viewingJournal._id)}>
                  <FiTrash2 className="me-1" /> Delete
                </button>
                <button type="button" className="btn btn-secondary btn-sm rounded-3 px-4" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT MODAL ==================== */}
      {showEditorModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content text-white rounded-4 border-0 shadow-lg overflow-hidden" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
                <h5 className="modal-title fw-bold">Edit Journal Entry</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditorModal(false)} />
              </div>

              <form onSubmit={handleSaveModalEdit}>
                <div className="modal-body px-4 py-4">
                  {modalError && <div className="alert alert-danger p-2 extra-small rounded-3 mb-3">{modalError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary border-opacity-25 p-3 rounded-3" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Content</label>
                    <textarea className="form-control bg-dark text-white border-secondary border-opacity-25 p-3 rounded-3" rows="6" value={formContent} onChange={(e) => setFormContent(e.target.value)} required />
                  </div>
                </div>

                <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3">
                  <button type="button" className="btn btn-outline-secondary text-white btn-sm rounded-3 px-4" onClick={() => setShowEditorModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm rounded-3 px-4 fw-bold" disabled={isSubmittingModal}>
                    {isSubmittingModal ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE MODAL ==================== */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white rounded-4 border-0 shadow-lg overflow-hidden" style={{ background: "#0F172A", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
              <div className="modal-body text-center p-4">
                <FiAlertTriangle size={36} className="text-danger mb-3" />
                <h5 className="fw-bold text-white mb-2">Delete Journal Entry?</h5>
                <p className="text-muted small mb-4">Are you sure you want to delete this journal entry? This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-outline-secondary text-white rounded-3 px-4" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger rounded-3 px-4 fw-bold" onClick={handleConfirmDelete} disabled={isSubmittingModal}>
                    {isSubmittingModal ? "Deleting..." : "Yes, Delete"}
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

export default StudentJournal;
