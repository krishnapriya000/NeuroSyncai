import React, { useState, useEffect } from "react";
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
} from "react-icons/fi";
import "../styles/studentDashboard.css";

const moodOptions = [
  { id: "Very Happy", label: "Very Happy", emoji: "😄", color: "#10B981" },
  { id: "Happy", label: "Happy", emoji: "🙂", color: "#3B82F6" },
  { id: "Neutral", label: "Neutral", emoji: "😐", color: "#94A3B8" },
  { id: "Sad", label: "Sad", emoji: "😔", color: "#6366F1" },
  { id: "Stressed", label: "Stressed", emoji: "😣", color: "#F59E0B" },
  { id: "Angry", label: "Angry", emoji: "😡", color: "#EF4444" },
  { id: "Tired", label: "Tired", emoji: "😴", color: "#8B5CF6" },
  { id: "Anxious", label: "Anxious", emoji: "😰", color: "#EC4899" },
];

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning 🌤️";
  if (hour >= 12 && hour < 17) return "Good afternoon ☀️";
  if (hour >= 17 && hour < 21) return "Good evening 🌙";
  return "Take a quiet moment before you end your day 🌙";
};

const calculateJournalStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;
  const formatDateStr = (dateObj) => {
    const d = new Date(dateObj);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const dates = [...new Set(entries.map((j) => formatDateStr(j.createdAt)))].sort((a, b) => (a < b ? 1 : -1));
  if (dates.length === 0) return 0;

  const todayStr = formatDateStr(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  let streak = 0;
  if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
    let curr = dates.includes(todayStr) ? new Date() : yesterday;
    while (true) {
      const dStr = formatDateStr(curr);
      if (dates.includes(dStr)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
  }
  return streak;
};

const generatePersonalizedMessage = (entries, latestMoodTracker) => {
  const total = entries ? entries.length : 0;

  if (total === 0) {
    return "Start by writing what's on your mind today. There is no right or wrong way to journal. 🌱";
  }

  if (total === 1) {
    return "You've taken the first step toward understanding your thoughts. Keep going! 💙";
  }

  const streak = calculateJournalStreak(entries);
  if (streak >= 2) {
    return `You've journaled for ${streak} days in a row! Your consistency is something to be proud of. 🔥`;
  }

  const latestEntry = entries[0];
  const now = new Date();
  const daysSinceLast = Math.floor((now - new Date(latestEntry.createdAt)) / (1000 * 60 * 60 * 24));

  if (daysSinceLast >= 3) {
    return "It's been a little while since your last journal entry. Take a few minutes today to check in with yourself. 💙";
  }

  // Mood Integration
  const currentMood = (latestMoodTracker || latestEntry.mood || "").toLowerCase();
  if (currentMood.includes("stress") || currentMood.includes("sad") || currentMood.includes("anxious") || currentMood.includes("angry") || currentMood.includes("tired")) {
    return "You seem to have had a stressful day. Writing your thoughts down may help you organize what you're feeling. Take your time. 💙";
  }

  if (currentMood.includes("happy") || currentMood.includes("great") || currentMood.includes("calm") || currentMood.includes("energetic")) {
    return "It looks like you've been having some positive moments lately. Capture what made today meaningful. 😊";
  }

  if (currentMood.includes("neutral") || currentMood.includes("okay")) {
    return "Take a moment to reflect on how your day went. Even small thoughts are worth writing down. 🌱";
  }

  return "You're building a healthy journaling habit. Keep giving yourself time to reflect. 🌱";
};

function StudentJournal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("journal");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Data state
  const [journals, setJournals] = useState([]);
  const [latestTrackerMood, setLatestTrackerMood] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Journal Insights & Reflection State
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("All");

  // Modal states
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJournal, setViewingJournal] = useState(null);

  // AI Analysis for Viewing Journal Modal
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJournalId, setDeletingJournalId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formMood, setFormMood] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch logged in student info and journals on mount
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

    fetchJournals();
    fetchInsights();
  }, []);

  const fetchJournals = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setError("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // Fetch latest mood from Mood Tracker safely
      fetch("http://localhost:5000/api/moodtracker/latest", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.data && data.data.mood) {
            setLatestTrackerMood(data.data.mood);
          }
        })
        .catch((err) => console.error("Error fetching mood tracker for journal message:", err));

      const response = await fetch("http://localhost:5000/api/journal", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to load journal entries.");
        setLoading(false);
        return;
      }

      setJournals(result.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching journals:", err);
      setError("Cannot connect to backend server.");
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/journal/insights", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setInsights(result.data);
      }
    } catch (err) {
      console.error("Error fetching journal insights:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Open modal for New Entry
  const handleOpenCreateModal = () => {
    setEditingJournal(null);
    setFormTitle("");
    setFormContent("");
    setFormMood("");
    setFormError("");
    setShowEditorModal(true);
  };

  // Open modal for Edit Entry
  const handleOpenEditModal = (journal) => {
    setEditingJournal(journal);
    setFormTitle(journal.title || "");
    setFormContent(journal.content || "");
    setFormMood(journal.mood || "");
    setFormError("");
    if (showViewModal) setShowViewModal(false);
    setShowEditorModal(true);
  };

  // Open modal for View Entry & fetch existing analysis
  const handleOpenViewModal = async (journal) => {
    setViewingJournal(journal);
    setShowViewModal(true);
    setCurrentAnalysis(null);
    setAnalysisError("");
    setLoadingAnalysis(true);

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoadingAnalysis(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/journal/${journal._id}/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setCurrentAnalysis(result.data);
      }
    } catch (err) {
      console.error("Error loading journal entry analysis:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Handle Trigger AI Analysis for specific entry
  const handleAnalyzeEntry = async (forceReanalyze = false) => {
    if (!viewingJournal) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setAnalysisError("Authentication session expired.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      const response = await fetch(`http://localhost:5000/api/journal/${viewingJournal._id}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ forceReanalyze }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setAnalysisError(result.message || "Unable to analyze this entry right now. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      setCurrentAnalysis(result.data);
      setIsAnalyzing(false);
      // Refresh insights summary dynamically
      fetchInsights();
    } catch (err) {
      console.error("AI Analysis error:", err);
      setAnalysisError("Unable to analyze this entry right now. Please try again.");
      setIsAnalyzing(false);
    }
  };

  // Open Delete confirmation modal
  const handleOpenDeleteModal = (id) => {
    setDeletingJournalId(id);
    if (showViewModal) setShowViewModal(false);
    setShowDeleteModal(true);
  };

  // Handle Save (Create or Update)
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Please enter a title for your journal entry.");
      return;
    }

    if (!formContent.trim()) {
      setFormError("Please write your journal entry content.");
      return;
    }

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setFormError("Authentication token missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingJournal
        ? `http://localhost:5000/api/journal/${editingJournal._id}`
        : "http://localhost:5000/api/journal";
      const method = editingJournal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          mood: formMood,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        setFormError(`Server response error (Status ${response.status}).`);
        setIsSubmitting(false);
        return;
      }

      if (response.status === 401) {
        setFormError("Session expired or unauthorized. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok || !result.success) {
        setFormError(result.message || "Failed to save journal entry.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setShowEditorModal(false);
      setSuccessMessage(
        editingJournal
          ? "Journal entry updated successfully! ✏️"
          : "New journal entry saved successfully! ✨"
      );

      fetchJournals();
      fetchInsights();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      console.error("Save journal error:", err);
      setFormError("Server error occurred while saving entry.");
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingJournalId) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setError("Authentication token missing.");
      setShowDeleteModal(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/journal/${deletingJournalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to delete journal entry.");
        setIsSubmitting(false);
        setShowDeleteModal(false);
        return;
      }

      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeletingJournalId(null);
      setSuccessMessage("Journal entry deleted successfully. 🗑️");

      fetchJournals();
      fetchInsights();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      console.error("Delete journal error:", err);
      setError("Server error occurred while deleting entry.");
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  // Helpers for Mood displays
  const getMoodEmoji = (moodStr) => {
    const found = moodOptions.find(
      (m) => m.id.toLowerCase() === (moodStr || "").toLowerCase()
    );
    return found ? found.emoji : "📝";
  };

  const getMoodColor = (moodStr) => {
    const found = moodOptions.find(
      (m) => m.id.toLowerCase() === (moodStr || "").toLowerCase()
    );
    return found ? found.color : "#3B82F6";
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter journals by search term and selected mood
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
        {/* Header Title & New Entry Button */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#A78BFA",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <FiBookOpen className="me-1" /> Student AI Reflection Journal
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">My Journal</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Write, reflect, and understand your thoughts with AI wellbeing insights.
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
            <span>New Entry</span>
          </button>
        </div>

        {/* A Message for You 💙 Card */}
        <div
          className="ns-card mb-4 p-4 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(88, 28, 135, 0.25) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "16px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
              A Message for You 💙
            </h5>
            <span
              className="badge rounded-pill px-3 py-1"
              style={{
                background: "rgba(139, 92, 246, 0.2)",
                color: "#C084FC",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                fontSize: "0.75rem",
              }}
            >
              Personalized Reflection
            </span>
          </div>

          <div className="text-white fw-semibold mb-1" style={{ fontSize: "0.95rem" }}>
            {getTimeGreeting()}
          </div>

          <p className="text-white-50 mb-0" style={{ fontSize: "0.93rem", lineHeight: "1.55" }}>
            "{generatePersonalizedMessage(journals, latestTrackerMood)}"
          </p>
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

        {/* STEP 5: 📊 Journal Insights Section */}
        {insights && (
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
                <FiPieChart className="text-primary" /> 📊 Journal Insights
              </h4>
              <span className="text-muted small">Updated real-time from your reflections</span>
            </div>

            <div className="row g-3 mb-3">
              {/* Total Entries */}
              <div className="col-6 col-md-3">
                <div
                  className="ns-card p-3 h-100 d-flex flex-column justify-content-between"
                  style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <span className="text-muted small fw-medium">Journal Entries</span>
                  <h3 className="text-white fw-bold fs-2 my-2">{insights.totalEntries}</h3>
                  <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                    Total logged entries
                  </span>
                </div>
              </div>

              {/* Most Frequent Emotion */}
              <div className="col-6 col-md-3">
                <div
                  className="ns-card p-3 h-100 d-flex flex-column justify-content-between"
                  style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <span className="text-muted small fw-medium">Most Frequent Emotion</span>
                  <div className="d-flex align-items-center gap-2 my-2">
                    <span className="fs-3">{getMoodEmoji(insights.mostFrequentEmotion)}</span>
                    <h4 className="text-white fw-bold fs-5 mb-0">{insights.mostFrequentEmotion}</h4>
                  </div>
                  <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                    Based on your entries
                  </span>
                </div>
              </div>

              {/* Most Frequent Sentiment */}
              <div className="col-6 col-md-3">
                <div
                  className="ns-card p-3 h-100 d-flex flex-column justify-content-between"
                  style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <span className="text-muted small fw-medium">Most Frequent Sentiment</span>
                  <div className="my-2">
                    <span
                      className="badge rounded-pill px-3 py-1.5 fw-semibold fs-6"
                      style={{
                        background:
                          insights.mostFrequentSentiment === "Positive"
                            ? "rgba(16, 185, 129, 0.2)"
                            : insights.mostFrequentSentiment === "Negative"
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(148, 163, 184, 0.2)",
                        color:
                          insights.mostFrequentSentiment === "Positive"
                            ? "#34D399"
                            : insights.mostFrequentSentiment === "Negative"
                            ? "#FCA5A5"
                            : "#CBD5E1",
                        border: `1px solid ${
                          insights.mostFrequentSentiment === "Positive"
                            ? "#10B981"
                            : insights.mostFrequentSentiment === "Negative"
                            ? "#EF4444"
                            : "#94A3B8"
                        }`,
                      }}
                    >
                      {insights.mostFrequentSentiment}
                    </span>
                  </div>
                  <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                    Emotional sentiment tone
                  </span>
                </div>
              </div>

              {/* Most Common Theme */}
              <div className="col-6 col-md-3">
                <div
                  className="ns-card p-3 h-100 d-flex flex-column justify-content-between"
                  style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <span className="text-muted small fw-medium">Most Common Theme</span>
                  <h4 className="text-white fw-bold fs-6 my-2 d-flex align-items-center gap-1 text-truncate">
                    <span>📚</span> <span>{insights.mostCommonTheme}</span>
                  </h4>
                  <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                    Top topic discussed
                  </span>
                </div>
              </div>
            </div>

            {/* Pattern & Mood Tracker Banner */}
            <div
              className="p-3 rounded-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FiActivity size={18} className="text-info flex-shrink-0" />
                <div>
                  <span className="text-white-50 small d-block">Recent Pattern:</span>
                  <span className="text-white fw-medium small">{insights.recentPatternMessage}</span>
                </div>
              </div>

              {/* STEP 8: Mood Tracker Connection */}
              {insights.moodTrackerCorrelation && (
                <div
                  className="px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-2 flex-shrink-0"
                  style={{
                    background: insights.moodTrackerCorrelation.hasCorrelation
                      ? "rgba(139, 92, 246, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    fontSize: "0.8rem",
                    color: "#C084FC",
                  }}
                >
                  <span>🔗</span>
                  <span>{insights.moodTrackerCorrelation.correlationMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6 & STEP 7: Weekly Reflection & Recurring Themes Grid */}
        {insights && (
          <div className="row g-4 mb-4">
            {/* STEP 6: ✨ Weekly Reflection Card */}
            <div className="col-12 col-lg-7">
              <div
                className="ns-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.4) 100%)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
                      <FiCpu className="text-purple" style={{ color: "#C084FC" }} /> ✨ Your Weekly Reflection
                    </h4>
                    <span className="badge rounded-pill bg-purple bg-opacity-25 text-purple px-3 py-1 border border-purple border-opacity-25 small">
                      Recent 7 Days
                    </span>
                  </div>

                  {insights.weeklyReflection && insights.weeklyReflection.hasSufficientData ? (
                    <>
                      <p className="text-white-50 mb-3 small">
                        You wrote <strong className="text-white">{insights.weeklyReflection.entryCount} journal entries</strong> this week.
                      </p>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className="p-2.5 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                            <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Most common emotion:</span>
                            <span className="text-white fw-semibold small d-flex align-items-center gap-1 mt-1">
                              {getMoodEmoji(insights.weeklyReflection.mostCommonEmotion)} {insights.weeklyReflection.mostCommonEmotion}
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-2.5 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                            <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Common themes:</span>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {insights.weeklyReflection.commonThemes.map((t, idx) => (
                                <span key={idx} className="badge bg-secondary bg-opacity-25 text-white-50" style={{ fontSize: "0.7rem" }}>
                                  📚 {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Weekly Reflection */}
                      <div
                        className="p-3 rounded-3 mb-3"
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          borderLeft: "3px solid #8B5CF6",
                        }}
                      >
                        <span className="text-purple fw-semibold small d-block mb-1">AI Reflection:</span>
                        <p className="text-white-50 mb-0 small" style={{ lineHeight: "1.5" }}>
                          "{insights.weeklyReflection.reflection}"
                        </p>
                      </div>

                      {/* Recommendation */}
                      <div
                        className="p-3 rounded-3"
                        style={{
                          background: "rgba(245, 158, 11, 0.1)",
                          borderLeft: "3px solid #F59E0B",
                        }}
                      >
                        <span className="text-warning fw-semibold small d-block mb-1">💡 Recommendation:</span>
                        <p className="text-white-50 mb-0 small" style={{ lineHeight: "1.5" }}>
                          "{insights.weeklyReflection.suggestion}"
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-muted mb-2 small">
                        Write more journal entries this week to unlock your AI weekly reflection insights!
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary text-info border-info border-opacity-25 rounded-3"
                        onClick={handleOpenCreateModal}
                      >
                        <FiPlus className="me-1" /> Add Entry Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 7: 📌 Recurring Themes Card */}
            <div className="col-12 col-lg-5">
              <div
                className="ns-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
                      <FiTag className="text-warning" /> 📌 Recurring Themes
                    </h4>
                    <span className="text-muted small">Historical Topics</span>
                  </div>

                  {insights.recurringThemes && insights.recurringThemes.length > 0 ? (
                    <div className="d-flex flex-column gap-2.5">
                      {insights.recurringThemes.slice(0, 5).map((item, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center justify-content-between p-2.5 rounded-3"
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <span className="text-white-50 small fw-medium d-flex align-items-center gap-2">
                            <span className="text-muted">{idx + 1}.</span> {item.theme}
                          </span>
                          <span
                            className="badge rounded-pill px-2.5 py-1"
                            style={{
                              background: "rgba(59, 130, 246, 0.15)",
                              color: "#60A5FA",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.count} {item.count === 1 ? "entry" : "entries"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-muted small mb-0">
                        Themes will automatically appear as you create and analyze journal entries.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Mood Filter Toolbar */}
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
                  placeholder="Search entries by title or content..."
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

            {/* Mood Filters */}
            <div className="col-12 col-md-7 col-lg-8">
              <div className="d-flex align-items-center gap-2 overflow-auto py-1">
                <span className="text-muted small fw-medium d-flex align-items-center me-1 flex-shrink-0">
                  <FiFilter className="me-1" /> Mood:
                </span>

                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-medium flex-shrink-0 transition-all ${
                    selectedMoodFilter === "All"
                      ? "btn-primary text-white"
                      : "btn-outline-secondary text-muted"
                  }`}
                  style={{
                    background:
                      selectedMoodFilter === "All"
                        ? "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                        : "rgba(255, 255, 255, 0.03)",
                    border:
                      selectedMoodFilter === "All"
                        ? "none"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                  onClick={() => setSelectedMoodFilter("All")}
                >
                  All ({journals.length})
                </button>

                {moodOptions.map((m) => {
                  const isSelected = selectedMoodFilter === m.id;
                  const count = journals.filter(
                    (j) => (j.mood || "").toLowerCase() === m.id.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      className="btn btn-sm rounded-pill px-3 py-1 fw-medium flex-shrink-0 transition-all"
                      style={{
                        background: isSelected
                          ? `${m.color}33`
                          : "rgba(255, 255, 255, 0.03)",
                        border: isSelected
                          ? `1px solid ${m.color}`
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        color: isSelected ? "#FFFFFF" : "#94A3B8",
                      }}
                      onClick={() => setSelectedMoodFilter(m.id)}
                    >
                      <span className="me-1">{m.emoji}</span> {m.label}{" "}
                      <span className="opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: Loading, Empty or Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading journals...</span>
            </div>
            <p className="text-muted">Fetching your journal entries...</p>
          </div>
        ) : filteredJournals.length === 0 ? (
          /* Empty State */
          <div className="ns-card text-center py-5 px-4">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <FiBookOpen size={48} style={{ color: "#A78BFA" }} />
            </div>

            {journals.length === 0 ? (
              <>
                <h4 className="text-white fw-bold mb-2">No Journal Entries Yet</h4>
                <p
                  className="text-muted mb-4 mx-auto"
                  style={{ maxWidth: "420px", fontSize: "0.92rem" }}
                >
                  Start documenting your thoughts, emotions, and daily experiences.
                  Click below to create your very first journal entry.
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
                  <FiPlus size={18} /> Create First Entry
                </button>
              </>
            ) : (
              <>
                <h4 className="text-white fw-bold mb-2">No Matching Entries Found</h4>
                <p
                  className="text-muted mb-4 mx-auto"
                  style={{ maxWidth: "420px", fontSize: "0.92rem" }}
                >
                  No journal entries matched your search term or selected mood filter.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-secondary text-white rounded-3 px-4 py-2"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedMoodFilter("All");
                  }}
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          /* Cards Grid */
          <div className="row g-4 mb-4">
            {filteredJournals.map((journal) => {
              const moodColor = getMoodColor(journal.mood);
              const moodEmoji = getMoodEmoji(journal.mood);

              return (
                <div key={journal._id} className="col-12 col-md-6 col-lg-4">
                  <div className="ns-card h-100 d-flex flex-column justify-content-between">
                    <div>
                      {/* Top Meta: Mood Badge & Date */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        {journal.mood ? (
                          <span
                            className="badge rounded-pill px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1"
                            style={{
                              background: `${moodColor}25`,
                              border: `1px solid ${moodColor}50`,
                              color: "#FFFFFF",
                              fontSize: "0.8rem",
                            }}
                          >
                            <span>{moodEmoji}</span>
                            <span>{journal.mood}</span>
                          </span>
                        ) : (
                          <span
                            className="badge rounded-pill px-3 py-1.5 text-muted"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              fontSize: "0.78rem",
                            }}
                          >
                            <FiSmile className="me-1" /> Reflection
                          </span>
                        )}

                        <span
                          className="text-muted d-flex align-items-center gap-1"
                          style={{ fontSize: "0.78rem" }}
                        >
                          <FiCalendar size={13} />
                          {formatDate(journal.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-white fw-bold fs-5 mb-2 text-truncate"
                        title={journal.title}
                      >
                        {journal.title}
                      </h3>

                      {/* Short Content Preview */}
                      <p
                        className="text-muted mb-4"
                        style={{
                          fontSize: "0.88rem",
                          lineHeight: "1.5",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "4rem",
                        }}
                      >
                        {journal.content}
                      </p>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary text-info border-info border-opacity-25 rounded-3 d-inline-flex align-items-center gap-1 px-3 py-1.5"
                        onClick={() => handleOpenViewModal(journal)}
                      >
                        <FiEye size={15} />
                        <span>View</span>
                      </button>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm text-muted hover-white p-1.5 rounded-2"
                          onClick={() => handleOpenEditModal(journal)}
                          title="Edit Entry"
                        >
                          <FiEdit3 size={17} className="text-warning" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm text-muted hover-white p-1.5 rounded-2"
                          onClick={() => handleOpenDeleteModal(journal._id)}
                          title="Delete Entry"
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
      </main>

      {/* Footer */}
      <DashboardFooter />

      {/* ==================== CREATE / EDIT MODAL ==================== */}
      {showEditorModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)" }}
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
                  <FiBookOpen className="text-primary" />
                  {editingJournal ? "Edit Journal Entry" : "Create New Journal Entry"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditorModal(false)}
                />
              </div>

              <form onSubmit={handleSaveJournal}>
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

                  {/* Title Input */}
                  <div className="mb-4">
                    <label className="form-label text-white fw-semibold">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control text-white rounded-3 p-3"
                      placeholder="Give your journal entry a meaningful title..."
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

                  {/* Optional Mood Selection */}
                  <div className="mb-4">
                    <label className="form-label text-white fw-semibold mb-2">
                      Associated Mood <span className="text-muted font-normal">(Optional)</span>
                    </label>
                    <div className="row g-2">
                      {moodOptions.map((m) => {
                        const isSelected = formMood === m.id;
                        return (
                          <div key={m.id} className="col-4 col-sm-3 col-md-3">
                            <button
                              type="button"
                              className="btn w-100 py-2 px-2 rounded-3 d-flex align-items-center justify-content-center gap-2 transition-all"
                              style={{
                                background: isSelected
                                  ? `${m.color}33`
                                  : "rgba(255, 255, 255, 0.03)",
                                border: isSelected
                                  ? `2px solid ${m.color}`
                                  : "1px solid rgba(255, 255, 255, 0.08)",
                                color: isSelected ? "#FFFFFF" : "#94A3B8",
                                fontSize: "0.85rem",
                              }}
                              onClick={() => {
                                setFormMood(isSelected ? "" : m.id);
                                if (formError) setFormError("");
                              }}
                            >
                              <span>{m.emoji}</span>
                              <span className="text-truncate">{m.label}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div className="mb-3">
                    <label className="form-label text-white fw-semibold">
                      Journal Content <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control text-white rounded-3 p-3"
                      rows="7"
                      placeholder="Write down your thoughts, reflections, feelings, or experiences..."
                      value={formContent}
                      onChange={(e) => {
                        setFormContent(e.target.value);
                        if (formError) setFormError("");
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        resize: "vertical",
                        minHeight: "150px",
                      }}
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-3 px-4"
                    onClick={() => setShowEditorModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn px-4 rounded-3 text-white fw-bold d-flex align-items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      border: "none",
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={18} />
                        {editingJournal ? "Save Changes" : "Save Journal Entry"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW MODAL (ENHANCED WITH ✨ AI JOURNAL ANALYSIS) ==================== */}
      {showViewModal && viewingJournal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)" }}
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
                <div className="d-flex align-items-center gap-3">
                  {viewingJournal.mood && (
                    <span className="fs-3">{getMoodEmoji(viewingJournal.mood)}</span>
                  )}
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0">
                      {viewingJournal.title}
                    </h5>
                    <span
                      className="text-muted d-flex align-items-center gap-1 mt-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <FiCalendar /> {formatDate(viewingJournal.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                />
              </div>

              {/* Body */}
              <div className="modal-body px-4 py-4" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                {viewingJournal.mood && (
                  <div className="mb-3">
                    <span
                      className="badge rounded-pill px-3 py-1.5 fw-medium"
                      style={{
                        background: `${getMoodColor(viewingJournal.mood)}25`,
                        border: `1px solid ${getMoodColor(viewingJournal.mood)}50`,
                        color: "#FFFFFF",
                      }}
                    >
                      Mood: {viewingJournal.mood}
                    </span>
                  </div>
                )}

                {/* Journal Raw Content Box */}
                <div
                  className="p-3.5 rounded-3 mb-4"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.7",
                    fontSize: "0.95rem",
                    color: "#E2E8F0",
                  }}
                >
                  {viewingJournal.content}
                </div>

                {/* STEP 2: ✨ AI Journal Analysis Section */}
                <div
                  className="p-4 rounded-4 position-relative overflow-hidden mb-2"
                  style={{
                    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(88, 28, 135, 0.25) 100%)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
                      ✨ AI Journal Analysis
                    </h5>

                    {currentAnalysis && !isAnalyzing && (
                      <button
                        type="button"
                        className="btn btn-sm text-purple rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                        style={{
                          background: "rgba(168, 85, 247, 0.15)",
                          border: "1px solid rgba(168, 85, 247, 0.3)",
                          fontSize: "0.78rem",
                          color: "#C084FC",
                        }}
                        onClick={() => handleAnalyzeEntry(true)}
                      >
                        <FiRefreshCw size={13} /> Re-analyze
                      </button>
                    )}
                  </div>

                  {analysisError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 border-0" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#FCA5A5" }}>
                      {analysisError}
                    </div>
                  )}

                  {loadingAnalysis ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-purple mb-2" role="status"></div>
                      <p className="text-muted small mb-0">Checking stored AI analysis...</p>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-purple mb-2" role="status"></div>
                      <p className="text-white fw-semibold small mb-1">Analyzing with AI...</p>
                      <span className="text-muted style-italic" style={{ fontSize: "0.78rem" }}>
                        Evaluating emotional sentiment & key themes safely
                      </span>
                    </div>
                  ) : currentAnalysis ? (
                    <div className="d-flex flex-column gap-3">
                      {/* Emotion & Sentiment row */}
                      <div className="row g-3">
                        <div className="col-6">
                          <span className="text-muted d-block small mb-1">Detected Emotion:</span>
                          <span className="text-white fw-bold fs-6 d-inline-flex align-items-center gap-1.5">
                            {getMoodEmoji(currentAnalysis.emotion)} {currentAnalysis.emotion}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="text-muted d-block small mb-1">Sentiment:</span>
                          <span
                            className="badge rounded-pill px-3 py-1.5 fw-semibold"
                            style={{
                              background:
                                currentAnalysis.sentiment === "Positive"
                                  ? "rgba(16, 185, 129, 0.2)"
                                  : currentAnalysis.sentiment === "Negative"
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "rgba(148, 163, 184, 0.2)",
                              color:
                                currentAnalysis.sentiment === "Positive"
                                  ? "#34D399"
                                  : currentAnalysis.sentiment === "Negative"
                                  ? "#FCA5A5"
                                  : "#CBD5E1",
                              border: `1px solid ${
                                currentAnalysis.sentiment === "Positive"
                                  ? "#10B981"
                                  : currentAnalysis.sentiment === "Negative"
                                  ? "#EF4444"
                                  : "#94A3B8"
                              }`,
                            }}
                          >
                            {currentAnalysis.sentiment}
                          </span>
                        </div>
                      </div>

                      {/* Key Themes */}
                      <div>
                        <span className="text-muted d-block small mb-1">Key Themes:</span>
                        <div className="d-flex flex-wrap gap-2">
                          {currentAnalysis.themes && currentAnalysis.themes.length > 0 ? (
                            currentAnalysis.themes.map((theme, idx) => (
                              <span
                                key={idx}
                                className="badge rounded-pill px-3 py-1 font-normal"
                                style={{
                                  background: "rgba(255, 255, 255, 0.05)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                  color: "#E2E8F0",
                                  fontSize: "0.8rem",
                                }}
                              >
                                • {theme}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small">• General reflection</span>
                          )}
                        </div>
                      </div>

                      {/* AI Reflection */}
                      <div className="p-3 rounded-3" style={{ background: "rgba(0, 0, 0, 0.2)", borderLeft: "3px solid #A855F7" }}>
                        <span className="text-purple fw-semibold small d-block mb-1" style={{ color: "#C084FC" }}>AI Reflection:</span>
                        <p className="text-white-50 mb-0 small" style={{ lineHeight: "1.6" }}>
                          "{currentAnalysis.reflection}"
                        </p>
                      </div>

                      {/* Suggested Action */}
                      <div className="p-3 rounded-3" style={{ background: "rgba(0, 0, 0, 0.2)", borderLeft: "3px solid #F59E0B" }}>
                        <span className="text-warning fw-semibold small d-block mb-1">💡 Suggested Action:</span>
                        <p className="text-white-50 mb-0 small" style={{ lineHeight: "1.6" }}>
                          "{currentAnalysis.suggestion}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Button to trigger initial AI Analysis */
                    <div className="text-center py-3">
                      <p className="text-muted small mb-3">
                        Gain AI wellbeing reflection, emotion analysis, and personalized suggestions for this entry.
                      </p>
                      <button
                        type="button"
                        className="btn px-4 py-2 rounded-3 text-white fw-bold d-inline-flex align-items-center gap-2 shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                          border: "none",
                        }}
                        onClick={() => handleAnalyzeEntry(false)}
                      >
                        <FiCpu size={18} />
                        <span>Analyze with AI</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-3 d-flex align-items-center gap-1"
                  onClick={() => handleOpenDeleteModal(viewingJournal._id)}
                >
                  <FiTrash2 size={16} /> Delete
                </button>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-warning text-warning rounded-3 d-flex align-items-center gap-1"
                    onClick={() => handleOpenEditModal(viewingJournal)}
                  >
                    <FiEdit3 size={16} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary rounded-3 px-4"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(6px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 border-0 shadow-lg overflow-hidden"
              style={{
                background: "#0F172A",
                border: "1px solid rgba(239, 68, 68, 0.3)",
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
                <h5 className="fw-bold text-white mb-2">Delete Journal Entry?</h5>
                <p className="text-muted small mb-4">
                  Are you sure you want to delete this journal entry? This action cannot be undone.
                </p>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-3 px-4"
                    onClick={() => setShowDeleteModal(false)}
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
                    {isSubmitting ? "Deleting..." : "Yes, Delete"}
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
