import React, { useState, useEffect } from "react";
import "../styles/studentDashboard.css";

import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import StatCard from "../components/dashboard/StatCard";
import MoodTrackerCard from "../components/dashboard/MoodTrackerCard";
import AICompanionCard from "../components/dashboard/AICompanionCard";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import { FiSmile, FiSun, FiActivity, FiAward } from "react-icons/fi";

function SeniorDashboard() {
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
    setActiveTab("ai-companion");
    alert("Opening NeuroSync Companion for Senior Wellness...");
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
          className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg" 
          style={{ 
            background: "linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%)", 
            border: "1px solid rgba(255, 255, 255, 0.1)" 
          }}
        >
          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-8">
              <span className="badge bg-emerald-500 bg-opacity-25 text-emerald-100 px-3 py-1 rounded-pill mb-2 border border-emerald-400 border-opacity-30">
                👴 Senior Citizen Portal
              </span>
              <h1 className="fw-bold fs-3 mb-2">Welcome, {seniorName.split(" ")[0]}!</h1>
              <p className="text-emerald-100 mb-3" style={{ maxWidth: "600px", fontSize: "0.95rem" }}>
                Keep your mind active with daily cognitive games, memory exercises, gentle health tracking, and friendly AI support.
              </p>
              <button 
                className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-emerald-900 shadow-sm"
                onClick={handleTalkToAI}
              >
                🌿 Chat with AI Companion
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
              title="Brain Training Streak"
              value="12 Days"
              trend="Great consistency!"
              icon={FiAward}
              type="streak"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Cognitive Vitality"
              value="95% Active"
              trend="High sharpness score"
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
