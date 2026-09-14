import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import PatternRecognitionGame from "../components/student/games/PatternRecognitionGame";
import AttentionChallengeGame from "../components/student/games/AttentionChallengeGame";
import NumberSequenceGame from "../components/student/games/NumberSequenceGame";
import ProblemSolvingGame from "../components/student/games/ProblemSolvingGame";
import QuickThinkingGame from "../components/student/games/QuickThinkingGame";
import { FiLayers, FiAward, FiZap, FiPlay, FiPieChart, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import "../styles/studentDashboard.css";

function StudentCognitiveGames() {
  const [activeTab, setActiveTab] = useState("cognitive-games");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Selected game runner view: null | 'pattern' | 'attention' | 'number' | 'problem' | 'quick'
  const [activeGame, setActiveGame] = useState(null);
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
        setGameHistory(json.data.results || []);
        setUserStats(json.data.stats);
      }
    } catch (err) {
      console.error("Error fetching student game results:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const gamesList = [
    {
      id: "pattern",
      title: "Pattern Recognition",
      icon: "🧩",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
      description: "Analyze shape & symbol sequences and identify the next item in the logical pattern.",
      tracks: ["Score", "Correct Answers", "Wrong Answers", "Accuracy", "Time Taken"],
    },
    {
      id: "attention",
      title: "Attention Challenge",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
      description: "Scan complex object grids rapidly and identify target items under visual pressure.",
      tracks: ["Score", "Accuracy", "Reaction Time", "Time Taken"],
    },
    {
      id: "number",
      title: "Number Sequence",
      icon: "🔢",
      gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
      description: "Solve numerical progressions, arithmetic series, and missing number logic puzzles.",
      tracks: ["Score", "Correct Answers", "Accuracy", "Time Taken"],
    },
    {
      id: "problem",
      title: "Problem Solving",
      icon: "💡",
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
      description: "tackle analytical reasoning problems and multi-step brain riddles.",
      tracks: ["Score", "Accuracy", "Time Taken"],
    },
    {
      id: "quick",
      title: "Quick Thinking",
      icon: "⚡",
      gradient: "linear-gradient(135deg, #EC4899, #BE185D)",
      description: "Rapid-fire true/false math and logic sprint under 5-second question timers.",
      tracks: ["Score", "Accuracy", "Response Time"],
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
                🧠 Student Cognitive Hub
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-3 mb-1">Cognitive Games</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              Train your focus, thinking speed and problem-solving skills through short interactive challenges.
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
        {userStats && (
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ns-card p-3 d-flex align-items-center gap-3">
                <div className="fs-1">🏆</div>
                <div>
                  <div className="text-muted small">Level {userStats.level}</div>
                  <div className="text-white fw-bold fs-6">{userStats.levelTitle}</div>
                  <div className="text-purple-300 small fw-semibold" style={{ color: "#C084FC" }}>
                    {userStats.totalPoints} Total XP
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ns-card p-3 d-flex align-items-center gap-3">
                <div className="fs-1">🔥</div>
                <div>
                  <div className="text-muted small">Daily Streak</div>
                  <div className="text-white fw-bold fs-5">{userStats.currentStreak} Days</div>
                  <div className="text-warning small">Active Streak</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ns-card p-3 d-flex align-items-center gap-3">
                <div className="fs-1">🎯</div>
                <div>
                  <div className="text-muted small">Average Accuracy</div>
                  <div className="text-white fw-bold fs-5">{userStats.averageAccuracy}%</div>
                  <div className="text-success small">Avg Score: {userStats.averageScore} pts</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ns-card p-3 d-flex align-items-center gap-3">
                <div className="fs-1">🎮</div>
                <div>
                  <div className="text-muted small">Total Games Played</div>
                  <div className="text-white fw-bold fs-5">{userStats.totalGamesPlayed} Games</div>
                  <div className="text-primary small">Best: {userStats.bestScore} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE GAME RENDERER */}
        {activeGame === "pattern" && (
          <div className="mb-4">
            <PatternRecognitionGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {activeGame === "attention" && (
          <div className="mb-4">
            <AttentionChallengeGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {activeGame === "number" && (
          <div className="mb-4">
            <NumberSequenceGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {activeGame === "problem" && (
          <div className="mb-4">
            <ProblemSolvingGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {activeGame === "quick" && (
          <div className="mb-4">
            <QuickThinkingGame
              initialDifficulty={selectedDifficulty}
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchGameStats}
            />
          </div>
        )}

        {/* 5 COGNITIVE GAME CARDS GRID */}
        {!activeGame && (
          <div className="row g-4 mb-4">
            {gamesList.map((game) => (
              <div key={game.id} className="col-12 col-md-6 col-xl-4">
                <div
                  className="ns-card p-4 h-100 d-flex flex-column justify-content-between position-relative overflow-hidden shadow-sm hover-lift"
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="fs-1">{game.icon}</span>
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

                    <h3 className="text-white fw-bold fs-5 mb-2">{game.title}</h3>
                    <p className="text-white-50 mb-3" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
                      {game.description}
                    </p>

                    <div className="d-flex flex-wrap gap-1 mb-4">
                      {game.tracks.map((t, idx) => (
                        <span key={idx} className="badge bg-dark bg-opacity-60 text-muted border border-secondary border-opacity-25" style={{ fontSize: "0.7rem" }}>
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 w-100 shadow"
                    style={{
                      background: game.gradient,
                      border: "none",
                      fontSize: "0.95rem",
                    }}
                    onClick={() => setActiveGame(game.id)}
                  >
                    <FiPlay size={16} /> Start Game
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RECENT COGNITIVE PERFORMANCE HISTORY */}
        <div className="ns-card p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
              <FiPieChart className="text-primary" /> Recent Game Results
            </h4>
            <span className="text-muted small">Live MongoDB records</span>
          </div>

          {loadingStats ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <p className="text-muted small mb-0">Loading recent game results...</p>
            </div>
          ) : gameHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted small mb-0">
                No cognitive game results recorded yet. Choose a game above to start your first challenge!
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
                      {item.gameType === "pattern-recognition" ? "🧩" : item.gameType === "attention-challenge" ? "🎯" : item.gameType === "number-sequence" ? "🔢" : item.gameType === "problem-solving" ? "💡" : "⚡"}
                    </span>
                    <div>
                      <h5 className="text-white fw-semibold fs-6 mb-0 text-capitalize">{item.gameType.replace("-", " ")}</h5>
                      <span className="text-muted small">
                        Difficulty: {item.difficulty} • Accuracy: {item.accuracy}% • Time: {item.timeTaken}s
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-pill px-3 py-1.5 fw-bold bg-primary text-white">
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

export default StudentCognitiveGames;
