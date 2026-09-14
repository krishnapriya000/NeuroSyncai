import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiTrendingUp, FiSmile, FiCheckSquare, FiClock, FiActivity, FiBookOpen, FiZap, FiPieChart } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorProgress() {
  const [activeTab, setActiveTab] = useState("progress");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [progressData, setProgressData] = useState(null);
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

    fetchSeniorProgress();
  }, []);

  const fetchSeniorProgress = async () => {
    setLoading(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/senior/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setProgressData(json.data);
      }
    } catch (err) {
      console.error("Error fetching senior progress data:", err);
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
        {/* Header */}
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
                📊 Senior Wellness Analytics
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-2 mb-1">Progress & Insights</h1>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Track your weekly mood, check-in completion, medication adherence, and wellness streak.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="text-muted small">Loading senior progress data...</p>
          </div>
        ) : progressData ? (
          <>
            {/* 4 SUMMARY STAT CARDS */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Weekly Mood</span>
                    <FiSmile className="text-success fs-4" />
                  </div>
                  <h3 className="text-white fw-bold fs-3 my-1">{progressData.weeklyMood}</h3>
                  <span className="text-success small fw-semibold">Observational Mood Trend</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Daily Check-ins</span>
                    <FiCheckSquare className="text-primary fs-4" />
                  </div>
                  <h3 className="text-white fw-bold fs-3 my-1">
                    {progressData.checkInStats.recentCount} / {progressData.checkInStats.total}
                  </h3>
                  <div className="progress bg-dark" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-primary rounded"
                      style={{ width: `${progressData.checkInStats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Medication Adherence</span>
                    <FiClock className="text-warning fs-4" />
                  </div>
                  <h3 className="text-warning fw-bold fs-3 my-1">{progressData.medicationAdherence}%</h3>
                  <div className="progress bg-dark" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-warning rounded"
                      style={{ width: `${progressData.medicationAdherence}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="ns-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-medium">Wellness Streak</span>
                    <FiZap className="text-purple-300 fs-4" style={{ color: "#c084fc" }} />
                  </div>
                  <h3 className="text-white fw-bold fs-3 my-1">{progressData.wellnessStreak} Days 🔥</h3>
                  <span className="text-purple-300 small fw-semibold" style={{ color: "#c084fc" }}>
                    Active Routine Streak
                  </span>
                </div>
              </div>
            </div>

            {/* RECENT CHECK-IN & ACTIVITY INSIGHTS */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="ns-card p-4 h-100">
                  <h4 className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                    <FiCheckSquare className="text-primary" /> Check-in History
                  </h4>
                  {progressData.recentCheckIns.length === 0 ? (
                    <p className="text-muted small py-3">No recent check-ins logged.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {progressData.recentCheckIns.map((c) => (
                        <div key={c._id} className="p-3 rounded bg-dark border border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                          <div>
                            <div className="text-white fw-semibold">Feeling: {c.feeling}</div>
                            <div className="text-muted small">Sleep: {c.sleepQuality} • Energy: {c.energyLevel}</div>
                          </div>
                          <span className="text-muted small">
                            {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="ns-card p-4 h-100">
                  <h4 className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                    <FiActivity className="text-success" /> Activity & Health Logs
                  </h4>
                  {progressData.recentActivities.length === 0 ? (
                    <p className="text-muted small py-3">No recent activity logs recorded.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {progressData.recentActivities.map((a) => (
                        <div key={a._id} className="p-3 rounded bg-dark border border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                          <div>
                            <div className="text-white fw-semibold">🏃 {a.steps} Steps • 😴 {a.sleepHours}h Sleep</div>
                            <div className="text-muted small">💧 Water: {a.waterGlasses} glasses • Energy: {a.energyLevel}</div>
                          </div>
                          <span className="text-muted small">
                            {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-muted text-center py-5">Unable to load senior progress analytics.</div>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
}

export default SeniorProgress;
