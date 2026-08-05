import React, { useState } from "react";
import { FiMessageSquare, FiSearch, FiCheckCircle, FiTrash2, FiClock, FiStar, FiUser } from "react-icons/fi";

function AdminFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  
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

  return (
    <div className="admin-feedback-section">
      {/* Header & Search */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiMessageSquare className="text-info" /> User Feedback Management ({filteredFeedbacks.length})
          </h4>
          <p className="text-secondary small mb-0">
            Review user ratings, category feedback, mark items as resolved, and track user satisfaction
          </p>
        </div>

        {/* Search Bar */}
        <div className="input-group input-group-sm" style={{ width: "260px" }}>
          <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
            <FiSearch />
          </span>
          <input 
            type="text"
            className="form-control bg-dark text-white border-secondary border-opacity-25"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Feedback Items Grid */}
      <div className="row g-3">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((fb) => (
            <div key={fb.id} className="col-12 col-md-6">
              <div 
                className="p-4 rounded-4 text-white h-100 d-flex flex-column justify-content-between"
                style={{
                  background: "rgba(15, 23, 42, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div>
                  {/* Top Header: User Info & Status */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary bg-opacity-20 text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                        {fb.user.charAt(0)}
                      </div>
                      <div>
                        <h6 className="fw-bold text-white mb-0">{fb.user}</h6>
                        <span className="text-secondary extra-small">{fb.email} • <strong className="text-info">{fb.role}</strong></span>
                      </div>
                    </div>

                    <span className={`badge ${fb.status === "Resolved" ? "bg-success" : "bg-warning"} bg-opacity-20 ${fb.status === "Resolved" ? "text-success" : "text-warning"} px-3 py-1 rounded-pill small`}>
                      {fb.status === "Resolved" ? "✅ Resolved" : "⏳ Pending"}
                    </span>
                  </div>

                  {/* Rating & Category */}
                  <div className="d-flex align-items-center gap-2 my-2">
                    <div className="d-flex text-warning">
                      {[...Array(fb.rating)].map((_, i) => (
                        <FiStar key={i} size={14} fill="#f59e0b" />
                      ))}
                    </div>
                    <span className="badge bg-secondary bg-opacity-20 text-white extra-small">
                      {fb.category}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-white-80 small mb-3" style={{ lineHeight: "1.5" }}>
                    "{fb.comment}"
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="d-flex align-items-center justify-content-between border-top border-secondary border-opacity-25 pt-3 mt-2">
                  <span className="text-secondary extra-small d-flex align-items-center gap-1">
                    <FiClock size={12} /> Received: {fb.date}
                  </span>

                  <div className="d-flex gap-1.5">
                    <button
                      onClick={() => toggleResolve(fb.id)}
                      className={`btn ${fb.status === "Resolved" ? "btn-outline-secondary" : "btn-outline-success"} btn-sm px-3 rounded-pill extra-small d-inline-flex align-items-center gap-1`}
                    >
                      <FiCheckCircle size={12} /> {fb.status === "Resolved" ? "Mark Pending" : "Mark Resolved"}
                    </button>

                    <button
                      onClick={() => deleteFeedback(fb.id)}
                      className="btn btn-outline-danger btn-sm px-2.5 rounded-pill extra-small"
                      title="Delete Feedback"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center text-secondary py-5">
            No feedback entries found matching your search term.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFeedback;
