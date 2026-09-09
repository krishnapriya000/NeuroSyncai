import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiBarChart2,
  FiTrendingUp,
  FiPieChart,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiAward
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentInsights() {
  const [activeTab, setActiveTab] = useState("insights");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

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
            📊 Analytics & Insights
          </span>
          <h1 className="fw-bold text-white fs-3 mb-1">Parenting Insights & Family Analytics</h1>
          <p className="text-secondary small mb-0">AI-generated observations, emotional trends, and screen-time balance for your family.</p>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-primary mb-1">
                <FiPieChart />
                <span className="small text-secondary fw-semibold">Emotional Balance</span>
              </div>
              <div className="fs-4 fw-bold">88% Positive</div>
              <span className="text-success extra-small">+5% this week</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-info mb-1">
                <FiActivity />
                <span className="small text-secondary fw-semibold">Screen Time Balance</span>
              </div>
              <div className="fs-4 fw-bold">3h 20m avg</div>
              <span className="text-info extra-small">Optimal range</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-success mb-1">
                <FiAward />
                <span className="small text-secondary fw-semibold">Study Goals Met</span>
              </div>
              <div className="fs-4 fw-bold">12 / 15 Goals</div>
              <span className="text-success extra-small">80% completion</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-warning mb-1">
                <FiAlertCircle />
                <span className="small text-secondary fw-semibold">Safety Alerts</span>
              </div>
              <div className="fs-4 fw-bold">0 Critical</div>
              <span className="text-success extra-small">All clear 🛡️</span>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="row g-4 mb-4">
          {/* Insights Breakdown */}
          <div className="col-lg-6">
            <div className="p-4 rounded-4 text-white h-100 shadow-sm" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiBarChart2 className="text-primary" /> Emotional Distribution
              </h5>
              <p className="text-secondary small mb-4">Breakdown of recorded moods for linked children over the past month.</p>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between text-sm mb-1">
                  <span>Calm & Focused</span>
                  <span className="text-success fw-bold">65%</span>
                </div>
                <div className="progress bg-dark" style={{ height: "8px" }}>
                  <div className="progress-bar bg-success" style={{ width: "65%" }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between text-sm mb-1">
                  <span>Happy & Energetic</span>
                  <span className="text-info fw-bold">23%</span>
                </div>
                <div className="progress bg-dark" style={{ height: "8px" }}>
                  <div className="progress-bar bg-info" style={{ width: "23%" }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between text-sm mb-1">
                  <span>Tired / Sleepy</span>
                  <span className="text-warning fw-bold">8%</span>
                </div>
                <div className="progress bg-dark" style={{ height: "8px" }}>
                  <div className="progress-bar bg-warning" style={{ width: "8%" }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between text-sm mb-1">
                  <span>Anxious / Stressed</span>
                  <span className="text-danger fw-bold">4%</span>
                </div>
                <div className="progress bg-dark" style={{ height: "8px" }}>
                  <div className="progress-bar bg-danger" style={{ width: "4%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Observations Card */}
          <div className="col-lg-6">
            <div className="p-4 rounded-4 text-white h-100 shadow-sm" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiTrendingUp className="text-info" /> AI Observations & Recommendations
              </h5>

              <div className="p-3 rounded-3 mb-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                <div className="fw-semibold text-white small mb-1">🧠 Study & Rest Sync</div>
                <p className="text-secondary extra-small mb-0">
                  Focus session length is optimal at 45 minutes with 10-minute restorative breaks. Keep up this study rhythm!
                </p>
              </div>

              <div className="p-3 rounded-3 mb-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                <div className="fw-semibold text-white small mb-1">🌙 Sleep Consistency</div>
                <p className="text-secondary extra-small mb-0">
                  Bedtime routines have been consistent around 10:00 PM over the last 5 days.
                </p>
              </div>

              <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                <div className="fw-semibold text-white small mb-1">💡 Parent Guidance Suggestion</div>
                <p className="text-secondary extra-small mb-0">
                  Plan a relaxed family outdoor activity this weekend to maintain emotional harmony and active well-being.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentInsights;
