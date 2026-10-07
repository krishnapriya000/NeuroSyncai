import { API_BASE_URL } from "../../../utils/apiConfig.js";
import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiHelpCircle, FiCheck, FiX, FiArrowLeft } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const PATTERN_QUESTIONS = {
  Easy: [
    { sequence: ["🔺", "🔵", "🔺", "🔵", "🔺"], options: ["🔵", "🔺", "⭐", "🟢"], answer: "🔵" },
    { sequence: ["🟢", "🟢", "🟡", "🟢", "🟢"], options: ["🟡", "🟢", "🔴", "🔵"], answer: "🟡" },
    { sequence: ["⭐", "🌙", "⭐", "🌙", "⭐"], options: ["⭐", "🌙", "☀️", "⚡"], answer: "🌙" },
    { sequence: ["🍎", "🍌", "🍎", "🍌", "🍎"], options: ["🍊", "🍌", "🍎", "🍇"], answer: "🍌" },
    { sequence: ["1", "2", "3", "1", "2"], options: ["3", "1", "4", "2"], answer: "3" },
  ],
  Medium: [
    { sequence: ["🔺", "🔺", "🔵", "🔺", "🔺"], options: ["🔵", "🔺", "🟢", "🟡"], answer: "🔵" },
    { sequence: ["⬛", "⬜", "⬛", "⬛", "⬜"], options: ["⬛", "⬜", "🔺", "🔵"], answer: "⬛" },
    { sequence: ["🔴", "🟢", "🔵", "🔴", "🟢"], options: ["🔴", "🟢", "🔵", "🟡"], answer: "🔵" },
    { sequence: ["2", "4", "6", "8", "10"], options: ["11", "12", "14", "10"], answer: "12" },
    { sequence: ["⬆️", "➡️", "⬇️", "⬅️", "⬆️"], options: ["⬆️", "➡️", "⬇️", "⬅️"], answer: "➡️" },
  ],
  Hard: [
    { sequence: ["1", "1", "2", "3", "5"], options: ["7", "8", "9", "6"], answer: "8" },
    { sequence: ["🔴", "🔴", "🔵", "🔴", "🔴", "🔵", "🔴"], options: ["🔴", "🔵", "🟡", "🟢"], answer: "🔴" },
    { sequence: ["⬆️", "↗️", "➡️", "↘️", "⬇️"], options: ["↙️", "⬅️", "↖️", "⬆️"], answer: "↙️" },
    { sequence: ["3", "9", "27", "81"], options: ["162", "243", "324", "100"], answer: "243" },
    { sequence: ["▲", "▼", "▲", "▲", "▼", "▲", "▲"], options: ["▲", "▼", "◼", "◆"], answer: "▼" },
  ],
};

function PatternRecognitionGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState("instructions"); // instructions | playing | completed
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);

  const questions = PATTERN_QUESTIONS[difficulty] || PATTERN_QUESTIONS.Easy;

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

  const handleStartGame = () => {
    setGameState("playing");
    setCurrentRound(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTimeTaken(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const q = questions[currentRound];
    const correct = option === q.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + (difficulty === "Hard" ? 20 : difficulty === "Medium" ? 15 : 10));
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentRound + 1 < questions.length) {
        setCurrentRound((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        finishGame();
      }
    }, 1200);
  };

  const finishGame = async () => {
    setGameState("completed");
    clearInterval(timerRef.current);

    const totalQuestions = questions.length;
    const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
    const finalWrong = totalQuestions - finalCorrect;
    const accuracyVal = Math.round((finalCorrect / totalQuestions) * 100);
    const finalScore = score + (isCorrect ? (difficulty === "Hard" ? 20 : difficulty === "Medium" ? 15 : 10) : 0);

    const payload = {
      gameType: "pattern-recognition",
      category: "cognitive",
      difficulty,
      score: finalScore,
      accuracy: accuracyVal,
      correctAnswers: finalCorrect,
      wrongAnswers: finalWrong,
      timeTaken,
    };

    try {
      const token = localStorage.getItem("neurosync_token");
      const res = await fetch(`${API_BASE_URL}/api/games/results`, {
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
        setResultData({ ...payload, pointsEarned: finalScore });
      }
    } catch (e) {
      console.error("Error saving pattern recognition result:", e);
      setResultData({ ...payload, pointsEarned: finalScore });
    }

    if (onGameComplete) onGameComplete();
  };

  const currentQ = questions[currentRound];

  return (
    <div className="ns-card p-4 p-md-5 rounded-4 shadow-sm">
      {/* Top Header Controls */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary rounded-circle p-2 btn-animated" onClick={onClose} title="Back to Games">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-theme-primary fw-bold mb-0">🧩 Pattern Recognition</h3>
            <span className="text-theme-secondary small">Identify the next item in the logical pattern</span>
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
              Round {currentRound + 1} / {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS VIEW */}
      {gameState === "instructions" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-3 ns-float-icon">🧩</div>
          <h4 className="text-theme-primary fw-bold mb-2">How to Play</h4>
          <p className="text-theme-secondary mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            Examine the pattern sequence displayed on the screen. Select the correct item that logically follows next. Answer quickly and accurately to maximize your score!
          </p>
          <div className="d-flex justify-content-center gap-3 mb-4">
            <div className="p-3 rounded-3 ns-stat-card-item flex-grow-1 text-center">
              <div className="text-theme-secondary small mb-1">Difficulty</div>
              <div className="text-primary fw-bold">{difficulty}</div>
            </div>
            <div className="p-3 rounded-3 ns-stat-card-item flex-grow-1 text-center">
              <div className="text-theme-secondary small mb-1">Rounds</div>
              <div className="text-theme-primary fw-bold">{questions.length} Questions</div>
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

      {/* ACTIVE GAMEPLAY VIEW */}
      {gameState === "playing" && currentQ && (
        <div className="py-3 text-center mx-auto" style={{ maxWidth: "600px" }}>
          <div className="text-theme-secondary small text-uppercase tracking-wider mb-2 fw-semibold">Complete the sequence</div>

          {/* Sequence Card */}
          <div
            className="p-4 mb-4 rounded-4 d-flex align-items-center justify-content-center gap-3 flex-wrap ns-score-hero-card"
            style={{ minHeight: "120px" }}
          >
            {currentQ.sequence.map((item, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center justify-content-center rounded-3 ns-stat-card-item fs-2 fw-bold text-theme-primary shadow-sm"
                style={{ width: "64px", height: "64px" }}
              >
                {item}
              </div>
            ))}
            <div
              className="d-flex align-items-center justify-content-center rounded-3 border-2 border-dashed border-primary fs-2 fw-bold text-primary animate-pulse"
              style={{ width: "64px", height: "64px", background: "rgba(59, 130, 246, 0.12)" }}
            >
              ?
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="row g-3 justify-content-center mb-3">
            {currentQ.options.map((opt, idx) => {
              let btnClass = "btn-outline-secondary text-theme-primary";
              if (isAnswered) {
                if (opt === currentQ.answer) btnClass = "btn-success text-white fw-bold";
                else if (opt === selectedOption) btnClass = "btn-danger text-white";
              }

              return (
                <div key={idx} className="col-6 col-sm-3">
                  <button
                    disabled={isAnswered}
                    className={`btn ${btnClass} p-3 w-100 rounded-3 fs-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 btn-animated`}
                    style={{ minHeight: "70px" }}
                    onClick={() => handleOptionSelect(opt)}
                  >
                    {opt}
                    {isAnswered && opt === currentQ.answer && <FiCheck />}
                    {isAnswered && opt === selectedOption && opt !== currentQ.answer && <FiX />}
                  </button>
                </div>
              );
            })}
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

export default PatternRecognitionGame;
