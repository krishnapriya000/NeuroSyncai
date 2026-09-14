import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiArrowLeft, FiEye, FiCheck, FiRotateCcw } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const SHAPES = ["🔺", "🔵", "🟢", "⭐", "🟡", "🟣", "⬛", "🌙"];

function RememberSequenceGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState("instructions"); // instructions | memorizing | recall | completed
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetSequence, setTargetSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [memorizeCountdown, setMemorizeCountdown] = useState(4);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);
  const memorizeTimerRef = useRef(null);

  const sequenceLength = difficulty === "Hard" ? currentLevel + 3 : difficulty === "Medium" ? currentLevel + 2 : currentLevel + 1;
  const totalLevels = 5;

  useEffect(() => {
    if (gameState === "memorizing" || gameState === "recall") {
      timerRef.current = setInterval(() => {
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const generateSequence = (len) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    }
    return seq;
  };

  const startLevel = (lvl) => {
    const len = difficulty === "Hard" ? lvl + 3 : difficulty === "Medium" ? lvl + 2 : lvl + 1;
    const seq = generateSequence(len);
    setTargetSequence(seq);
    setUserSequence([]);
    setGameState("memorizing");
    setMemorizeCountdown(4);

    memorizeTimerRef.current = setInterval(() => {
      setMemorizeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(memorizeTimerRef.current);
          setGameState("recall");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTimeTaken(0);
    startLevel(1);
  };

  const handleItemClick = (item) => {
    if (gameState !== "recall") return;

    const newSeq = [...userSequence, item];
    setUserSequence(newSeq);

    const stepIdx = newSeq.length - 1;
    if (newSeq[stepIdx] !== targetSequence[stepIdx]) {
      // Wrong item picked
      setWrongAnswers((prev) => prev + 1);
      setTimeout(() => checkNextLevel(false), 500);
      return;
    }

    if (newSeq.length === targetSequence.length) {
      // Completed level correctly!
      setScore((prev) => prev + (difficulty === "Hard" ? 30 : difficulty === "Medium" ? 20 : 15));
      setCorrectAnswers((prev) => prev + 1);
      setTimeout(() => checkNextLevel(true), 500);
    }
  };

  const checkNextLevel = (passed) => {
    if (currentLevel < totalLevels) {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      startLevel(nextLvl);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState("completed");
    clearInterval(timerRef.current);
    clearInterval(memorizeTimerRef.current);

    const accuracyVal = Math.round((correctAnswers / totalLevels) * 100);

    const payload = {
      gameType: "remember-sequence",
      category: "memory",
      difficulty,
      score,
      accuracy: accuracyVal,
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
      console.error("Error saving remember sequence result:", e);
      setResultData({ ...payload, pointsEarned: score });
    }

    if (onGameComplete) onGameComplete();
  };

  return (
    <div className="ns-card p-4 p-md-5 rounded-4 border border-secondary border-opacity-25" style={{ background: "rgba(15, 23, 42, 0.95)" }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-light rounded-circle p-2" onClick={onClose} title="Back to Exercises">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-white fw-bold mb-0">🧠 Remember the Sequence</h3>
            <span className="text-muted small">Memorize the shape sequence and reproduce it from memory</span>
          </div>
        </div>

        {gameState === "instructions" && (
          <div className="d-flex align-items-center gap-2">
            {["Easy", "Medium", "Hard"].map((lvl) => (
              <button
                key={lvl}
                className={`btn btn-sm ${difficulty === lvl ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setDifficulty(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}

        {(gameState === "memorizing" || gameState === "recall") && (
          <div className="d-flex align-items-center gap-4">
            <div className="text-white fw-bold d-flex align-items-center gap-1 fs-6">
              <FiClock className="text-purple-400" /> {timeTaken}s
            </div>
            <span className="badge bg-primary px-3 py-1 rounded-pill">
              Level {currentLevel} / {totalLevels}
            </span>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS */}
      {gameState === "instructions" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-3">👁️</div>
          <h4 className="text-white fw-bold mb-2">How to Play</h4>
          <p className="text-white-50 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            <strong>Phase 1 (Memorize):</strong> A sequence will appear for a few seconds. Watch closely and remember the order.<br/>
            <strong>Phase 2 (Recall):</strong> The sequence disappears. Click the shapes in the exact order shown.
          </p>
          <button
            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow"
            onClick={handleStartGame}
          >
            <FiPlay className="me-2" /> Start Exercise
          </button>
        </div>
      )}

      {/* MEMORIZATION PHASE */}
      {gameState === "memorizing" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "600px" }}>
          <div className="d-flex align-items-center justify-content-center gap-2 text-warning fw-bold mb-3 fs-5">
            <FiEye /> Memorization Phase — {memorizeCountdown}s
          </div>

          <div
            className="p-4 mb-4 rounded-4 d-flex align-items-center justify-content-center gap-3 flex-wrap shadow-inner"
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              minHeight: "120px",
            }}
          >
            {targetSequence.map((item, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center justify-content-center rounded-3 bg-dark border border-warning border-opacity-40 fs-2 fw-bold text-white shadow-sm"
                style={{ width: "64px", height: "64px" }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECALL PHASE */}
      {gameState === "recall" && (
        <div className="py-2 text-center mx-auto" style={{ maxWidth: "600px" }}>
          <div className="text-white fw-bold mb-3 fs-5">
            Recall Phase: Click the shapes in order ({userSequence.length} / {targetSequence.length})
          </div>

          {/* User Built Sequence Slots */}
          <div
            className="p-3 mb-4 rounded-4 d-flex align-items-center justify-content-center gap-2 flex-wrap"
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              minHeight: "80px",
            }}
          >
            {targetSequence.map((_, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center justify-content-center rounded-3 bg-dark border border-secondary border-opacity-30 fs-3 fw-bold text-white"
                style={{ width: "50px", height: "50px" }}
              >
                {userSequence[idx] || "?"}
              </div>
            ))}
          </div>

          {/* Selection Palette */}
          <div className="row g-2 justify-content-center">
            {SHAPES.map((shape, idx) => (
              <div key={idx} className="col-3 col-sm-2">
                <button
                  className="btn btn-outline-secondary p-3 w-100 rounded-3 fs-2 bg-dark border border-secondary border-opacity-25"
                  onClick={() => handleItemClick(shape)}
                >
                  {shape}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT MODAL */}
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

export default RememberSequenceGame;
