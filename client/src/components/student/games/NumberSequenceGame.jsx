import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const NUMBER_QUESTIONS = {
  Easy: [
    { sequence: [2, 4, 6, 8], options: [9, 10, 12, 14], answer: 10 },
    { sequence: [5, 10, 15, 20], options: [22, 25, 30, 35], answer: 25 },
    { sequence: [100, 90, 80, 70], options: [50, 60, 65, 55], answer: 60 },
    { sequence: [1, 3, 5, 7], options: [8, 9, 10, 11], answer: 9 },
    { sequence: [4, 8, 12, 16], options: [18, 20, 22, 24], answer: 20 },
  ],
  Medium: [
    { sequence: [2, 4, 8, 16], options: [24, 30, 32, 64], answer: 32 },
    { sequence: [3, 9, 27], options: [54, 72, 81, 108], answer: 81 },
    { sequence: [1, 4, 9, 16], options: [20, 25, 30, 36], answer: 25 },
    { sequence: [50, 45, 40, 35], options: [30, 25, 20, 15], answer: 30 },
    { sequence: [11, 22, 33, 44], options: [50, 55, 66, 77], answer: 55 },
  ],
  Hard: [
    { sequence: [1, 1, 2, 3, 5], options: [6, 7, 8, 9], answer: 8 },
    { sequence: [2, 6, 18, 54], options: [108, 144, 162, 200], answer: 162 },
    { sequence: [1, 8, 27, 64], options: [100, 125, 150, 216], answer: 125 },
    { sequence: [100, 96, 88, 72], options: [40, 48, 56, 60], answer: 40 },
    { sequence: [3, 6, 12, 24], options: [36, 42, 48, 60], answer: 48 },
  ],
};

function NumberSequenceGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState("instructions");
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
  const questions = NUMBER_QUESTIONS[difficulty] || NUMBER_QUESTIONS.Easy;

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
      gameType: "number-sequence",
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
        setResultData({ ...payload, pointsEarned: finalScore });
      }
    } catch (e) {
      console.error("Error saving number sequence result:", e);
      setResultData({ ...payload, pointsEarned: finalScore });
    }

    if (onGameComplete) onGameComplete();
  };

  const currentQ = questions[currentRound];

  return (
    <div className="ns-card p-4 p-md-5 rounded-4 border border-secondary border-opacity-25" style={{ background: "rgba(15, 23, 42, 0.95)" }}>
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-light rounded-circle p-2" onClick={onClose} title="Back to Games">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-white fw-bold mb-0">🔢 Number Sequence</h3>
            <span className="text-muted small">Find the missing number in the math pattern</span>
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

        {gameState === "playing" && (
          <div className="d-flex align-items-center gap-4">
            <div className="text-white fw-bold d-flex align-items-center gap-1 fs-6">
              <FiClock className="text-purple-400" /> {timeTaken}s
            </div>
            <span className="badge bg-primary px-3 py-1 rounded-pill">
              Round {currentRound + 1} / {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS */}
      {gameState === "instructions" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-3">🔢</div>
          <h4 className="text-white fw-bold mb-2">How to Play</h4>
          <p className="text-white-50 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            Review the series of numbers. Identify the mathematical progression (addition, multiplication, squares) and choose the missing number.
          </p>
          <button
            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow"
            onClick={handleStartGame}
          >
            <FiPlay className="me-2" /> Start Game
          </button>
        </div>
      )}

      {/* PLAYING VIEW */}
      {gameState === "playing" && currentQ && (
        <div className="py-3 text-center mx-auto" style={{ maxWidth: "600px" }}>
          <div className="text-muted small text-uppercase tracking-wider mb-2">What is the next number?</div>

          <div
            className="p-4 mb-4 rounded-4 d-flex align-items-center justify-content-center gap-3 flex-wrap shadow-inner"
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              minHeight: "120px",
            }}
          >
            {currentQ.sequence.map((num, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center justify-content-center rounded-3 bg-dark border border-secondary border-opacity-30 fs-2 fw-bold text-white shadow-sm"
                style={{ width: "64px", height: "64px" }}
              >
                {num}
              </div>
            ))}
            <div
              className="d-flex align-items-center justify-content-center rounded-3 border-2 border-dashed border-primary fs-2 fw-bold text-primary"
              style={{ width: "64px", height: "64px", background: "rgba(59, 130, 246, 0.1)" }}
            >
              ?
            </div>
          </div>

          <div className="row g-3 justify-content-center mb-3">
            {currentQ.options.map((opt, idx) => {
              let btnClass = "btn-outline-secondary text-white";
              if (isAnswered) {
                if (opt === currentQ.answer) btnClass = "btn-success text-white fw-bold";
                else if (opt === selectedOption) btnClass = "btn-danger text-white";
              }

              return (
                <div key={idx} className="col-6 col-sm-3">
                  <button
                    disabled={isAnswered}
                    className={`btn ${btnClass} p-3 w-100 rounded-3 fs-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2`}
                    style={{ minHeight: "65px" }}
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

export default NumberSequenceGame;
