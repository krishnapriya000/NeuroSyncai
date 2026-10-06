import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiArrowLeft, FiTarget } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const ITEMS = ["🍎", "🍌", "🍇", "🍊", "🍓", "🫐", "🍒", "🍍", "🥑", "🍉", "🍋", "🥝"];

function AttentionChallengeGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState("instructions"); // instructions | playing | completed
  const [currentRound, setCurrentRound] = useState(0);
  const [gridItems, setGridItems] = useState([]);
  const [targetItem, setTargetItem] = useState("");
  const [targetCount, setTargetCount] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [resultData, setResultData] = useState(null);

  const totalRounds = 5;
  const gridSize = difficulty === "Hard" ? 16 : difficulty === "Medium" ? 12 : 9;

  const timerRef = useRef(null);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const generateRound = () => {
    const mainTarget = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setTargetItem(mainTarget);

    let distractors = ITEMS.filter((item) => item !== mainTarget);
    let items = [];

    // Ensure at least 1 target exists
    const targetIdx = Math.floor(Math.random() * gridSize);
    for (let i = 0; i < gridSize; i++) {
      if (i === targetIdx) {
        items.push(mainTarget);
      } else {
        const distractor = distractors[Math.floor(Math.random() * distractors.length)];
        items.push(distractor);
      }
    }

    setGridItems(items);
  };

  const handleStartGame = () => {
    setGameState("playing");
    setCurrentRound(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTimeTaken(0);
    generateRound();
  };

  const handleTileClick = (item) => {
    if (item === targetItem) {
      setScore((prev) => prev + (difficulty === "Hard" ? 25 : difficulty === "Medium" ? 18 : 12));
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    if (currentRound + 1 < totalRounds) {
      setCurrentRound((prev) => prev + 1);
      generateRound();
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState("completed");
    clearInterval(timerRef.current);

    const finalCorrect = correctAnswers + (gridItems[0] === targetItem ? 1 : 0); // approx
    const accuracyVal = Math.round((correctAnswers / totalRounds) * 100);

    const payload = {
      gameType: "attention-challenge",
      category: "cognitive",
      difficulty,
      score,
      accuracy: Math.min(100, accuracyVal),
      correctAnswers,
      wrongAnswers,
      timeTaken,
    };

    try {
      const token = localStorage.getItem("neurosync_token");
      const res = await fetch("http://localhost:5000/api/games/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResultData(data.data);
      } else {
        setResultData({ ...payload, pointsEarned: score });
      }
    } catch (e) {
      console.error("Error saving attention challenge result:", e);
      setResultData({ ...payload, pointsEarned: score });
    }

    if (onGameComplete) onGameComplete();
  };

  return (
    <div className="ns-card p-4 p-md-5 rounded-4 shadow-sm">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary rounded-circle p-2 btn-animated" onClick={onClose} title="Back to Games">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-theme-primary fw-bold mb-0">🎯 Attention Challenge</h3>
            <span className="text-theme-secondary small">Spot and select the target item as quickly as possible</span>
          </div>
        </div>

        {gameState === "instructions" && (
          <div className="d-flex align-items-center gap-2">
            {["Easy", "Medium", "Hard"].map((lvl) => (
              <button
                key={lvl}
                className={`btn btn-sm rounded-pill px-3 ${difficulty === lvl ? "btn-primary fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setDifficulty(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}

        {gameState === "playing" && (
          <div className="d-flex align-items-center gap-4">
            <div className="text-theme-primary fw-bold d-flex align-items-center gap-1.5 fs-6">
              <FiClock className="text-purple-500" /> {timeTaken}s
            </div>
            <span className="badge bg-primary px-3 py-1.5 rounded-pill fw-bold">
              Round {currentRound + 1} / {totalRounds}
            </span>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS VIEW */}
      {gameState === "instructions" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-3 ns-float-icon">🎯</div>
          <h4 className="text-theme-primary fw-bold mb-2">How to Play</h4>
          <p className="text-theme-secondary mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            A target item will be displayed at the top. Scan the grid quickly and click on the target item before time runs out!
          </p>
          <div className="d-flex justify-content-center gap-3 mb-4">
            <div className="p-3 rounded-3 ns-stat-card-item flex-grow-1 text-center">
              <div className="text-theme-secondary small mb-1">Difficulty</div>
              <div className="text-primary fw-bold">{difficulty}</div>
            </div>
            <div className="p-3 rounded-3 ns-stat-card-item flex-grow-1 text-center">
              <div className="text-theme-secondary small mb-1">Grid Size</div>
              <div className="text-theme-primary fw-bold">{gridSize} Tiles</div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow btn-animated"
            onClick={handleStartGame}
          >
            <FiPlay className="me-2" /> Start Game
          </button>
        </div>
      )}

      {/* PLAYING VIEW */}
      {gameState === "playing" && (
        <div className="py-2 text-center mx-auto" style={{ maxWidth: "500px" }}>
          {/* Target Display */}
          <div className="p-3 mb-4 rounded-4 ns-score-hero-card d-flex align-items-center justify-content-center gap-3">
            <span className="text-theme-secondary fw-semibold">Target to click:</span>
            <span className="fs-2">{targetItem}</span>
          </div>

          {/* Grid of options */}
          <div className={`row g-2 justify-content-center`}>
            {gridItems.map((item, idx) => (
              <div
                key={idx}
                className={gridSize === 16 ? "col-3" : gridSize === 12 ? "col-3" : "col-4"}
              >
                <button
                  className="btn btn-outline-secondary p-3 w-100 rounded-3 fs-2 ns-stat-card-item shadow-sm btn-animated"
                  style={{ minHeight: "75px" }}
                  onClick={() => handleTileClick(item)}
                >
                  {item}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETED RESULT MODAL */}
      {gameState === "completed" && resultData && (
        <GameResultModal
          result={resultData}
          onPlayAgain={handleStartGame}
          onBackToHub={onClose}
        />
      )}
    </div>
  );
}

export default AttentionChallengeGame;
