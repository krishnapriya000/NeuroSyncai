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
            📖 Parent Journal Notebook
          </span>
          <h1 className="fw-bold text-white fs-3 mb-1">Parent Observations Journal 📖</h1>
          <p className="text-secondary small mb-0">Record private notes, behavioral observations, and family wellness milestones.</p>
        </div>

        {/* Motive Sticky Board */}
        <div className="mb-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="ns-sticky-note-card ns-sticky-yellow" style={{ transform: "rotate(-1.5deg)" }}>
                <div className="ns-push-pin" />
                <h6 className="fw-bold mb-1 journal-handwriting fs-4">💡 Parenting Anchor</h6>
                <p className="journal-handwriting fs-5 mb-0">“Your presence, patience, and gentle listening create an anchor of security for your children.”</p>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="ns-sticky-note-card ns-sticky-cyan" style={{ transform: "rotate(1.5deg)" }}>
                <div className="ns-sticky-tape" />
                <h6 className="fw-bold mb-1 journal-handwriting fs-4">📌 Observation Goal</h6>
                <p className="journal-handwriting fs-5 mb-0">“Note small victories and emotional breakthroughs to foster lifelong trust.”</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Form Card - Styled like a Diary Notebook Page */}
        <div className="ns-diary-book mb-4">
          <div className="ns-diary-margin-line" />
          <div className="ns-diary-bookmark" />

          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2 journal-handwriting fs-2">
              ✍️ Parent Private Observation
            </h5>
            <span className="badge bg-dark text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1 text-xs d-flex align-items-center gap-1">
              <FiLock size={12} /> Private & Encrypted
            </span>
          </div>

          {successMsg && (
            <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 mb-3 small">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAddEntry}>
            <textarea
              className="form-control ns-diary-textarea mb-3"
              rows="4"
              placeholder="Record your daily observation, feelings, or notes about your child's wellbeing..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
            />

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top border-white border-opacity-10">
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-semibold">Tag:</span>
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
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", border: "none" }}
                disabled={isSaving || !noteContent.trim()}
              >
                <FiSave /> {isSaving ? "Saving Note..." : "Save Diary Observation"}
              </button>
            </div>
          </form>
        </div>

        {/* Observations List as Post-it Sticky Notes */}
        <div className="mb-4">
          <h5 className="fw-bold mb-4 text-white">Recent Journal Sticky Notes</h5>

          <div className="row g-3">
            {journalEntries.map((entry, idx) => {
              const stickyColors = ["ns-sticky-pink", "ns-sticky-mint", "ns-sticky-lavender", "ns-sticky-orange"];
              const colorClass = stickyColors[idx % stickyColors.length];
              const rot = idx % 2 === 0 ? "-1.5deg" : "1.8deg";
              return (
                <div key={entry.id} className="col-12 col-md-6">
                  <div className={`ns-sticky-note-card ${colorClass}`} style={{ transform: `rotate(${rot})` }}>
                    <div className="ns-push-pin" />
                    <div className="d-flex align-items-center justify-content-between mb-2 mt-2">
                      <span className="badge rounded-pill bg-dark bg-opacity-20 text-dark extra-small fw-bold">
                        {entry.tag}
                      </span>
                      <span className="extra-small opacity-75 fw-semibold">{entry.date}</span>
                    </div>
                    <p className="journal-handwriting fs-4 mb-0" style={{ lineHeight: "1.4" }}>
                      {entry.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentJournal;
