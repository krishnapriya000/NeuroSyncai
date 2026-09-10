import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiSun, FiCheck, FiHeart, FiDroplet, FiSmile } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorDailyWellness() {
  const [activeTab, setActiveTab] = useState("daily-wellness");
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

  const routines = [
    { id: 1, title: "Morning Stretch & Breathing", icon: "🌅", time: "8:00 AM", done: true },
    { id: 2, title: "Hydration Check (4 Glasses)", icon: "💧", time: "12:00 PM", done: true },
    { id: 3, title: "15-Minute Gentle Walk", icon: "🚶‍♂️", time: "4:00 PM", done: false },
    { id: 4, title: "Evening Mindful Meditation", icon: "🧘‍♀️", time: "8:00 PM", done: false },
  ];

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
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34D399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                🌿 Senior Routine Tracker
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">Daily Wellness</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
              Track gentle health habits, hydration, and movement to maintain everyday vitality.
            </p>
          </div>
        </div>

        <div className="ns-card p-4 mb-4">
          <h4 className="text-white fw-bold fs-5 mb-3">Today's Wellness Checklist</h4>
          <div className="d-flex flex-column gap-3">
            {routines.map((item) => (
              <div
                key={item.id}
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{
                  background: item.done ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  border: item.done ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="fs-4">{item.icon}</span>
                  <div>
                    <h5 className="text-white fw-semibold fs-6 mb-0">{item.title}</h5>
                    <span className="text-muted small">{item.time}</span>
                  </div>
                </div>

                <span
                  className="badge rounded-pill px-3 py-1.5 fw-semibold"
                  style={{
                    background: item.done ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                    color: item.done ? "#34D399" : "#FBBF24",
                  }}
                >
                  {item.done ? "✓ Completed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default SeniorDailyWellness;
