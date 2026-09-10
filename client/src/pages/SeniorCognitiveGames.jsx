import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import MemoryMatchGame from "../components/senior/MemoryMatchGame";
import AttentionChallengeGame from "../components/senior/AttentionChallengeGame";
import NumberSequenceGame from "../components/senior/NumberSequenceGame";
import { FiGrid, FiAward, FiPlay, FiSmile, FiActivity, FiClock, FiCheckCircle, FiPieChart } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorCognitiveGames() {
  const [activeTab, setActiveTab] = useState("cognitive-games");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  // Active game view: null | 'memory' | 'attention' | 'number'
  const [activeGame, setActiveGame] = useState(null);

  // Recent Performance History state
  const [gameHistory, setGameHistory] = useState([]);
  const [gameStats, setGameStats] = useState(null);
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
        fetch("http://localhost:5000/api/senior/cognitive-games/results?limit=6", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/senior/cognitive-games/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataHistory = await resHistory.json();
      const dataStats = await resStats.json();

      if (resHistory.ok && dataHistory.success) {
        setGameHistory(dataHistory.data || []);
      }
      if (resStats.ok && dataStats.success) {
        setGameStats(dataStats.data);
      }
    } catch (err) {
      console.error("Error fetching cognitive game history:", err);
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

  const getGameIcon = (type) => {
    if (type === "Memory Match") return "🧠";
    if (type === "Attention Challenge") return "🎯";
    if (type === "Number Sequence") return "🔢";
    return "🎮";
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
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34D399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                🧩 Senior Brain Fitness
              </span>
            </div>
            <h1 className="text-white fw-bold fs-3 mb-1">🧠 Cognitive Games</h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
              Keep your mind active with simple memory, attention and thinking exercises.
            </p>
          </div>
        </div>

        {/* ACTIVE GAME RENDERER */}
        {activeGame === "memory" && (
          <div className="mb-4">
            <MemoryMatchGame
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchHistoryAndStats}
            />
          </div>
        )}

        {activeGame === "attention" && (
          <div className="mb-4">
            <AttentionChallengeGame
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchHistoryAndStats}
            />
          </div>
        )}

        {activeGame === "number" && (
          <div className="mb-4">
            <NumberSequenceGame
              onClose={() => setActiveGame(null)}
              onGameComplete={fetchHistoryAndStats}
            />
          </div>
        )}

        {/* 3 MAIN GAME CARDS GRID */}
        {!activeGame && (
          <div className="row g-4 mb-4">
            {/* Game 1: Memory Match */}
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
                    <span className="fs-2">🧠</span>
                    <span
                      className="badge rounded-pill px-3 py-1"
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34D399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        fontSize: "0.75rem",
                      }}
                    >
                      Difficulty: Easy
                    </span>
                  </div>

                  <h3 className="text-white fw-bold fs-5 mb-2">Memory Match</h3>
                  <p className="text-white-50 mb-4" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                    "Match the same cards and exercise your memory."
                  </p>
                </div>

                <button
                  type="button"
                  className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 w-100"
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    border: "none",
                    fontSize: "0.95rem",
                  }}
                  onClick={() => setActiveGame("memory")}
                >
                  <FiPlay size={16} /> Play Game
                </button>
              </div>
            </div>

            {/* Game 2: Attention Challenge */}
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
                    <span className="fs-2">🎯</span>
                    <span
                      className="badge rounded-pill px-3 py-1"
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#60A5FA",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        fontSize: "0.75rem",
                      }}
                    >
                      Difficulty: Easy
                    </span>
                  </div>

                  <h3 className="text-white fw-bold fs-5 mb-2">Attention Challenge</h3>
                  <p className="text-white-50 mb-4" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                    "Test your attention by identifying patterns and target symbols."
                  </p>
                </div>

                <button
                  type="button"
                  className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 w-100"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    border: "none",
                    fontSize: "0.95rem",
                  }}
                  onClick={() => setActiveGame("attention")}
                >
                  <FiPlay size={16} /> Play Game
                </button>
              </div>
            </div>

            {/* Game 3: Number Sequence */}
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
                    <span
                      className="badge rounded-pill px-3 py-1"
                      style={{
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#C084FC",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        fontSize: "0.75rem",
                      }}
                    >
                      Difficulty: Easy
                    </span>
                  </div>

                  <h3 className="text-white fw-bold fs-5 mb-2">Number Sequence</h3>
                  <p className="text-white-50 mb-4" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                    "Complete simple number patterns and exercise logical thinking."
                  </p>
                </div>

                <button
                  type="button"
                  className="btn px-4 py-2.5 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 w-100"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                    border: "none",
                    fontSize: "0.95rem",
                  }}
                  onClick={() => setActiveGame("number")}
                >
                  <FiPlay size={16} /> Play Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📊 RECENT PERFORMANCE SECTION */}
        <div className="ns-card p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="text-white fw-bold fs-5 mb-0 d-flex align-items-center gap-2">
              <FiPieChart className="text-emerald-400" style={{ color: "#34D399" }} /> 📊 Recent Performance
            </h4>
            {gameStats && (
              <span className="badge bg-secondary bg-opacity-25 text-white-50 small">
                Avg Score: {gameStats.averageScore}%
              </span>
            )}
          </div>

          {loadingHistory ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <p className="text-muted small mb-0">Loading recent performance history...</p>
            </div>
          ) : gameHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted small mb-0">
                No exercise history recorded yet. Choose a game above to start your first cognitive exercise!
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
                    <span className="fs-4">{getGameIcon(item.gameType)}</span>
                    <div>
                      <h5 className="text-white fw-semibold fs-6 mb-0">{item.gameType}</h5>
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
                      {formatDateDisplay(item.playedAt)}
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

export default SeniorCognitiveGames;
