import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studentDashboard.css";

import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
import ProfessionalStatCards from "../components/professional/ProfessionalStatCards";
import ProfessionalMoodCheckIn from "../components/professional/ProfessionalMoodCheckIn";
import UpcomingFocusSessionCard from "../components/professional/UpcomingFocusSessionCard";
import ProfessionalQuickActions from "../components/professional/ProfessionalQuickActions";
import WeeklyWellnessOverviewCard from "../components/professional/WeeklyWellnessOverviewCard";
import AIWellnessInsightCard from "../components/professional/AIWellnessInsightCard";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import { FiBriefcase, FiCheckSquare, FiCheckCircle, FiInfo, FiX, FiActivity, FiShield, FiHeart } from "react-icons/fi";

function ProfessionalDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profName, setProfName] = useState("Professional User");
  const [activeModal, setActiveModal] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const [hasTodayCheckIn, setHasTodayCheckIn] = useState(false);
  const [todayData, setTodayData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setProfName(userObj.fullName || userObj.name);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    fetchTodayCheckInStatus();
  }, []);

  const fetchTodayCheckInStatus = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/professional/checkin/today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success && json.data) {
        setHasTodayCheckIn(true);
        setTodayData(json.data);
      }
    } catch (err) {
      console.error("Error fetching today checkin status:", err);
    }
  };

  const handleStartDailyCheckin = () => {
    navigate("/professional/checkin");
  };

  const handleViewMoodHistory = () => {
    setModalTitle("Workplace Mood & Stress History");
    setActiveModal("mood-history");
  };

  const handleViewAnalytics = () => {
    setModalTitle("Workplace Analytics & Wellness Trends");
    setActiveModal("analytics");
  };

  const handleViewRecommendations = () => {
    setModalTitle("AI Workplace Recommendations");
    setActiveModal("recommendations");
  };

  const handleQuickAction = (actionId) => {
    const titleMap = {
      "work-hours": "Log Work Hours",
      "log-break": "Schedule Rest Break",
      "sleep-tracker": "Sleep Quality Log",
      "journal-entry": "Workplace Reflection Journal"
    };
    setModalTitle(titleMap[actionId] || "Quick Action");
    setActiveModal("quick-action");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Compute metrics from today's saved data if available
  const computedStressLevel = todayData
    ? todayData.stressLevel <= 2
      ? "Low"
      : todayData.stressLevel === 3
      ? "Moderate"
      : "High"
    : "Low";

  const computedStressScore = todayData
    ? `${todayData.stressLevel * 20}/100 stress score`
    : "28/100 stress score";

  const computedFocusTime = todayData
    ? `${todayData.workingHours || 8}h 00m`
    : "5h 30m";

  const computedSleepTime = todayData ? todayData.sleepHours : "7h 15m";

  const computedWellnessScore = todayData
    ? Math.min(100, Math.round(((6 - todayData.stressLevel) + todayData.energyLevel + todayData.focusLevel + todayData.workLifeBalance) * 5))
    : 82;

  return (
    <div className="dashboard-container">
      {/* 1. SIDEBAR */}
      <ProfessionalSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === "checkin") navigate("/professional/checkin");
          if (tab === "profile") navigate("/professional/profile");
        }} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* 2. HEADER */}
      <ProfessionalNavbar 
        userName={profName} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "checkin") navigate("/professional/checkin");
          if (tab === "profile") navigate("/professional/profile");
        }}
      />

      {/* MAIN CONTENT AREA */}
      <main className="ns-main-content">
        {/* 3. HERO SECTION */}
        <div 
          className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg" 
          style={{ 
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)", 
            border: "1px solid rgba(255, 255, 255, 0.1)" 
          }}
        >
          {/* Subtle Ambient Glow */}
          <div 
            className="position-absolute"
            style={{
              top: "-50px",
              right: "-50px",
              width: "250px",
              height: "250px",
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
              pointerEvents: "none"
            }}
          />

          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-8">
              <span className="badge bg-primary bg-opacity-25 text-blue-300 px-3 py-1.5 rounded-pill mb-2 border border-blue-400 border-opacity-30 d-inline-flex align-items-center gap-1.5" style={{ fontSize: "0.82rem" }}>
                💼 Working Professional Portal
              </span>
              <h1 className="fw-bold fs-3 mb-2">Welcome back, {profName.split(" ")[0]}!</h1>
              <p className="text-gray-300 mb-3" style={{ maxWidth: "620px", fontSize: "0.95rem", color: "#CBD5E1" }}>
                Manage workplace stress, improve focus, maintain work-life balance, and build healthier work habits.
              </p>
              
              {hasTodayCheckIn ? (
                <button 
                  className="btn btn-outline-success rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-1.5 border-opacity-30"
                  onClick={handleStartDailyCheckin}
                >
                  <FiCheckCircle className="me-1" /> Today's Check-in Completed ✓
                </button>
              ) : (
                <button 
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm ns-btn-primary"
                  onClick={handleStartDailyCheckin}
                >
                  <FiCheckSquare className="me-1" /> Start Daily Check-in
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. TOP METRIC CARDS */}
        <ProfessionalStatCards 
          focusTime={computedFocusTime}
          stressLevel={computedStressLevel}
          stressScore={computedStressScore}
          sleepTime={computedSleepTime}
          wellnessScore={computedWellnessScore}
        />

        {/* ROW 1: TODAY'S MOOD CHECK-IN & UPCOMING FOCUS SESSION */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            {/* 5. TODAY'S MOOD CHECK-IN */}
            <ProfessionalMoodCheckIn onViewHistory={handleViewMoodHistory} />
          </div>
          <div className="col-12 col-lg-6">
            {/* 6. UPCOMING FOCUS SESSION */}
            <UpcomingFocusSessionCard />
          </div>
        </div>

        {/* ROW 2: QUICK ACTIONS & AI WELLNESS INSIGHT */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-5">
            {/* 7. QUICK ACTIONS */}
            <ProfessionalQuickActions onAction={handleQuickAction} />
          </div>
          <div className="col-12 col-lg-7">
            {/* 9. AI WELLNESS INSIGHT */}
            <AIWellnessInsightCard onViewRecommendations={handleViewRecommendations} />
          </div>
        </div>

        {/* ROW 3: WEEKLY WELLNESS OVERVIEW CHART */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            {/* 8. WEEKLY OVERVIEW */}
            <WeeklyWellnessOverviewCard onViewAnalytics={handleViewAnalytics} />
          </div>
        </div>
      </main>

      {/* DASHBOARD FOOTER */}
      <DashboardFooter />

      {/* MODAL FOR ACTIONS & DETAILED INSIGHTS */}
      {activeModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: "rgba(5, 8, 22, 0.8)", backdropFilter: "blur(8px)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content text-white rounded-4 shadow-lg border border-secondary border-opacity-25"
              style={{ background: "#0F172A" }}
            >
              <div className="modal-header border-bottom border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white fs-6 d-flex align-items-center gap-2">
                  <FiBriefcase className="text-primary" /> {modalTitle}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body py-4">
                {activeModal === "mood-history" && (
                  <div>
                    <p className="text-muted" style={{ fontSize: "0.88rem" }}>
                      Recent workplace mood check-in records:
                    </p>
                    <div className="d-flex flex-column gap-2">
                      <div className="p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                        <div>
                          <span className="fw-bold text-white">Today</span> - {todayData?.mood || "Great 😊"}
                          <div className="text-muted" style={{ fontSize: "0.76rem" }}>Recorded via Daily Wellness Survey</div>
                        </div>
                        <span className="badge bg-primary bg-opacity-25 text-primary">Focused</span>
                      </div>
                      <div className="p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                        <div>
                          <span className="fw-bold text-white">Yesterday</span> - Good 🙂
                          <div className="text-muted" style={{ fontSize: "0.76rem" }}>Logged at 8:45 AM</div>
                        </div>
                        <span className="badge bg-success bg-opacity-25 text-success">Balanced</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === "analytics" && (
                  <div>
                    <p className="text-muted" style={{ fontSize: "0.88rem" }}>
                      Detailed workplace wellness breakdown across stress, focus, sleep, and work-life balance metrics.
                    </p>
                    <ul className="list-group list-group-flush bg-transparent">
                      <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between">
                        <span>Working Hours Today:</span> <strong>{todayData?.workingHours || 8} Hours</strong>
                      </li>
                      <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between">
                        <span>Weekly Stress Score:</span> <strong className="text-success">{computedStressScore} ({computedStressLevel})</strong>
                      </li>
                      <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between">
                        <span>Sleep Quality Index:</span> <strong className="text-info">{computedSleepTime}</strong>
                      </li>
                    </ul>
                  </div>
                )}

                {activeModal === "recommendations" && (
                  <div>
                    <p className="text-muted" style={{ fontSize: "0.88rem" }}>
                      Personalized AI Workplace Recommendations:
                    </p>
                    <div className="d-flex flex-column gap-2" style={{ fontSize: "0.85rem" }}>
                      <div className="p-2.5 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-light">
                        🎯 <strong>Micro-Breaks:</strong> Take a 5-minute movement break every 60 minutes of focus time.
                      </div>
                      <div className="p-2.5 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-light">
                        🌙 <strong>Sleep Optimization:</strong> Maintain consistent evening unwind rituals around 10:30 PM.
                      </div>
                      <div className="p-2.5 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-light">
                        ⚡ <strong>Peak Focus Windows:</strong> Your highest productivity occurs between 9:00 AM and 11:30 AM.
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === "quick-action" && (
                  <div className="text-center py-2">
                    <div className="fs-1 text-primary mb-2">⚡</div>
                    <h6 className="fw-bold text-white mb-2">{modalTitle}</h6>
                    <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                      Your entry has been recorded in your workplace wellness log.
                    </p>
                    <span className="badge bg-success bg-opacity-25 text-success px-3 py-2">
                      Successfully Updated
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top border-secondary border-opacity-25">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessionalDashboard;
