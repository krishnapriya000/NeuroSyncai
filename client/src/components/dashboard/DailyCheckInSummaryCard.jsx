import React from "react";
import { Link } from "react-router-dom";
import { 
  FiSmile, 
  FiMoon, 
  FiZap, 
  FiTarget, 
  FiCalendar, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiPlusCircle 
} from "react-icons/fi";

function DailyCheckInSummaryCard({ loading, error, data, onRetry }) {
  // 1. Loading State
  if (loading) {
    return (
      <div 
        className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          background: "#0F172A",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <div className="d-flex align-items-center justify-content-center py-4 gap-3 text-secondary">
          <div className="spinner-border text-primary spinner-border-sm" role="status" />
          <span className="fw-medium">Fetching today's check-in data...</span>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div 
        className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          background: "#0F172A",
          border: "1px solid rgba(239, 68, 68, 0.2)"
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 text-danger">
            <span>⚠️</span>
            <span className="fw-medium">{error}</span>
          </div>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
            >
              <FiRefreshCw size={14} /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Empty State (No check-in found for today)
  if (!data || !data.hasData) {
    return (
      <div 
        className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)"
        }}
      >
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-warning bg-opacity-20 text-warning px-2.5 py-1 rounded-pill border border-warning border-opacity-30">
                Notice
              </span>
              <h5 className="fw-bold mb-0 text-white fs-6">Daily Wellness Survey</h5>
            </div>
            <p className="text-secondary small mb-0">
              No check-in found for today. Complete your 1-minute daily check-in to track your mood, sleep, and focus goals.
            </p>
          </div>

          <Link 
            to="/student/checkin" 
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap shadow-sm"
          >
            <FiPlusCircle /> Complete Check-in
          </Link>
        </div>
      </div>
    );
  }

  // Format Date (e.g. "July 29, 2026" or "2026-07-29")
  const formatDate = (dateStr, createdAtStr) => {
    try {
      const d = new Date(createdAtStr || dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      }
    } catch (e) {}
    return dateStr || "Today";
  };

  const formattedDate = formatDate(data.date, data.createdAt);

  return (
    <div 
      className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center text-primary"
            style={{ width: "36px", height: "36px", background: "rgba(59, 130, 246, 0.15)" }}
          >
            <FiCheckCircle size={20} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-white fs-6">Today's Daily Check-in Data</h5>
            <span className="text-secondary" style={{ fontSize: "0.78rem" }}>
              Latest response recorded for your account
            </span>
          </div>
        </div>

        <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 px-3 py-1.5 rounded-pill small">
          Active Today
        </span>
      </div>

      {/* 5 Required Metrics Grid */}
      <div className="row g-3">
        {/* 1. 😊 Today's Mood */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center gap-2 text-warning mb-2">
              <FiSmile size={18} />
              <span className="small text-secondary fw-semibold">Today's Mood</span>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              😊 {data.mood || "Happy"}
            </div>
            {data.stressLevel !== undefined && (
              <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
                Stress Level: <strong>{data.stressLevel}/10</strong>
              </span>
            )}
          </div>
        </div>

        {/* 2. 😴 Sleep Hours */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center gap-2 text-info mb-2">
              <FiMoon size={18} />
              <span className="small text-secondary fw-semibold">Sleep Hours</span>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              😴 {data.sleepHours || "6-8 hours"}
            </div>
            <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
              Rested State
            </span>
          </div>
        </div>

        {/* 3. ⚡ Energy Level */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center gap-2 text-success mb-2">
              <FiZap size={18} />
              <span className="small text-secondary fw-semibold">Energy Level</span>
            </div>
            <div className="fs-5 fw-bold text-white mb-1">
              ⚡ {data.energyLevel || "High"}
            </div>
            {data.motivationLevel !== undefined && (
              <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
                Motivation: <strong>{data.motivationLevel}/10</strong>
              </span>
            )}
          </div>
        </div>

        {/* 4. 🎯 Today's Goal */}
        <div className="col-12 col-sm-6 col-lg-6 col-xl-2.4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center gap-2 text-primary mb-2">
              <FiTarget size={18} />
              <span className="small text-secondary fw-semibold">Today's Goal</span>
            </div>
            <div className="fs-6 fw-bold text-white mb-1 text-truncate" title={data.goal}>
              🎯 {data.goal || "Complete Assignments"}
            </div>
            <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
              Primary Target
            </span>
          </div>
        </div>

        {/* 5. 📅 Last Check-in Date */}
        <div className="col-12 col-sm-6 col-lg-6 col-xl-2.4">
          <div 
            className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="d-flex align-items-center gap-2 text-indigo-400 mb-2">
              <FiCalendar size={18} />
              <span className="small text-secondary fw-semibold">Last Check-in</span>
            </div>
            <div className="fs-6 fw-bold text-white mb-1">
              📅 {formattedDate}
            </div>
            <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
              Date Recorded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyCheckInSummaryCard;
