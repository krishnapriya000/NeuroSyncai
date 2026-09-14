import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import RememberSequenceGame from "../components/student/games/RememberSequenceGame";
import PictureRecallGame from "../components/student/games/PictureRecallGame";
import WordRecallGame from "../components/student/games/WordRecallGame";
import { FiCpu, FiAward, FiZap, FiPlay, FiPieChart, FiCheckCircle } from "react-icons/fi";
import "../styles/studentDashboard.css";

function StudentMemoryExercises() {
  const [activeTab, setActiveTab] = useState("memory-exercises");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Selected exercise view: null | 'sequence' | 'picture' | 'word'
  const [activeExercise, setActiveExercise] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");

  // Performance history & Gamification stats from DB
  const [gameHistory, setGameHistory] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchGameStats();
  }, []);

  const fetchGameStats = async () => {
    setLoadingStats(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoadingStats(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/games/results?limit=8", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // Filter memory exercises
        const memoryResults = (json.data.results || []).filter((r) => r.category === "memory");
        setGameHistory(memoryResults);
        setUserStats(json.data.stats);
      }
    } catch (err) {
      console.error("Error fetching student memory exercise results:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const exerciseList = [
    {
      id: "sequence",
      title: "Remember the Sequence",
      icon: "🧠",
      gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
      description: "Display a sequence of shapes for a few seconds, then reproduce the sequence from memory.",
      phases: ["Instructions", "Memorization Phase", "Recall Phase", "Result"],
      tracks: ["Score", "Accuracy", "Level", "Time Taken"],
    },
    {
      id: "picture",
      title: "Picture Recall",
      icon: "🖼️",
      gradient: "linear-gradient(135deg, #EC4899, #8B5CF6)",
      description: "Display several images briefly, hide them, and select the exact images previously shown.",
      phases: ["Instructions", "Memorization Phase", "Recall Phase", "Result"],
      tracks: ["Score", "Correct Answers", "Accuracy", "Time Taken"],
    },
    {
      id: "word",
      title: "Word Recall",
      icon: "📝",
      gradient: "linear-gradient(135deg, #10B981, #3B82F6)",
      description: "Memorize a list of target words for a limited time, then identify them from a word bank grid.",
      phases: ["Instructions", "Memorization Phase", "Recall Phase", "Result"],
      tracks: ["Score", "Accuracy", "Time Taken"],
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
        studentName={studentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#C084FC",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                🎯 Student Memory Center
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-3 mb-1">Memory Exercises</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              Strengthen recall and memory through short interactive exercises.
            </p>
          </div>

          {/* Difficulty Selector */}
          <div className="d-flex align-items-center gap-2 bg-dark p-1.5 rounded-pill border border-secondary border-opacity-25 align-self-start align-self-md-center">
            <span className="text-muted small ps-2 fw-semibold">Difficulty:</span>
            {["Easy", "Medium", "Hard"].map((lvl) => (
              <button
                key={lvl}
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  selectedDifficulty === lvl ? "btn-primary fw-bold" : "btn-outline-secondary text-white border-0"
                }`}
                onClick={() => setSelectedDifficulty(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* GAMIFICATION STATS BANNER */}
        {userStats && userStats.memoryStats && (
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="ns-card p-3 d-flex align-items-center gap-3">
                <div className="fs-1">🧠</div>
                <div>
                  <div className="text-muted small">Memory Exercises Completed</div>
                  <div className="text-white fw-bold fs-5">{userStats.memoryStats.totalPlayed} Exercises</div>
                  <div className="text-purple-300 small" style={{ color: "#C084FC" }}>Active Memory Training</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-4">
              <div className="ns-card p-3 d-flex align-items-center gap-3">
                <div className="fs-1">🎯</div>
                <div>
                  <div className="text-muted small">Memory Recall Accuracy</div>
                  <div className="text-white fw-bold fs-5">{userStats.memoryStats.avgAccuracy}%</div>
                  <div className="text-success small">Avg Recall Accuracy</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-4">
              <div className="ns-card p-3 d-flex align-items-center gap-3">
                <div className="fs-1">⚡</div>
                <div>
                  <div className="text-muted small">Average Memory Score</div>
                  <div className="text-white fw-bold fs-5">{userStats.memoryStats.avgScore} pts</div>
                  <div className="text-warning small">Recall Strength Score</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE EXERCISE RENDERER */}
        {activeExercise === "sequence" && (
          <div className="mb-4">
            <RememberSequenceGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveExercise(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {activeExercise === "picture" && (
          <div className="mb-4">
            <PictureRecallGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveExercise(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {activeExercise === "word" && (
          <div className="mb-4">
            <WordRecallGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveExercise(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {/* 3 MEMORY EXERCISE CARDS GRID */}
        {!activeExercise && (
          <div className="row g-4 mb-4">
            {exerciseList.map((ex) => (
              <div key={ex.id} className="col-12 col-md-4">
                <div
                  className="ns-card p-4 h-100 d-flex flex-column justify-content-between position-relative overflow-hidden shadow-sm hover-lift"
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="fs-1">{ex.icon}</span>
                      <span
                        className="badge rounded-pill px-3 py-1 fw-bold"
                        style={{
                          background: "rgba(139, 92, 246, 0.15)",
                          color: "#C084FC",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          fontSize: "0.75rem",
                        }}
                      >
                        Level: {selectedDifficulty}
                      </span>
                    </div>

                    <h3 className="text-white fw-bold fs-5 mb-2">{ex.title}</h3>
                    <p className="text-white-50 mb-3" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
                      {ex.description}
                    </p>

                    <div className="p-2.5 rounded-3 mb-4 bg-dark bg-opacity-60 border border-secondary border-opacity-25" style={{ fontSize: "0.78rem" }}>
                      <div className="text-muted mb-1 font-monospace">Exercise Flow:</div>
                      <div className="text-purple-300 fw-semibold" style={{ color: "#C084FC" }}>
                        {ex.phases.join(" → ")}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 w-100 shadow"
                    style={{
                      background: ex.gradient,
                      border: "none",
                      fontSize: "0.95rem",
                    }}
                    onClick={() => setActiveExercise(ex.id)}
                  >
                    <FiPlay size={16} /> Start Exercise
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RECENT MEMORY EXERCISES HISTORY */}
        <div className="ns-card p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
              <FiPieChart className="text-primary" /> Recent Memory Exercise Results
            </h4>
            <span className="text-muted small">Live MongoDB records</span>
          </div>

          {loadingStats ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <p className="text-muted small mb-0">Loading recent memory exercise results...</p>
            </div>
          ) : gameHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted small mb-0">
                No memory exercise results recorded yet. Select an exercise above to begin memory recall training!
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2.5">
              {gameHistory.map((item) => (
                <div
                  key={item._id}
                  className="d-flex align-items-center justify-content-between p-3 rounded-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-3">
                      {item.gameType === "remember-sequence" ? "🧠" : item.gameType === "picture-recall" ? "🖼️" : "📝"}
                    </span>
                    <div>
                      <h5 className="text-white fw-semibold fs-6 mb-0 text-capitalize">{item.gameType.replace("-", " ")}</h5>
                      <span className="text-muted small">
                        Difficulty: {item.difficulty} • Accuracy: {item.accuracy}% • Time: {item.timeTaken}s
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-pill px-3 py-1.5 fw-bold bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30">
                      Score: {item.score} pts
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

export default StudentMemoryExercises;
