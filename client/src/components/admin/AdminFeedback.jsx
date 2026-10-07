import { useState } from "react";
import { FiMessageSquare, FiSearch, FiCheckCircle, FiTrash2, FiClock, FiStar, FiPieChart, FiBarChart2 } from "react-icons/fi";

function AdminFeedback({ theme = "light" }) {
  const [searchTerm, setSearchTerm] = useState("");

  const isLight = theme === "light";

  const cardStyle = {
    background: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.75)",
    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: isLight ? "0 2px 12px rgba(0, 0, 0, 0.03)" : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
    borderRadius: "16px"
  };

  const titleColor = isLight ? "#111827" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

  // Sample production-grade user feedback data
  const [feedbackList, setFeedbackList] = useState([
    {
      id: "fb-1",
      user: "Milu Jiji",
      email: "milujiji2027@mca.ajce.in",
      role: "Student",
      category: "Daily Check-in Survey",
      rating: 5,
      comment: "The daily check-in survey and wellness score analysis really help me track my daily mood and stay focused during exam season!",
      status: "Pending",
      date: "2026-08-01",
    },
    {
      id: "fb-2",
      user: "Sarah Connor",
      email: "sarah.connor@gmail.com",
      role: "Parent",
      category: "Parent Portal",
      rating: 4,
      comment: "Love how I can keep track of my daughter's study streak and wellness summary. It gives me great peace of mind.",
      status: "Resolved",
      date: "2026-07-31",
    },
    {
      id: "fb-3",
      user: "David Miller",
      email: "david.miller@techcorp.com",
      role: "Working Professional",
      category: "Focus Timer & AI Companion",
      rating: 5,
      comment: "The deep work focus blocks and AI companion chat are excellent for managing workplace stress and preventing burnout.",
      status: "Pending",
      date: "2026-07-30",
    },
    {
      id: "fb-4",
      user: "Robert Taylor",
      email: "robert.taylor@seniorhealth.org",
      role: "Senior Citizen",
      category: "Cognitive Exercises",
      rating: 5,
      comment: "Very easy to navigate layout. The clean dark mode makes reading notifications and daily reminders comfortable for my eyes.",
      status: "Resolved",
      date: "2026-07-29",
    },
  ]);

  const filteredFeedbacks = feedbackList.filter((fb) => {
    const q = searchTerm.toLowerCase();
    return (
      fb.user.toLowerCase().includes(q) ||
      fb.email.toLowerCase().includes(q) ||
      fb.comment.toLowerCase().includes(q) ||
      fb.category.toLowerCase().includes(q)
    );
  });

  const toggleResolve = (id) => {
    setFeedbackList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === "Resolved" ? "Pending" : "Resolved" } : item
      )
    );
  };

  const deleteFeedback = (id) => {
    if (window.confirm("Are you sure you want to delete this feedback record?")) {
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Feedback Analytics Data
  const ratingDistribution = [
    { label: "5 Stars (Excellent)", pct: 68, color: "#10B981" },
    { label: "4 Stars (Good)", pct: 22, color: "#7C5CFC" },
    { label: "3 Stars (Average)", pct: 7, color: "#F59E0B" },
    { label: "1-2 Stars (Issues)", pct: 3, color: "#EF4444" },
  ];

  const categoryActivity = [
    { category: "Daily Survey", count: 48, pct: 90 },
    { category: "Parent Portal", count: 32, pct: 65 },
    { category: "Focus Timer", count: 26, pct: 52 },
    { category: "Senior Care", count: 18, pct: 38 },
  ];

  return (
    <div className="admin-feedback-section" style={{ maxWidth: "1500px", margin: "0 auto" }}>

      {/* VISUAL CHARTS ROW: RATING PIE/DONUT CHART + CATEGORY BAR CHART */}
      <div className="row g-4 mb-4">
        {/* 1. RATING PIE/DONUT CHART */}
        <div className="col-12 col-lg-5">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "0.95rem" }}>
                <FiPieChart style={{ color: "#F59E0B" }} /> Satisfaction Rating Breakdown
              </h6>
              <span className="extra-small fw-semibold" style={{ color: subtextColor }}>Overall 4.8 / 5.0</span>
            </div>

            <div className="d-flex flex-column align-items-center justify-content-center py-2">
              <div className="position-relative d-flex align-items-center justify-content-center mb-3">
                <svg width="150" height="150" viewBox="0 0 42 42" className="donut-svg">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)"} strokeWidth="4.5" />
                  {/* Segment 1: 5 Stars 68% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray="68 32"
                    strokeDashoffset="25"
                  />
                  {/* Segment 2: 4 Stars 22% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#7C5CFC"
                    strokeWidth="4.5"
                    strokeDasharray="22 78"
                    strokeDashoffset="-43"
                  />
                  {/* Segment 3: 3 Stars 7% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    strokeDasharray="7 93"
                    strokeDashoffset="-65"
                  />
                </svg>
                <div className="position-absolute text-center">
                  <span className="fw-bold d-block lh-1" style={{ color: titleColor, fontSize: "1.25rem" }}>4.8 ★</span>
                  <span className="extra-small" style={{ color: subtextColor, fontSize: "0.68rem" }}>Avg Score</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="w-100 d-flex flex-column gap-2">
                {ratingDistribution.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.05)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: item.color }} />
                      <span className="small fw-semibold" style={{ color: titleColor, fontSize: "0.82rem" }}>{item.label}</span>
                    </div>
                    <span className="extra-small fw-bold" style={{ color: titleColor }}>{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. CATEGORY ACTIVITY BAR CHART */}
        <div className="col-12 col-lg-7">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "0.95rem" }}>
                <FiBarChart2 style={{ color: "#7C5CFC" }} /> Feedback Volume by Category
              </h6>
              <span className="extra-small fw-semibold" style={{ color: subtextColor }}>Total Submissions</span>
            </div>

            <div className="d-flex flex-column gap-3 py-2">
              {categoryActivity.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold" style={{ color: titleColor, fontSize: "0.85rem" }}>{item.category}</span>
                    <span className="extra-small fw-bold" style={{ color: subtextColor }}>{item.count} Submissions ({item.pct}%)</span>
                  </div>
                  <div className="progress" style={{ height: "10px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${item.pct}%`, 
                        background: idx === 0 ? "linear-gradient(90deg, #7C5CFC, #4F8CFF)" : idx === 1 ? "linear-gradient(90deg, #06B6D4, #0891B2)" : idx === 2 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #F59E0B, #D97706)",
                        transition: "width 0.6s ease" 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Items Grid Card */}
      <div className="p-4 rounded-4" style={cardStyle}>
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3 border-bottom pb-3" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
            <FiMessageSquare style={{ color: "#7C5CFC" }} /> Customer Feedback Activity Log
          </h6>

          <div className="d-flex align-items-center gap-3">
            <span className="extra-small fw-semibold d-none d-md-inline" style={{ color: subtextColor }}>
              Showing {filteredFeedbacks.length} Entries
            </span>
            <div className="input-group input-group-sm shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: "260px", borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)" }}>
              <span className="input-group-text border-0 ps-3" style={{ background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: subtextColor }}>
                <FiSearch size={14} />
              </span>
              <input 
                type="text"
                className="form-control border-0 pe-3"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.83rem", background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: titleColor }}
              />
            </div>
          </div>
        </div>

        <div className="row g-3">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((fb) => (
              <div key={fb.id} className="col-12 col-md-6">
                <div 
                  className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between border transition-all"
                  style={{
                    background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.04)",
                    borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div>
                    {/* Top Header: User Info & Status */}
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm" 
                          style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #7C5CFC, #4F8CFF)", fontSize: "0.9rem" }}
                        >
                          {fb.user.charAt(0)}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0" style={{ color: titleColor, fontSize: "0.92rem" }}>{fb.user}</h6>
                          <span className="extra-small" style={{ color: subtextColor, fontSize: "0.75rem" }}>{fb.email} • <strong style={{ color: "#7C5CFC" }}>{fb.role}</strong></span>
                        </div>
                      </div>

                      <span 
                        className="px-2.5 py-1 rounded-pill extra-small fw-bold"
                        style={{
                          background: fb.status === "Resolved" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: fb.status === "Resolved" ? "#047857" : "#B45309",
                        }}
                      >
                        {fb.status === "Resolved" ? "✅ Resolved" : "⏳ Pending"}
                      </span>
                    </div>

                    {/* Rating & Category */}
                    <div className="d-flex align-items-center gap-2 my-2">
                      <div className="d-flex text-warning">
                        {[...Array(fb.rating)].map((_, i) => (
                          <FiStar key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                      <span className="px-2 py-0.5 rounded extra-small fw-bold border" style={{ background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: subtextColor, borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.12)", fontSize: "0.73rem" }}>
                        {fb.category}
                      </span>
                    </div>

                    {/* Comment Text */}
                    <p className="small mb-3" style={{ color: titleColor, lineHeight: "1.5", fontSize: "0.86rem" }}>
                      "{fb.comment}"
                    </p>
                  </div>

                  {/* Footer Controls */}
                  <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-2" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                    <span className="extra-small d-flex align-items-center gap-1" style={{ color: subtextColor, fontSize: "0.76rem" }}>
                      <FiClock size={12} /> Received: {fb.date}
                    </span>

                    <div className="d-flex gap-1.5">
                      <button
                        onClick={() => toggleResolve(fb.id)}
                        className={`btn btn-sm px-3 rounded-pill extra-small fw-semibold d-inline-flex align-items-center gap-1 border-0`}
                        style={{
                          background: fb.status === "Resolved" ? (isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)") : "rgba(16, 185, 129, 0.15)",
                          color: fb.status === "Resolved" ? (isLight ? "#475569" : "#94A3B8") : "#047857",
                          fontSize: "0.75rem"
                        }}
                      >
                        <FiCheckCircle size={12} /> {fb.status === "Resolved" ? "Mark Pending" : "Mark Resolved"}
                      </button>

                      <button
                        onClick={() => deleteFeedback(fb.id)}
                        className="btn btn-sm p-1.5 rounded-circle border-0 text-danger"
                        style={{ background: "rgba(239, 68, 68, 0.12)" }}
                        title="Delete Feedback"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 extra-small" style={{ color: subtextColor }}>
              No feedback entries found matching your search term.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;
