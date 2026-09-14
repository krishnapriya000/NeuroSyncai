import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studentDashboard.css";

import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import StatCard from "../components/dashboard/StatCard";
import MoodTrackerCard from "../components/dashboard/MoodTrackerCard";
import AICompanionCard from "../components/dashboard/AICompanionCard";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import { FiSmile, FiSun, FiActivity, FiAward, FiCheckSquare, FiClock, FiUsers, FiHeart, FiArrowRight } from "react-icons/fi";

function SeniorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

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
  }, []);

  const handleTalkToAI = () => {
    navigate("/senior/ai-companion");
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
        {/* Hero Section */}
        <div 
          className="p-4 p-md-5 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg" 
          style={{ 
            background: "linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%)", 
            border: "1px solid rgba(255, 255, 255, 0.1)" 
          }}
        >
          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-8">
              <span className="badge bg-emerald-500 bg-opacity-25 text-emerald-100 px-3 py-1.5 rounded-pill mb-2 border border-emerald-400 border-opacity-30">
                👴 Senior Citizen Wellness Portal
              </span>
              <h1 className="fw-extrabold fs-2 mb-2">Welcome, {seniorName.split(" ")[0]}!</h1>
              <p className="text-emerald-100 mb-3" style={{ maxWidth: "620px", fontSize: "1rem", lineHeight: "1.6" }}>
                Need help with your daily wellness? NeuroSync AI Companion can help you with reminders, daily routines, mood support and general wellness guidance.
              </p>
              <button 
                className="btn btn-light rounded-pill px-4 py-2.5 fw-bold text-emerald-900 shadow-sm d-inline-flex align-items-center gap-2"
                onClick={handleTalkToAI}
              >
                🌿 Chat with AI Companion <FiArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Daily Mood"
              value="Cheerful & Peaceful"
              trend="Positive outlook"
              icon={FiSmile}
              type="mood"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Wellness Streak"
              value="12 Days"
              trend="Great consistency!"
              icon={FiAward}
              type="streak"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Daily Activity"
              value="Active & Healthy"
              trend="Optimal score"
              icon={FiActivity}
              type="focus"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Daily Wellness Routines"
              value="4 / 4 Completed"
              trend="100% complete"
              icon={FiSun}
              type="goals"
            />
          </div>
        </div>

        {/* 4 SENIOR QUICK ACTION MODULE CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between cursor-pointer hover-lift"
              onClick={() => navigate("/senior/daily-checkin")}
              style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(16, 185, 129, 0.3)" }}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fs-2">📝</span>
                  <span className="badge bg-emerald-500 bg-opacity-25 text-emerald-100" style={{ fontSize: "0.75rem" }}>Daily</span>
                </div>
                <h5 className="text-white fw-bold fs-6 mb-1">Daily Check-in</h5>
                <p className="text-white-50 small mb-0">Record how you feel, sleep quality, and daily energy.</p>
              </div>
              <div className="mt-3 text-emerald-400 fw-semibold small d-flex align-items-center gap-1">
                Start Check-in <FiArrowRight />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between cursor-pointer hover-lift"
              onClick={() => navigate("/senior/medications")}
              style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(245, 158, 11, 0.3)" }}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fs-2">💊</span>
                  <span className="badge bg-warning bg-opacity-25 text-warning" style={{ fontSize: "0.75rem" }}>Reminders</span>
                </div>
                <h5 className="text-white fw-bold fs-6 mb-1">Medications</h5>
                <p className="text-white-50 small mb-0">View today's medicine reminders & mark as taken.</p>
              </div>
              <div className="mt-3 text-warning fw-semibold small d-flex align-items-center gap-1">
                View Medicines <FiArrowRight />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between cursor-pointer hover-lift"
              onClick={() => navigate("/senior/health-activity")}
              style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(59, 130, 246, 0.3)" }}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fs-2">📊</span>
                  <span className="badge bg-primary bg-opacity-25 text-primary" style={{ fontSize: "0.75rem" }}>Activity</span>
                </div>
                <h5 className="text-white fw-bold fs-6 mb-1">Health & Activity</h5>
                <p className="text-white-50 small mb-0">Log steps, sleep, hydration, and optional vitals.</p>
              </div>
              <div className="mt-3 text-primary fw-semibold small d-flex align-items-center gap-1">
                Log Activity <FiArrowRight />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="ns-card p-3.5 h-100 d-flex flex-column justify-content-between cursor-pointer hover-lift"
              onClick={() => navigate("/senior/family-emergency")}
              style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fs-2">👨‍👩‍👧</span>
                  <span className="badge bg-danger bg-opacity-25 text-danger" style={{ fontSize: "0.75rem" }}>Emergency</span>
                </div>
                <h5 className="text-white fw-bold fs-6 mb-1">Family & Emergency</h5>
                <p className="text-white-50 small mb-0">Manage trusted contacts and quick SOS help.</p>
              </div>
              <div className="mt-3 text-danger fw-semibold small d-flex align-items-center gap-1">
                Emergency Hub <FiArrowRight />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <MoodTrackerCard />
          </div>
          <div className="col-lg-6">
            <AICompanionCard onStartChat={handleTalkToAI} />
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default SeniorDashboard;
