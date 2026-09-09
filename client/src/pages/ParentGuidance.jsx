import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiCompass,
  FiBookOpen,
  FiSmile,
  FiClock,
  FiShield,
  FiAward,
  FiArrowRight
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentGuidance() {
  const [activeTab, setActiveTab] = useState("guidance");
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

  const guidanceTopics = [
    {
      id: 1,
      title: "Managing Academic & Exam Stress",
      category: "Emotional Wellbeing",
      icon: FiSmile,
      color: "text-primary",
      description: "Learn how to help your child navigate test anxiety and build positive study confidence.",
    },
    {
      id: 2,
      title: "Healthy Screen Time & Digital Habits",
      category: "Routines",
      icon: FiClock,
      color: "text-info",
      description: "Practical guidelines for establishing balanced device usage without arguments.",
    },
    {
      id: 3,
      title: "Open Parent-Child Communication",
      category: "Communication",
      icon: FiCompass,
      color: "text-success",
      description: "Effective active listening techniques to encourage your child to share their feelings.",
    },
    {
      id: 4,
      title: "Building Restorative Sleep Habits",
      category: "Health & Sleep",
      icon: FiShield,
      color: "text-warning",
      description: "Why bedtime consistency matters for cognitive development and emotional resilience.",
    },
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
        studentName={parentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header */}
        <div className="mb-4">
          <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
            🧩 Parenting Guidance
          </span>
          <h1 className="fw-bold text-white fs-3 mb-1">Parenting Guidance & Wellness Resources</h1>
          <p className="text-secondary small mb-0">Curated parenting strategies, emotional wellness guides, and communication tips.</p>
        </div>

        {/* Hero Guidance Card */}
        <div
          className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2">
                💡 Featured Strategy
              </span>
              <h2 className="fw-bold fs-4 mb-2">The Power of 10-Minute Daily Check-ins</h2>
              <p className="text-indigo-200 small mb-3">
                Research shows that spending 10 undistracted minutes talking with your child about non-academic interests significantly increases their emotional security and stress tolerance.
              </p>
              <button
                className="btn btn-light rounded-pill px-4 py-2 text-sm fw-semibold text-indigo-900 shadow-sm"
                onClick={() => alert("Opening full parenting guide...")}
              >
                Read Full Article <FiArrowRight className="ms-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Guidance Topic Grid */}
        <h5 className="fw-bold text-white mb-3">Parenting Support Categories</h5>
        <div className="row g-3 mb-4">
          {guidanceTopics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="col-12 col-md-6">
                <div
                  className="p-4 rounded-4 text-white h-100 shadow-sm d-flex flex-column justify-content-between"
                  style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge bg-dark text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1 text-xs">
                        {item.category}
                      </span>
                      <Icon className={`${item.color} fs-4`} />
                    </div>
                    <h5 className="fw-bold mb-2 text-white fs-6">{item.title}</h5>
                    <p className="text-secondary small mb-3">{item.description}</p>
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm text-white rounded-pill w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => alert(`Exploring ${item.title}...`)}
                  >
                    View Insights <FiArrowRight />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentGuidance;
