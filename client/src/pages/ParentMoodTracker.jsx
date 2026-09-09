import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiHeart,
  FiSmile,
  FiTrendingUp,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
  FiUsers,
  FiZap,
  FiInfo
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentMoodTracker() {
  const [activeTab, setActiveTab] = useState("mood-tracker");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/parent/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChildrenList(data.children || []);
      }
    } catch (e) {
      console.error("Fetch children error:", e);
    } finally {
      setIsLoading(false);
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
        studentName={parentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header Section */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
              ❤️ Mood & Wellbeing
            </span>
            <h1 className="fw-bold text-white fs-3 mb-1">Child Mood & Emotional Tracker</h1>
            <p className="text-secondary small mb-0">Track emotional health, mood history, and daily check-in insights for your children.</p>
          </div>

          {/* Child Selector */}
          <div className="d-flex align-items-center gap-2">
            <FiUsers className="text-primary" />
            <select
              className="form-select bg-dark text-white border-secondary border-opacity-25 rounded-pill px-3 py-2 text-sm"
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              style={{ minWidth: "200px" }}
            >
              <option value="all">All Linked Children</option>
              {childrenList.map((c) => (
                <option key={c.id} value={c.childId || c.id}>
                  {c.name} ({c.relationship})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Quick Overview Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-success mb-1">
                <FiSmile />
                <span className="small text-secondary fw-semibold">Overall Harmony</span>
              </div>
              <div className="fs-4 fw-bold">88% Calm</div>
              <span className="text-success extra-small">+4% vs last week</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-info mb-1">
                <FiCalendar />
                <span className="small text-secondary fw-semibold">Check-in Streak</span>
              </div>
              <div className="fs-4 fw-bold">7 Consecutive Days</div>
              <span className="text-info extra-small">Daily sync active</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-warning mb-1">
                <FiZap />
                <span className="small text-secondary fw-semibold">Stress Level</span>
              </div>
              <div className="fs-4 fw-bold">Low / Normal</div>
              <span className="text-warning extra-small">Optimal range</span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex align-items-center gap-2 text-primary mb-1">
                <FiCheckCircle />
                <span className="small text-secondary fw-semibold">Safety Status</span>
              </div>
              <div className="fs-4 fw-bold">0 Critical Alerts</div>
              <span className="text-success extra-small">All clear 🛡️</span>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="row g-4 mb-4">
          {/* Mood History & Calendar Card */}
          <div className="col-lg-7">
            <div
              className="p-4 rounded-4 text-white h-100 shadow-sm"
              style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiHeart className="text-primary" /> Emotional Well-being Calendar
              </h5>
              <p className="text-secondary small mb-4">
                Visual history of logged mood check-ins over the past 7 days.
              </p>

              <div className="row g-2 text-center mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                  <div key={day} className="col">
                    <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                      <div className="text-secondary extra-small fw-semibold mb-1">{day}</div>
                      <div className="fs-3">{idx === 4 ? "😴" : idx === 6 ? "😊" : "🙂"}</div>
                      <span className="badge rounded-pill bg-success bg-opacity-20 text-success border border-success border-opacity-30 mt-2" style={{ fontSize: "0.65rem" }}>
                        {idx === 4 ? "Tired" : "Calm"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-3 bg-indigo-950 bg-opacity-40 border border-indigo-800 border-opacity-30 d-flex align-items-center gap-3">
                <FiInfo className="text-indigo-400 fs-4 flex-shrink-0" />
                <div className="small text-indigo-200">
                  <strong>Parent Tip:</strong> Encouraging open discussions after school helps reduce evening anxiety and promotes better sleep quality.
                </div>
              </div>
            </div>
          </div>

          {/* AI Emotional Insights Card */}
          <div className="col-lg-5">
            <div
              className="p-4 rounded-4 text-white h-100 shadow-sm"
              style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiTrendingUp className="text-info" /> AI Mood Insights
              </h5>
              
              <div className="p-3 rounded-3 mb-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                <div className="fw-semibold text-white small mb-1">🌟 Positive Trend Detected</div>
                <p className="text-secondary extra-small mb-0">
                  Emotional stability has improved by 5% this week. Daily study sessions are balanced with sufficient sleep.
                </p>
              </div>

              <div className="p-3 rounded-3 mb-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                <div className="fw-semibold text-white small mb-1">🎯 Recommended Action</div>
                <p className="text-secondary extra-small mb-0">
                  Acknowledge your child's consistent study focus this weekend to reinforce healthy cognitive habits.
                </p>
              </div>

              <button
                className="btn btn-outline-primary rounded-pill w-100 py-2 fw-semibold text-sm d-flex align-items-center justify-content-center gap-2 mt-4"
                onClick={() => alert("Redirecting to Parenting AI Companion...")}
              >
                🤖 Ask Parenting AI For Custom Advice
              </button>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentMoodTracker;
