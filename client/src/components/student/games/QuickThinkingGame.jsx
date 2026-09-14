import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiArrowLeft, FiZap, FiCheck, FiX } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const RAPID_QUESTIONS = {
  Easy: [
    { question: "Is 7 + 8 = 15?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Does a rectangle have 3 sides?", options: ["TRUE", "FALSE"], answer: "FALSE" },
    { question: "Is 20 / 4 = 5?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Is June before May in the calendar?", options: ["TRUE", "FALSE"], answer: "FALSE" },
    { question: "Is 12 x 2 = 24?", options: ["TRUE", "FALSE"], answer: "TRUE" },
  ],
  Medium: [
    { question: "Is 15 x 3 = 45?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Is 81 divisible by 9?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Is a hexagon 5-sided?", options: ["TRUE", "FALSE"], answer: "FALSE" },
    { question: "Is 99 + 101 = 200?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Is 1/2 larger than 3/4?", options: ["TRUE", "FALSE"], answer: "FALSE" },
  ],
  Hard: [
    { question: "Is 17 a prime number?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Is 25 x 4 = 100?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Is 144 / 12 = 14?", options: ["TRUE", "FALSE"], answer: "FALSE" },
    { question: "Is 2^5 = 32?", options: ["TRUE", "FALSE"], answer: "TRUE" },
    { question: "Is 13 x 13 = 169?", options: ["TRUE", "FALSE"], answer: "TRUE" },
  ],
};

function QuickThinkingGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
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
  const [roundTimeLeft, setRoundTimeLeft] = useState(5); // 5 seconds per question
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);
  const roundTimerRef = useRef(null);
  const questions = RAPID_QUESTIONS[difficulty] || RAPID_QUESTIONS.Easy;

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

  useEffect(() => {
    if (gameState === "playing" && !isAnswered) {
      setRoundTimeLeft(5);
      roundTimerRef.current = setInterval(() => {
        setRoundTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(roundTimerRef.current);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(roundTimerRef.current);
    }
    return () => clearInterval(roundTimerRef.current);
  }, [gameState, currentRound, isAnswered]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    setWrongAnswers((prev) => prev + 1);
    nextQuestion();
  };

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
    clearInterval(roundTimerRef.current);
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

    nextQuestion();
  };

  const nextQuestion = () => {
    setTimeout(() => {
      if (currentRound + 1 < questions.length) {
        setCurrentRound((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        finishGame();
      }
    }, 1000);
  };

  const finishGame = async () => {
    setGameState("completed");
    clearInterval(timerRef.current);

    const totalQuestions = questions.length;
    const accuracyVal = Math.round((correctAnswers / totalQuestions) * 100);

    const payload = {
      gameType: "quick-thinking",
      category: "cognitive",
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
      console.error("Error saving quick thinking result:", e);
      setResultData({ ...payload, pointsEarned: score });
    }

    if (onGameComplete) onGameComplete();
  };

  const currentQ = questions[currentRound];

  return (
    <div className="ns-card p-4 p-md-5 rounded-4 border border-secondary border-opacity-25" style={{ background: "rgba(15, 23, 42, 0.95)" }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-light rounded-circle p-2" onClick={onClose} title="Back to Games">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-white fw-bold mb-0">⚡ Quick Thinking</h3>
            <span className="text-muted small">Rapid-response true/false challenges under tight time limits</span>
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
            <div className="text-warning fw-bold d-flex align-items-center gap-1 fs-6">
              <FiZap /> {roundTimeLeft}s left
            </div>
            <span className="badge bg-primary px-3 py-1 rounded-pill">
              Question {currentRound + 1} / {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS */}
      {gameState === "instructions" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-3">⚡</div>
          <h4 className="text-white fw-bold mb-2">How to Play</h4>
          <p className="text-white-50 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            You get 5 seconds per question! Answer TRUE or FALSE as quickly as possible. Rapid thinking earns higher reaction scores.
          </p>
          <button
            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow"
            onClick={handleStartGame}
          >
            <FiPlay className="me-2" /> Start Rapid Sprint
          </button>
        </div>
      )}

      {/* PLAYING VIEW */}
      {gameState === "playing" && currentQ && (
        <div className="py-3 text-center mx-auto" style={{ maxWidth: "500px" }}>
          {/* Rapid Timer Bar */}
          <div className="progress mb-4 bg-dark border border-secondary border-opacity-25" style={{ height: "10px" }}>
            <div
              className={`progress-bar ${roundTimeLeft <= 2 ? "bg-danger" : "bg-warning"}`}
              style={{ width: `${(roundTimeLeft / 5) * 100}%`, transition: "width 1s linear" }}
            />
          </div>

          <div
            className="p-4 mb-4 rounded-4 bg-dark border border-secondary border-opacity-30 shadow-sm"
            style={{ background: "rgba(30, 41, 59, 0.7)", minHeight: "120px" }}
          >
            <h3 className="text-white fw-bold mb-0 lh-base">{currentQ.question}</h3>
          </div>

          <div className="row g-3">
            {currentQ.options.map((opt, idx) => {
              let btnClass = opt === "TRUE" ? "btn-success" : "btn-danger";
              if (isAnswered) {
                if (opt === currentQ.answer) btnClass = "btn-success text-white fw-bold";
                else if (opt === selectedOption) btnClass = "btn-outline-danger";
              }

              return (
                <div key={idx} className="col-6">
                  <button
                    disabled={isAnswered}
                    className={`btn ${btnClass} btn-lg p-4 w-100 rounded-3 fw-extrabold shadow-sm`}
                    style={{ fontSize: "1.2rem" }}
                    onClick={() => handleOptionSelect(opt)}
                  >
                    {opt}
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

export default QuickThinkingGame;
