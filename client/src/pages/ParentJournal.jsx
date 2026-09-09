import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiBookOpen,
  FiPlus,
  FiSave,
  FiCalendar,
  FiLock,
  FiSmile,
  FiHeart
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentJournal() {
  const [activeTab, setActiveTab] = useState("journal");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");

  const [noteContent, setNoteContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("Observation");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [journalEntries, setJournalEntries] = useState([
    {
      id: 1,
      content: "Ananya seemed very relaxed after her study session today and expressed interest in science project.",
      tag: "Positive",
      date: "Today at 05:15 PM",
    },
    {
      id: 2,
      content: "Noticed slight fatigue in the evening. Recommended an earlier bedtime.",
      tag: "Observation",
      date: "Yesterday at 08:30 PM",
    },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSaving(true);
    setTimeout(() => {
      const newEntry = {
        id: Date.now(),
        content: noteContent.trim(),
        tag: selectedTag,
        date: "Just now",
      };
      setJournalEntries([newEntry, ...journalEntries]);
      setNoteContent("");
      setIsSaving(false);
      setSuccessMsg("Observation saved to Parent Journal!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 600);
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={parentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header */}
        <div className="mb-4">
          <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
            📖 Parent Journal
          </span>
          <h1 className="fw-bold text-white fs-3 mb-1">Parent Observations Journal</h1>
          <p className="text-secondary small mb-0">Record private notes, behavioral observations, and family wellness milestones.</p>
        </div>

        {/* Entry Form Card */}
        <div
          className="p-4 rounded-4 text-white shadow-sm mb-4"
          style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
              <FiBookOpen className="text-primary" /> Record New Observation
            </h5>
            <span className="badge bg-dark text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1 text-xs d-flex align-items-center gap-1">
              <FiLock size={12} /> Private to Parent
            </span>
          </div>

          {successMsg && (
            <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 mb-3 small">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAddEntry}>
            <textarea
              className="form-control bg-dark text-white border-secondary border-opacity-25 rounded-3 mb-3 p-3"
              rows="3"
              placeholder="e.g. Ananya seemed tired after school today. We talked about resting before homework..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
            />

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-semibold">Category Tag:</span>
                <select
                  className="form-select bg-dark text-white border-secondary border-opacity-25 rounded-pill py-1 px-3 text-xs"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <option value="Observation">Observation</option>
                  <option value="Positive">Positive Milestone</option>
                  <option value="Concern">Concern / Follow-up</option>
                  <option value="Routine">Routine Note</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 py-2 text-sm d-flex align-items-center gap-2"
                disabled={isSaving || !noteContent.trim()}
              >
                <FiSave /> {isSaving ? "Saving Note..." : "Save Observation"}
              </button>
            </div>
          </form>
        </div>

        {/* Observations List */}
        <div
          className="p-4 rounded-4 text-white shadow-sm mb-4"
          style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <h5 className="fw-bold mb-4 text-white">Recent Journal Entries</h5>

          <div className="d-flex flex-column gap-3">
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25"
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge rounded-pill bg-indigo-500 bg-opacity-30 text-indigo-200 border border-indigo-400 border-opacity-30 px-2.5 py-1 text-xs">
                    {entry.tag}
                  </span>
                  <span className="text-secondary extra-small">{entry.date}</span>
                </div>
                <p className="text-indigo-100 mb-0 small" style={{ lineHeight: "1.6" }}>
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentJournal;
