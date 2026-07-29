import React, { useState, useEffect } from "react";
import "../styles/studentDashboard.css";

import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import StatCard from "../components/dashboard/StatCard";
import MoodTrackerCard from "../components/dashboard/MoodTrackerCard";
import AICompanionCard from "../components/dashboard/AICompanionCard";
import WeeklyProgressCard from "../components/dashboard/WeeklyProgressCard";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import { FiBriefcase, FiZap, FiClock, FiCheckCircle } from "react-icons/fi";

function ProfessionalDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profName, setProfName] = useState("Professional User");

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
  }, []);

  const handleTalkToAI = () => {
    setActiveTab("ai-companion");
    alert("Opening NeuroSync Executive Stress Companion...");
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
        studentName={profName} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />

      <main className="ns-main-content">
        {/* Hero Section */}
        <div 
          className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg" 
          style={{ 
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)", 
            border: "1px solid rgba(255, 255, 255, 0.1)" 
          }}
        >
          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-8">
              <span className="badge bg-primary bg-opacity-25 text-blue-300 px-3 py-1 rounded-pill mb-2 border border-blue-400 border-opacity-30">
                💼 Working Professional Portal
              </span>
              <h1 className="fw-bold fs-3 mb-2">Welcome back, {profName.split(" ")[0]}!</h1>
              <p className="text-gray-300 mb-3" style={{ maxWidth: "600px", fontSize: "0.95rem" }}>
                Optimize work performance, manage workplace stress, prevent burnout, and track deep work focus blocks.
              </p>
              <button 
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                onClick={handleTalkToAI}
              >
                💼 Start Stress Reduction Session
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Workplace Energy"
              value="84% High"
              trend="Optimal productivity"
              icon={FiZap}
              type="streak"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Deep Work Focus"
              value="5h 15m"
              trend="+45m vs average"
              icon={FiClock}
              type="focus"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Stress Resilience"
              value="Low Stress"
              trend="92% balance score"
              icon={FiBriefcase}
              type="mood"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Projects Completed"
              value="9 / 10"
              trend="90% completion"
              icon={FiCheckCircle}
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

        <div className="row g-4 mb-4">
          <div className="col-12">
            <WeeklyProgressCard />
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ProfessionalDashboard;
