import { API_BASE_URL } from "../../utils/apiConfig.js";
import { useState, useEffect, useCallback } from "react";
import { 
  FiUsers, 
  FiCheckCircle, 
  FiHeart, 
  FiAlertTriangle, 
  FiTrendingDown,
  FiSmile,
  FiActivity,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiMail,
  FiShield,
  FiPieChart,
  FiBarChart2
} from "react-icons/fi";

function AdminWellnessAnalytics({ theme = "light" }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const isLight = theme === "light";

  const cardStyle = {
    background: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.75)",
    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: isLight ? "0 2px 12px rgba(0, 0, 0, 0.03)" : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
    borderRadius: "16px"
  };

  const titleColor = isLight ? "#111827" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

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
      const response = await fetch(`${API_BASE_URL}/api/admin/wellness-analytics`, {
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
    let isMounted = true;

    async function loadData() {
      const token = localStorage.getItem("neurosync_token");
      if (!token) {
        if (isMounted) {
          setError("Authentication token missing. Please log in as Admin.");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/wellness-analytics`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!isMounted) return;

        if (data.success) {
          setAnalytics(data.analytics);
        } else {
          setError(data.message || "Failed to load wellness analytics.");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Fetch wellness analytics error:", err);
        setError("Cannot connect to server to fetch wellness analytics.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-5 text-center my-4" style={cardStyle}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
        <h5 className="fw-bold" style={{ color: titleColor }}>Loading Student Wellness Analytics...</h5>
        <p className="small mb-0" style={{ color: subtextColor }}>Fetching real-time survey responses from MongoDB</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-4 mb-4 border border-danger border-opacity-25 shadow-sm" style={{ background: isLight ? "#FFFFFF" : "#1E293B", color: titleColor }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 text-danger">
            <FiAlertTriangle size={24} />
            <span className="fw-semibold">{error}</span>
          </div>
          <button onClick={fetchWellnessAnalytics} className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
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
        return <span className="px-2.5 py-1 rounded-pill extra-small fw-bold" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#047857" }}>🟢 Excellent</span>;
      case "Good":
        return <span className="px-2.5 py-1 rounded-pill extra-small fw-bold" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#B45309" }}>🟡 Good</span>;
      case "Moderate":
        return <span className="px-2.5 py-1 rounded-pill extra-small fw-bold" style={{ background: "rgba(249, 115, 22, 0.12)", color: "#C2410C" }}>🟠 Moderate</span>;
      case "Needs Attention":
        return <span className="px-2.5 py-1 rounded-pill extra-small fw-bold" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#B91C1C" }}>🔴 Needs Attention</span>;
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
    <div className="wellness-analytics-section" style={{ maxWidth: "1500px", margin: "0 auto" }}>

      {/* 5 DASHBOARD STAT CARDS */}
      <div className="row g-3 mb-4">
        {/* 1. Total Students */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-medium" style={{ color: subtextColor }}>Total Students</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#2563EB" }}>
                <FiUsers />
              </span>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: titleColor }}>{totalStudents}</h3>
            <span className="extra-small" style={{ color: subtextColor }}>Registered Accounts</span>
          </div>
        </div>

        {/* 2. Today's Check-ins */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-medium" style={{ color: subtextColor }}>Today's Check-ins</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
                <FiCheckCircle />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-success">{todaysCheckIns}</h3>
            <span className="text-success extra-small">Recorded Today</span>
          </div>
        </div>

        {/* 3. Average Wellness Score */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-medium" style={{ color: subtextColor }}>Avg Wellness Score</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(124, 92, 252, 0.12)", color: "#7C5CFC" }}>
                <FiHeart />
              </span>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: "#7C5CFC" }}>{avgWellnessScore}%</h3>
            <span className="extra-small" style={{ color: subtextColor }}>Platform Average</span>
          </div>
        </div>

        {/* 4. High Stress Students */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-medium" style={{ color: subtextColor }}>High Stress Students</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}>
                <FiActivity />
              </span>
            </div>
            <h3 className="fw-bold mb-1 text-warning">{highStressStudents}</h3>
            <span className="text-warning extra-small">Stress Level ≥ 7</span>
          </div>
        </div>

        {/* 5. Low Wellness Score Students */}
        <div className="col-12 col-sm-6 col-xl-2.4">
          <div className="p-3.5 rounded-4 h-100 transition-all" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-medium" style={{ color: subtextColor }}>Low Wellness Score</span>
              <span className="p-2 rounded-3" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#DC2626" }}>
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
        className="p-4 rounded-4 mb-4 transition-all position-relative overflow-hidden"
        style={{
          ...cardStyle,
          border: isLight ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(239, 68, 68, 0.4)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
          <div className="d-flex align-items-center gap-2">
            <span className="p-2 rounded-circle bg-danger bg-opacity-10 text-danger">
              <FiAlertTriangle size={20} />
            </span>
            <div>
              <h5 className="fw-bold mb-0 fs-6" style={{ color: titleColor }}>🚨 Students Needing Attention</h5>
              <span className="small" style={{ color: subtextColor, fontSize: "0.78rem" }}>
                Flagged automatically based on low score (&lt;40%), extreme stress (&gt;8), or consecutive sad check-ins
              </span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-pill extra-small fw-bold text-white bg-danger">
            {studentsNeedingAttention.length} Flagged
          </span>
        </div>

        {studentsNeedingAttention.length === 0 ? (
          <div className="p-3 text-center text-success bg-success bg-opacity-10 rounded-3 border border-success border-opacity-20">
            <FiCheckCircle size={20} className="me-2" />
            <span className="fw-semibold">Great news! No students currently require immediate mental health attention.</span>
          </div>
        ) : (
          <div className="row g-3">
            {studentsNeedingAttention.map((student, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-4">
                <div className="p-3 rounded-4 h-100 border" style={{ background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.05)", borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0" style={{ color: titleColor }}>{student.fullName}</h6>
                    <span className="px-2 py-0.5 rounded-pill extra-small fw-bold text-danger bg-danger bg-opacity-10">
                      {student.wellnessScore}% Wellness
                    </span>
                  </div>
                  <p className="small mb-2 d-flex align-items-center gap-1" style={{ color: subtextColor, fontSize: "0.82rem" }}>
                    <FiMail size={13} /> {student.email}
                  </p>
                  
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {student.reasons.map((reason, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 rounded extra-small fw-semibold text-danger bg-danger bg-opacity-10 border border-danger border-opacity-25">
                        ⚠️ {reason}
                      </span>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between extra-small border-top pt-2 mt-2" style={{ color: subtextColor, borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.1)" }}>
                    <span>Mood: <strong style={{ color: titleColor }}>{student.mood}</strong></span>
                    <span>Stress: <strong className="text-danger">{student.stressLevel}/10</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHARTS SECTION */}
      <div className="row g-4 mb-4">
        {/* CHART 1: Mood Distribution (Bar + Donut concept) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor }}>
              <FiSmile className="text-warning" /> Mood Distribution Breakdown
            </h6>
            <div className="d-flex flex-column gap-3">
              {Object.keys(moodDistribution).map((moodKey) => {
                const count = moodDistribution[moodKey];
                const pct = Math.round((count / maxMoodCount) * 100);
                return (
                  <div key={moodKey}>
                    <div className="d-flex justify-content-between small mb-1" style={{ color: subtextColor }}>
                      <span>{getMoodEmoji(moodKey)}</span>
                      <span className="fw-bold" style={{ color: titleColor }}>{count} Students</span>
                    </div>
                    <div className="progress" style={{ height: "10px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                      <div 
                        className="progress-bar rounded-pill" 
                        style={{ width: `${pct}%`, transition: "width 0.6s ease", background: "linear-gradient(90deg, #F59E0B, #D97706)" }}
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
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor }}>
              <FiPieChart style={{ color: "#7C5CFC" }} /> Wellness Score Distribution
            </h6>
            <div className="d-flex flex-column gap-3">
              {Object.keys(scoreDistribution).map((scoreKey) => {
                const count = scoreDistribution[scoreKey];
                const pct = Math.round((count / maxScoreCount) * 100);
                let barColor = "linear-gradient(90deg, #10B981, #059669)";
                if (scoreKey.includes("Good")) barColor = "linear-gradient(90deg, #F59E0B, #D97706)";
                if (scoreKey.includes("Moderate")) barColor = "linear-gradient(90deg, #F97316, #EA580C)";
                if (scoreKey.includes("Needs Attention")) barColor = "linear-gradient(90deg, #EF4444, #DC2626)";

                return (
                  <div key={scoreKey}>
                    <div className="d-flex justify-content-between small mb-1" style={{ color: subtextColor }}>
                      <span>{scoreKey}</span>
                      <span className="fw-bold" style={{ color: titleColor }}>{count} Students</span>
                    </div>
                    <div className="progress" style={{ height: "10px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                      <div 
                        className="progress-bar rounded-pill" 
                        style={{ width: `${pct}%`, background: barColor, transition: "width 0.6s ease" }}
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
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor }}>
              <FiBarChart2 className="text-info" /> Daily Check-in Activity Trend (7 Days)
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-3" style={{ height: "160px" }}>
              {dailyTrend.map((item, idx) => {
                const heightPct = Math.max(Math.round((item.count / maxTrendCount) * 100), 12);
                const displayDate = item.date.slice(5); // MM-DD
                return (
                  <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                    <span className="extra-small fw-bold mb-1" style={{ color: titleColor }}>{item.count}</span>
                    <div 
                      className="w-100 rounded-top"
                      style={{ 
                        height: `${heightPct}%`, 
                        background: "linear-gradient(180deg, #7C5CFC 0%, #4F8CFF 100%)",
                        transition: "height 0.5s ease"
                      }}
                    />
                    <span className="extra-small mt-2" style={{ color: subtextColor, fontSize: "0.75rem" }}>{displayDate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 4: Stress Level Distribution */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor }}>
              <FiActivity className="text-danger" /> Stress Level Distribution
            </h6>
            <div className="d-flex flex-column gap-3">
              {Object.keys(stressDistribution).map((stressKey) => {
                const count = stressDistribution[stressKey];
                const pct = Math.round((count / maxStressCount) * 100);
                let barColor = "linear-gradient(90deg, #10B981, #059669)";
                if (stressKey.includes("Moderate")) barColor = "linear-gradient(90deg, #F59E0B, #D97706)";
                if (stressKey.includes("High")) barColor = "linear-gradient(90deg, #EF4444, #DC2626)";

                return (
                  <div key={stressKey}>
                    <div className="d-flex justify-content-between small mb-1" style={{ color: subtextColor }}>
                      <span>{stressKey}</span>
                      <span className="fw-bold" style={{ color: titleColor }}>{count} Students</span>
                    </div>
                    <div className="progress" style={{ height: "10px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                      <div 
                        className="progress-bar rounded-pill" 
                        style={{ width: `${pct}%`, background: barColor, transition: "width 0.6s ease" }}
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
      <div className="p-4 rounded-4" style={cardStyle}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor }}>
            <FiShield className="text-primary" /> Student Wellness Records ({filteredList.length})
          </h5>

          {/* Search & Filter Controls */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "240px" }}>
              <span className="input-group-text border-end-0" style={{ background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: subtextColor }}>
                <FiSearch />
              </span>
              <input 
                type="text"
                className="form-control border-start-0"
                placeholder="Search student or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: titleColor, borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)" }}
              />
            </div>

            <select 
              className="form-select form-select-sm"
              style={{ width: "170px", background: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.9)", color: titleColor, borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)" }}
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
          <table className="table table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="border-bottom extra-small text-uppercase tracking-wider" style={{ color: subtextColor, borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
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
                  <tr key={item.id} className="border-bottom" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)" }}>
                    <td>
                      <span className="fw-semibold d-block" style={{ color: titleColor, fontSize: "0.88rem" }}>{item.fullName}</span>
                    </td>
                    <td className="small" style={{ color: subtextColor, fontSize: "0.84rem" }}>{item.email}</td>
                    <td className="fw-medium" style={{ color: titleColor }}>{getMoodEmoji(item.mood)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: "6px", width: "70px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                          <div 
                            className={`progress-bar ${
                              item.wellnessScore >= 80 ? "bg-success" : item.wellnessScore >= 60 ? "bg-warning" : item.wellnessScore >= 40 ? "bg-warning" : "bg-danger"
                            }`}
                            style={{ width: `${item.wellnessScore}%` }}
                          />
                        </div>
                        <span className="fw-bold small" style={{ color: titleColor }}>{item.wellnessScore}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`fw-semibold ${item.stressLevel >= 7 ? "text-danger" : item.stressLevel >= 4 ? "text-warning" : "text-success"}`}>
                        {item.stressLevel} / 10
                      </span>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded extra-small fw-semibold border" style={{ background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.08)", color: subtextColor, borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.1)", fontSize: "0.75rem" }}>
                        ⚡ {item.energyLevel}
                      </span>
                    </td>
                    <td className="small" style={{ color: subtextColor, fontSize: "0.82rem" }}>
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
                  <td colSpan="8" className="text-center py-4 extra-small" style={{ color: subtextColor }}>
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
