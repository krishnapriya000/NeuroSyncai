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
  FiClock,
  FiSmile,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiSave,
  FiAlertTriangle,
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

function StudentJournal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("journal");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Data state
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("All");

  // Modal states
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null); // null if creating, journal obj if editing

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJournal, setViewingJournal] = useState(null);

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

  // Open modal for View Entry
  const handleOpenViewModal = (journal) => {
    setViewingJournal(journal);
    setShowViewModal(true);
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
                <FiBookOpen className="me-1" /> Student Reflection Module
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">My Journal</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Write, reflect, and understand your thoughts.
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
                            <FiSmile me={1} /> Reflection
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

      {/* ==================== VIEW MODAL ==================== */}
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

                <div
                  className="p-3 rounded-3"
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
