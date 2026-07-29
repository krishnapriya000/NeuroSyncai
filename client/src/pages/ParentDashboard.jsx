import React, { useState, useEffect } from "react";
import "../styles/studentDashboard.css";

import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import StatCard from "../components/dashboard/StatCard";
import MoodTrackerCard from "../components/dashboard/MoodTrackerCard";
import AICompanionCard from "../components/dashboard/AICompanionCard";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import { FiUsers, FiHeart, FiShield, FiActivity } from "react-icons/fi";

function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setParentName(userObj.fullName || userObj.name);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
  }, []);

  const handleTalkToAI = () => {
    setActiveTab("ai-companion");
    alert("Opening NeuroSync Family Wellness Companion...");
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
        {/* Hero Section */}
        <div 
          className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg" 
          style={{ 
            background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)", 
            border: "1px solid rgba(255, 255, 255, 0.1)" 
          }}
        >
          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-8">
              <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
                👨‍👩‍👧 Parent Portal
              </span>
              <h1 className="fw-bold fs-3 mb-2">Welcome, {parentName.split(" ")[0]}!</h1>
              <p className="text-indigo-200 mb-3" style={{ maxWidth: "600px", fontSize: "0.95rem" }}>
                Monitor family well-being, track emotional health insights, and access parental guidance powered by NeuroSync AI.
              </p>
              <button 
                className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-indigo-900 shadow-sm"
                onClick={handleTalkToAI}
              >
                🤖 Consult Parenting AI Companion
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Family Harmony"
              value="88% Positive"
              trend="+5% this week"
              icon={FiHeart}
              type="mood"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Active Dependents"
              value="2 Tracked"
              trend="All synced"
              icon={FiUsers}
              type="streak"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Screen Time Balance"
              value="3h 20m avg"
              trend="Optimal range"
              icon={FiActivity}
              type="focus"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Safety & Mental Alerts"
              value="0 Critical"
              trend="All clear 🛡️"
              icon={FiShield}
              type="goals"
            />
          </div>
        </div>

        {/* Main Grid Content */}
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

export default ParentDashboard;
