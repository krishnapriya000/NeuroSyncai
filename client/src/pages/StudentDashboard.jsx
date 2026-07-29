import React, { useState, useEffect } from "react";
import "../styles/studentDashboard.css";

import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import HeroWelcomeCard from "../components/dashboard/HeroWelcomeCard";
import StatCard from "../components/dashboard/StatCard";
import DailyCheckInSummaryCard from "../components/dashboard/DailyCheckInSummaryCard";
import MoodTrackerCard from "../components/dashboard/MoodTrackerCard";
import AICompanionCard from "../components/dashboard/AICompanionCard";
import TasksCard from "../components/dashboard/TasksCard";
import UpcomingExamsCard from "../components/dashboard/UpcomingExamsCard";
import WeeklyProgressCard from "../components/dashboard/WeeklyProgressCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import MotivationCard from "../components/dashboard/MotivationCard";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import { FiSmile, FiZap, FiClock, FiTarget } from "react-icons/fi";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Alex Morgan");

  // Daily Check-in state
  const [checkInState, setCheckInState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const fetchLatestCheckIn = async () => {
    setCheckInState({ loading: true, error: null, data: null });
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setCheckInState({
        loading: false,
        error: "Authentication token missing.",
        data: null,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/dailycheckin/latest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setCheckInState({
          loading: false,
          error: data.message || "Failed to fetch latest check-in data.",
          data: null,
        });
        return;
      }

      setCheckInState({
        loading: false,
        error: null,
        data: data,
      });
    } catch (err) {
      setCheckInState({
        loading: false,
        error: "Cannot connect to backend server.",
        data: null,
      });
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setStudentName(userObj.fullName || userObj.name);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    // Fetch latest check-in data for the logged-in student
    fetchLatestCheckIn();
  }, []);

  const handleTalkToAI = () => {
    setActiveTab("ai-companion");
    alert("Opening NeuroSync AI Chat Companion...");
  };

  const currentMoodDisplay = checkInState.data?.hasData && checkInState.data?.mood
    ? checkInState.data.mood
    : "Calm & Focused";

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Top Navbar */}
      <TopNavbar 
        studentName={studentName} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />

      {/* Main Content Area */}
      <main className="ns-main-content">
        {/* Hero Welcome Card */}
        <HeroWelcomeCard 
          studentName={studentName.split(" ")[0]} 
          onTalkClick={handleTalkToAI} 
        />

        {/* Live Daily Check-in Summary Card */}
        <DailyCheckInSummaryCard 
          loading={checkInState.loading}
          error={checkInState.error}
          data={checkInState.data}
          onRetry={fetchLatestCheckIn}
        />

        {/* 4 Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Today's Mood"
              value={currentMoodDisplay}
              trend="+15% stability"
              icon={FiSmile}
              type="mood"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Current Study Streak"
              value="7 Days"
              trend="Personal Best! 🔥"
              icon={FiZap}
              type="streak"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Focus Time Today"
              value={checkInState.data?.hasData ? checkInState.data.sleepHours : "4h 45m"}
              trend="Sleep & Rest Logged"
              icon={FiClock}
              type="focus"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="Goals Completed"
              value="12 / 15"
              trend="80% completion rate"
              icon={FiTarget}
              type="goals"
            />
          </div>
        </div>

        {/* Row 1: Mood Tracker & AI Companion */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <MoodTrackerCard />
          </div>
          <div className="col-lg-6">
            <AICompanionCard onStartChat={handleTalkToAI} />
          </div>
        </div>

        {/* Row 2: Today's Tasks, Upcoming Exams, Motivation */}
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <TasksCard />
          </div>
          <div className="col-lg-4 col-md-6">
            <UpcomingExamsCard />
          </div>
          <div className="col-lg-4 col-md-12">
            <MotivationCard />
          </div>
        </div>

        {/* Row 3: Weekly Progress (Charts Space) & Quick Actions */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <WeeklyProgressCard />
          </div>
          <div className="col-lg-4">
            <QuickActionsCard onActionSelect={(actionId) => {
              if (actionId === "chat") handleTalkToAI();
            }} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

export default StudentDashboard;
