import React, { useState, useEffect, useCallback } from "react";
import { 
  FiUsers, 
  FiCheckCircle, 
  FiHeart, 
  FiAlertTriangle, 
  FiTrendingDown,
  FiSmile,
  FiActivity,
  FiTrendingUp,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiMail,
  FiZap,
  FiShield
} from "react-icons/fi";

function AdminWellnessAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchWellnessAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setError("Authentication token missing. Please log in as Admin.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/wellness-analytics", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to load wellness analytics.");
        setLoading(false);
        return;
      }

      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Fetch wellness analytics error:", err);
      setError("Cannot connect to server to fetch wellness analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWellnessAnalytics();
  }, [fetchWellnessAnalytics]);

  if (loading) {
    return (
      <div className="p-5 text-center text-white my-4 rounded-4" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
        <h5 className="fw-bold">Loading Student Wellness Analytics...</h5>
        <p className="text-secondary small">Fetching real-time survey responses from MongoDB</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-4 text-white mb-4" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 text-danger">
            <FiAlertTriangle size={24} />
            <span className="fw-semibold">{error}</span>
          </div>
          <button onClick={fetchWellnessAnalytics} className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    totalStudents = 0,
    todaysCheckIns = 0,
    avgWellnessScore = 0,
    highStressStudents = 0,
    lowWellnessStudents = 0,
    moodDistribution = {},
    stressDistribution = {},
    scoreDistribution = {},
    dailyTrend = [],
    studentsNeedingAttention = [],
    studentWellnessList = [],
  } = analytics || {};

  // Filter student wellness list
  const filteredList = studentWellnessList.filter((item) => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Excellent":
        return <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 px-3 py-1 rounded-pill">🟢 Excellent</span>;
      case "Good":
        return <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 px-3 py-1 rounded-pill">🟡 Good</span>;
      case "Moderate":
        return <span className="badge bg-orange bg-opacity-20 text-warning border border-warning border-opacity-30 px-3 py-1 rounded-pill" style={{ color: "#f97316" }}>🟠 Moderate</span>;
      case "Needs Attention":
        return <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30 px-3 py-1 rounded-pill">🔴 Needs Attention</span>;
      default:
        return <span className="badge bg-secondary px-3 py-1 rounded-pill">{status}</span>;
    }
  };

  const getMoodEmoji = (mood) => {
    const m = String(mood).toLowerCase();
    if (m.includes("very happy")) return "😊 Very Happy";
    if (m.includes("happy")) return "🙂 Happy";
    if (m.includes("neutral")) return "😐 Neutral";
    if (m.includes("stressed")) return "😟 Stressed";
    if (m.includes("sad")) return "😢 Sad";
    return `😐 ${mood}`;
  };

  // Max count for chart scaling
  const maxTrendCount = Math.max(...dailyTrend.map(d => d.count), 1);
  const maxMoodCount = Math.max(...Object.values(moodDistribution), 1);
  const maxStressCount = Math.max(...Object.values(stressDistribution), 1);
  const maxScoreCount = Math.max(...Object.values(scoreDistribution), 1);

  return (
    <div className="wellness-analytics-section">
      {/* Header & Refresh */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiHeart className="text-danger" /> Admin Wellness Analytics Dashboard
          </h4>
          <p className="text-secondary small mb-0">
            Real-time survey metrics & mental health analysis aggregated from MongoDB check-ins
          </p>
        </div>
        <button 
          onClick={fetchWellnessAnalytics}
          className="btn btn-outline-light btn-sm rounded-pill px-3.5 py-2 d-inline-flex align-items-center gap-2 text-white border-secondary border-opacity-25"
        >
          <FiRefreshCw /> Auto Refresh
        </button>
      </div>

      {/* 5 DASHBOARD STAT CARDS */}
      <div className="row g-3 mb-4">
        {/* 1. Total Students */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Total Students</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>
                <FiUsers />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-white">{totalStudents}</h3>
            <span className="text-secondary extra-small">Registered Student Accounts</span>
          </div>
        </div>

        {/* 2. Today's Check-ins */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Today's Check-ins</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}>
                <FiCheckCircle />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-success">{todaysCheckIns}</h3>
            <span className="text-success extra-small">Recorded Today</span>
          </div>
        </div>

        {/* 3. Average Wellness Score */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Avg Wellness Score</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(168, 85, 247, 0.2)", color: "#a855f7" }}>
                <FiHeart />
              </span>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: "#c084fc" }}>{avgWellnessScore}%</h3>
            <span className="text-secondary extra-small">Overall Student Average</span>
          </div>
        </div>

        {/* 4. High Stress Students */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">High Stress Students</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(249, 115, 22, 0.2)", color: "#f97316" }}>
                <FiActivity />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-warning">{highStressStudents}</h3>
            <span className="text-warning extra-small">Stress Level ≥ 7</span>
          </div>
        </div>

        {/* 5. Low Wellness Score Students */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-medium">Low Wellness Score</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
                <FiTrendingDown />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-danger">{lowWellnessStudents}</h3>
            <span className="text-danger extra-small">Score Below 40%</span>
          </div>
        </div>
      </div>

      {/* ALERT SECTION: STUDENTS NEEDING ATTENTION */}
      <div 
        className="p-4 rounded-4 text-white mb-4 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.85) 100%)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-danger border-opacity-25 pb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="p-2 rounded-circle bg-danger bg-opacity-20 text-danger">
              <FiAlertTriangle size={20} />
            </span>
            <div>
              <h5 className="fw-bold mb-0 text-white fs-6">🚨 Students Needing Attention</h5>
              <span className="text-secondary small" style={{ fontSize: "0.78rem" }}>
                Automatically flagged based on low score (&lt;40%), extreme stress (&gt;8), or consecutive sad/stressed check-ins
              </span>
            </div>
          </div>

          <span className="badge bg-danger text-white px-3 py-1.5 rounded-pill">
            {studentsNeedingAttention.length} Flagged
          </span>
        </div>

        {studentsNeedingAttention.length === 0 ? (
          <div className="p-3 text-center text-success bg-dark bg-opacity-30 rounded-3">
            <FiCheckCircle size={20} className="me-2" />
            <span>Great news! No students currently require immediate mental health attention.</span>
          </div>
        ) : (
          <div className="row g-3">
            {studentsNeedingAttention.map((student, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="p-3 rounded-4 h-100 bg-dark bg-opacity-60"
                  style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold text-white mb-0">{student.fullName}</h6>
                    <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30 small">
                      {student.wellnessScore}% Wellness
                    </span>
                  </div>
                  <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                    <FiMail size={14} /> {student.email}
                  </p>
                  
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {student.reasons.map((reason, rIdx) => (
                      <span key={rIdx} className="badge bg-danger bg-opacity-30 text-white extra-small">
                        ⚠️ {reason}
                      </span>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between text-secondary extra-small border-top border-secondary border-opacity-25 pt-2">
                    <span>Mood: <strong className="text-white">{student.mood}</strong></span>
                    <span>Stress: <strong className="text-danger">{student.stressLevel}/10</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4 CHARTS ROW */}
      <div className="row g-4 mb-4">
        {/* CHART 1: Mood Distribution */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <FiSmile className="text-warning" /> Mood Distribution
            </h6>
            <div className="d-flex flex-column gap-3">
              {Object.keys(moodDistribution).map((moodKey) => {
                const count = moodDistribution[moodKey];
                const pct = Math.round((count / maxMoodCount) * 100);
                return (
                  <div key={moodKey}>
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>{getMoodEmoji(moodKey)}</span>
                      <span className="fw-bold text-white">{count} Students</span>
                    </div>
                    <div className="progress" style={{ height: "10px", background: "rgba(255, 255, 255, 0.08)" }}>
                      <div 
                        className="progress-bar bg-warning rounded-pill" 
                        style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 2: Average Wellness Score Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <FiHeart className="text-purple-400" style={{ color: "#a855f7" }} /> Average Wellness Score Distribution
            </h6>
            <div className="d-flex flex-column gap-3">
              {Object.keys(scoreDistribution).map((scoreKey) => {
                const count = scoreDistribution[scoreKey];
                const pct = Math.round((count / maxScoreCount) * 100);
                let barClass = "bg-success";
                if (scoreKey.includes("Good")) barClass = "bg-warning";
                if (scoreKey.includes("Moderate")) barClass = "bg-orange";
                if (scoreKey.includes("Needs Attention")) barClass = "bg-danger";

                return (
                  <div key={scoreKey}>
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>{scoreKey}</span>
                      <span className="fw-bold text-white">{count} Students</span>
                    </div>
                    <div className="progress" style={{ height: "10px", background: "rgba(255, 255, 255, 0.08)" }}>
                      <div 
                        className={`progress-bar ${barClass} rounded-pill`} 
                        style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 3: Daily Check-in Trend (Last 7 Days) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <FiTrendingUp className="text-info" /> Daily Check-in Trend (Last 7 Days)
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-3" style={{ height: "140px" }}>
              {dailyTrend.map((item, idx) => {
                const heightPct = Math.max(Math.round((item.count / maxTrendCount) * 100), 10);
                const displayDate = item.date.slice(5); // MM-DD
                return (
                  <div key={idx} className="d-flex flex-column align-items-center flex-1 h-100 justify-content-end">
                    <span className="extra-small fw-bold text-white mb-1">{item.count}</span>
                    <div 
                      className="w-100 rounded-top"
                      style={{ 
                        height: `${heightPct}%`, 
                        background: "linear-gradient(180deg, #3B82F6 0%, #1E40AF 100%)",
                        transition: "height 0.5s ease"
                      }}
                    />
                    <span className="extra-small text-secondary mt-2">{displayDate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 4: Stress Level Distribution */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <FiActivity className="text-danger" /> Stress Level Distribution
            </h6>
            <div className="d-flex flex-column gap-3">
              {Object.keys(stressDistribution).map((stressKey) => {
                const count = stressDistribution[stressKey];
                const pct = Math.round((count / maxStressCount) * 100);
                let barClass = "bg-success";
                if (stressKey.includes("Moderate")) barClass = "bg-warning";
                if (stressKey.includes("High")) barClass = "bg-danger";

                return (
                  <div key={stressKey}>
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>{stressKey}</span>
                      <span className="fw-bold text-white">{count} Students</span>
                    </div>
                    <div className="progress" style={{ height: "10px", background: "rgba(255, 255, 255, 0.08)" }}>
                      <div 
                        className={`progress-bar ${barClass} rounded-pill`} 
                        style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT WELLNESS TABLE */}
      <div 
        className="p-4 rounded-4 text-white"
        style={{
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
            <FiShield className="text-primary" /> Student Wellness Records ({filteredList.length})
          </h5>

          {/* Search & Filter Controls */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "240px" }}>
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <FiSearch />
              </span>
              <input 
                type="text"
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="Search student or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select 
              className="form-select form-select-sm bg-dark text-white border-secondary border-opacity-25"
              style={{ width: "170px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Excellent">🟢 Excellent</option>
              <option value="Good">🟡 Good</option>
              <option value="Moderate">🟠 Moderate</option>
              <option value="Needs Attention">🔴 Needs Attention</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="text-secondary border-bottom border-secondary border-opacity-25 small">
                <th>STUDENT NAME</th>
                <th>EMAIL</th>
                <th>TODAY'S MOOD</th>
                <th>WELLNESS SCORE</th>
                <th>STRESS LEVEL</th>
                <th>ENERGY LEVEL</th>
                <th>CHECK-IN DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-bottom border-secondary border-opacity-10">
                    <td>
                      <span className="fw-semibold text-white d-block">{item.fullName}</span>
                    </td>
                    <td className="text-secondary small">{item.email}</td>
                    <td className="fw-medium">{getMoodEmoji(item.mood)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: "6px", width: "70px", background: "rgba(255, 255, 255, 0.1)" }}>
                          <div 
                            className={`progress-bar ${
                              item.wellnessScore >= 80 ? "bg-success" : item.wellnessScore >= 60 ? "bg-warning" : item.wellnessScore >= 40 ? "bg-orange" : "bg-danger"
                            }`}
                            style={{ width: `${item.wellnessScore}%` }}
                          />
                        </div>
                        <span className="fw-bold small">{item.wellnessScore}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`fw-semibold ${item.stressLevel >= 7 ? "text-danger" : item.stressLevel >= 4 ? "text-warning" : "text-success"}`}>
                        {item.stressLevel} / 10
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-20 text-white small">
                        ⚡ {item.energyLevel}
                      </span>
                    </td>
                    <td className="text-secondary small">
                      <FiCalendar className="me-1" />
                      {item.checkInDate}
                    </td>
                    <td>
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-secondary">
                    No student wellness records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminWellnessAnalytics;
