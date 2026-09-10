import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiTrendingUp, FiAward, FiSmile, FiActivity, FiPieChart, FiCheckCircle, FiCpu } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorProgress() {
  const [activeTab, setActiveTab] = useState("progress");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [stats, setStats] = useState(null);
  const [memoryStats, setMemoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setSeniorName(userObj.fullName || userObj.name);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [resCognitive, resMemory] = await Promise.all([
        fetch("http://localhost:5000/api/senior/cognitive-games/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/senior/memory-exercises/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataCognitive = await resCognitive.json();
      const dataMemory = await resMemory.json();

      if (resCognitive.ok && dataCognitive.success) {
        setStats(dataCognitive.data);
      }
      if (resMemory.ok && dataMemory.success) {
        setMemoryStats(dataMemory.data);
      }
    } catch (err) {
      console.error("Error fetching senior progress stats:", err);
    } finally {
      setLoading(false);
    }
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
        studentName={seniorName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#C084FC",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
              >
                📊 Vitality & Performance Insights
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">Progress & Insights</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
              Track your cognitive exercise scores, memory recall trends, and overall vitality.
            </p>
          </div>
        </div>

        {/* TOP STATS CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
              <span className="text-muted small fw-medium">Games Played</span>
              <h3 className="text-white fw-bold fs-2 my-2">{stats ? stats.totalGamesPlayed : 0}</h3>
              <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Total completed games</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
              <span className="text-muted small fw-medium">Average Score</span>
              <h3 className="text-emerald-400 fw-bold fs-2 my-2" style={{ color: "#34D399" }}>
                {stats ? stats.averageScore : 0}%
              </h3>
              <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Cognitive accuracy rating</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
              <span className="text-muted small fw-medium">Memory Exercises</span>
              <h3 className="text-info fw-bold fs-2 my-2">{memoryStats ? memoryStats.exercisesCompleted : 0}</h3>
              <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Completed memory sessions</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between">
              <span className="text-muted small fw-medium">Recommended Difficulty</span>
              <div className="my-2">
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-semibold fs-6"
                  style={{
                    background: "rgba(139, 92, 246, 0.2)",
                    color: "#C084FC",
                    border: "1px solid #8B5CF6",
                  }}
                >
                  {stats ? stats.recommendedDifficulty : "Easy"}
                </span>
              </div>
              <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Suggested difficulty</span>
            </div>
          </div>
        </div>

        {/* 🧠 MEMORY EXERCISE PROGRESS CARD */}
        <div className="ns-card p-4 mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
              <FiCpu className="text-info" /> 🧠 Memory Exercise Progress
            </h4>

            {memoryStats && (
              <span className="badge rounded-pill bg-info bg-opacity-25 text-info px-3 py-1 border border-info border-opacity-25 small">
                {memoryStats.trendBadge}
              </span>
            )}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                <span className="text-muted d-block small">Exercises Completed</span>
                <span className="text-white fw-bold fs-4">{memoryStats ? memoryStats.exercisesCompleted : 0}</span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                <span className="text-muted d-block small">Average Accuracy</span>
                <span className="text-emerald-400 fw-bold fs-4" style={{ color: "#34D399" }}>
                  {memoryStats ? memoryStats.averageAccuracy : 0}%
                </span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                <span className="text-muted d-block small">Best Score</span>
                <span className="text-warning fw-bold fs-4">{memoryStats ? memoryStats.bestScore : 0}%</span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                <span className="text-muted d-block small">Recent Trend</span>
                <span className="text-info fw-bold fs-6">{memoryStats ? memoryStats.trendBadge : "New"}</span>
              </div>
            </div>
          </div>

          {memoryStats && (
            <p className="text-white-50 small mb-0 p-2.5 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
              <strong>Memory Trend Note:</strong> {memoryStats.recentTrend}
            </p>
          )}
        </div>

        {/* COGNITIVE PERFORMANCE BY GAME TYPE */}
        <div className="ns-card p-4 mb-4">
          <h4 className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
            <FiPieChart className="text-primary" /> Cognitive Games Breakdown
          </h4>

          <div className="row g-3">
            {/* Memory Performance */}
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-white fw-semibold small">🧠 Memory Match</span>
                  <span className="text-emerald-400 fw-bold" style={{ color: "#34D399" }}>
                    {stats ? stats.memoryPerformance : 0}%
                  </span>
                </div>
                <div className="progress" style={{ height: "8px", background: "rgba(255, 255, 255, 0.1)" }}>
                  <div
                    className="progress-bar bg-success rounded-pill"
                    role="progressbar"
                    style={{ width: `${stats ? stats.memoryPerformance : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Attention Performance */}
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-white fw-semibold small">🎯 Attention Challenge</span>
                  <span className="text-info fw-bold">
                    {stats ? stats.attentionPerformance : 0}%
                  </span>
                </div>
                <div className="progress" style={{ height: "8px", background: "rgba(255, 255, 255, 0.1)" }}>
                  <div
                    className="progress-bar bg-info rounded-pill"
                    role="progressbar"
                    style={{ width: `${stats ? stats.attentionPerformance : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Number Sequence Performance */}
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-white fw-semibold small">🔢 Number Sequence</span>
                  <span className="text-purple fw-bold" style={{ color: "#C084FC" }}>
                    {stats ? stats.numberPerformance : 0}%
                  </span>
                </div>
                <div className="progress" style={{ height: "8px", background: "rgba(255, 255, 255, 0.1)" }}>
                  <div
                    className="progress-bar bg-purple rounded-pill"
                    role="progressbar"
                    style={{ width: `${stats ? stats.numberPerformance : 0}%`, background: "#8B5CF6" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default SeniorProgress;
