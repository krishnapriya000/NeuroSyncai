import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import RememberSequenceExercise from "../components/senior/RememberSequenceExercise";
import PictureRecallExercise from "../components/senior/PictureRecallExercise";
import WordRecallExercise from "../components/senior/WordRecallExercise";
import { FiCpu, FiPlay, FiCheckCircle, FiClock, FiPieChart } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorMemoryExercises() {
  const [activeTab, setActiveTab] = useState("memory-exercises");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  // Active exercise view: null | 'sequence' | 'picture' | 'word'
  const [activeExercise, setActiveExercise] = useState(null);

  // Performance history & stats state
  const [history, setHistory] = useState([]);
  const [memoryStats, setMemoryStats] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

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

    fetchHistoryAndStats();
  }, []);

  const fetchHistoryAndStats = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoadingHistory(false);
      return;
    }

    try {
      const [resHistory, resStats] = await Promise.all([
        fetch("http://localhost:5000/api/senior/memory-exercises/results?limit=6", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/senior/memory-exercises/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataHistory = await resHistory.json();
      const dataStats = await resStats.json();

      if (resHistory.ok && dataHistory.success) {
        setHistory(dataHistory.data || []);
      }
      if (resStats.ok && dataStats.success) {
        setMemoryStats(dataStats.data);
      }
    } catch (err) {
      console.error("Error fetching memory exercise history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const now = new Date();

    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return "Today";

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getExerciseIcon = (type) => {
    if (type === "Remember the Sequence") return "🔢";
    if (type === "Picture Recall") return "🖼️";
    if (type === "Word Recall") return "📝";
    return "🧠";
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
        {/* Page Heading & Subtitle */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60A5FA",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                🧠 Memory Vitality
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">🧠 Memory Exercises</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
              Strengthen your memory with simple and enjoyable daily exercises.
            </p>
          </div>
        </div>

        {/* ACTIVE EXERCISE RENDERER */}
        {activeExercise === "sequence" && (
          <div className="mb-4">
            <RememberSequenceExercise
              onClose={() => setActiveExercise(null)}
              onExerciseComplete={fetchHistoryAndStats}
            />
          </div>
        )}

        {activeExercise === "picture" && (
          <div className="mb-4">
            <PictureRecallExercise
              onClose={() => setActiveExercise(null)}
              onExerciseComplete={fetchHistoryAndStats}
            />
          </div>
        )}

        {activeExercise === "word" && (
          <div className="mb-4">
            <WordRecallExercise
              onClose={() => setActiveExercise(null)}
              onExerciseComplete={fetchHistoryAndStats}
            />
          </div>
        )}

        {/* 3 MAIN EXERCISE CARDS GRID */}
        {!activeExercise && (
          <div className="row g-4 mb-4">
            {/* Card 1: Remember the Sequence */}
            <div className="col-12 col-md-4">
              <div
                className="ns-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fs-2">🔢</span>
                    <span className="badge bg-secondary bg-opacity-25 text-white-50">Sequence Memory</span>
                  </div>

                  <h3 className="text-white fw-bold fs-5 mb-2">Remember the Sequence</h3>
                  <p className="text-white-50 mb-4" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
                    "Remember the order of symbols and reproduce the sequence."
                  </p>
                </div>

                <button
                  type="button"
                  className="btn w-100 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    border: "none",
                  }}
                  onClick={() => setActiveExercise("sequence")}
                >
                  <FiPlay size={16} /> Start Exercise
                </button>
              </div>
            </div>

            {/* Card 2: Picture Recall */}
            <div className="col-12 col-md-4">
              <div
                className="ns-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fs-2">🖼️</span>
                    <span className="badge bg-secondary bg-opacity-25 text-white-50">Visual Recall</span>
                  </div>

                  <h3 className="text-white fw-bold fs-5 mb-2">Picture Recall</h3>
                  <p className="text-white-50 mb-4" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
                    "Remember the objects you see and identify them later."
                  </p>
                </div>

                <button
                  type="button"
                  className="btn w-100 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    border: "none",
                  }}
                  onClick={() => setActiveExercise("picture")}
                >
                  <FiPlay size={16} /> Start Exercise
                </button>
              </div>
            </div>

            {/* Card 3: Word Recall */}
            <div className="col-12 col-md-4">
              <div
                className="ns-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fs-2">📝</span>
                    <span className="badge bg-secondary bg-opacity-25 text-white-50">Verbal Recall</span>
                  </div>

                  <h3 className="text-white fw-bold fs-5 mb-2">Word Recall</h3>
                  <p className="text-white-50 mb-4" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
                    "Remember a group of words and identify them after a short delay."
                  </p>
                </div>

                <button
                  type="button"
                  className="btn w-100 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                    border: "none",
                  }}
                  onClick={() => setActiveExercise("word")}
                >
                  <FiPlay size={16} /> Start Exercise
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📊 RECENT MEMORY PERFORMANCE SECTION */}
        <div className="ns-card p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
              <FiPieChart className="text-info" /> 📊 Recent Memory Performance
            </h4>
            {memoryStats && (
              <span className="badge bg-secondary bg-opacity-25 text-white-50 small">
                Average Accuracy: {memoryStats.averageAccuracy}%
              </span>
            )}
          </div>

          {loadingHistory ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <p className="text-muted small mb-0">Loading recent memory performance history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted small mb-0">
                No exercise history recorded yet. Choose an exercise above to start your memory practice!
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2.5">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="d-flex align-items-center justify-content-between p-3 rounded-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-4">{getExerciseIcon(item.exerciseType)}</span>
                    <div>
                      <h5 className="text-white fw-semibold fs-6 mb-0">{item.exerciseType}</h5>
                      <span className="text-muted small">
                        Accuracy: {item.accuracy}% • Time: {item.timeTaken}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span
                      className="badge rounded-pill px-3 py-1.5 fw-bold fs-6"
                      style={{
                        background:
                          item.score >= 80
                            ? "rgba(16, 185, 129, 0.2)"
                            : item.score >= 60
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(239, 68, 68, 0.2)",
                        color:
                          item.score >= 80
                            ? "#34D399"
                            : item.score >= 60
                            ? "#FBBF24"
                            : "#FCA5A5",
                        border: `1px solid ${
                          item.score >= 80
                            ? "#10B981"
                            : item.score >= 60
                            ? "#F59E0B"
                            : "#EF4444"
                        }`,
                      }}
                    >
                      {item.score}%
                    </span>

                    <span className="text-muted small" style={{ minWidth: "70px", textAlign: "right" }}>
                      {formatDateDisplay(item.completedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default SeniorMemoryExercises;
