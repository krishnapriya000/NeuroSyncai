import React, { useState, useEffect } from "react";
import { FiClock, FiRotateCcw, FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";

const QUESTION_BANK = [
  {
    id: 1,
    prompt: "Which symbol appears TWICE in this group?",
    items: ["🍎", "🌸", "🌟", "🌸", "🚗"],
    options: ["🍎", "🌸", "🌟", "🚗"],
    answer: "🌸",
  },
  {
    id: 2,
    prompt: "Which animal is DIFFERENT from the rest?",
    items: ["🐶", "🐶", "🐱", "🐶", "🐶"],
    options: ["🐶", "🐱"],
    answer: "🐱",
  },
  {
    id: 3,
    prompt: "Find the EXACT match for this target: 🎨",
    items: [],
    options: ["🎵", "🎨", "⚽", "🌟"],
    answer: "🎨",
  },
  {
    id: 4,
    prompt: "Which shape appears TWICE in this set?",
    items: ["🔷", "🔶", "🟢", "🔷", "⭐"],
    options: ["🔶", "🟢", "🔷", "⭐"],
    answer: "🔷",
  },
  {
    id: 5,
    prompt: "Find the odd one out in this pattern:",
    items: ["🚗", "🚗", "✈️", "🚗"],
    options: ["🚗", "✈️"],
    answer: "✈️",
  },
];

function AttentionChallengeGame({ onClose, onGameComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'wrong' | null
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const initGame = () => {
    setCurrentIdx(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSelectedOption(null);
    setFeedbackState(null);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setIsCompleted(false);
    setFinalResult(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  const handleSelectOption = (opt) => {
    if (feedbackState !== null) return;
    setSelectedOption(opt);

    const q = QUESTION_BANK[currentIdx];
    const isRight = opt === q.answer;

    if (isRight) {
      setFeedbackState("correct");
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setFeedbackState("wrong");
      setIncorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < QUESTION_BANK.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setFeedbackState(null);
      } else {
        handleGameFinish(isRight ? correctAnswers + 1 : correctAnswers, isRight ? incorrectAnswers : incorrectAnswers + 1, secondsElapsed);
      }
    }, 1200);
  };

  const handleGameFinish = async (finalCorrect, finalWrong, secs) => {
    setIsTimerRunning(false);
    setIsCompleted(true);

    const totalQ = QUESTION_BANK.length;
    const accuracy = Math.round((finalCorrect / totalQ) * 100);
    const score = accuracy;
    const timeFormatted = formatTime(secs);

    let feedbackMessage = "";
    if (score >= 80) {
      feedbackMessage = "Great job! You completed the challenge with good accuracy.";
    } else if (score >= 60) {
      feedbackMessage = "Good effort! Try again and see if you can improve your score.";
    } else {
      feedbackMessage = "Nice attempt! Practice again whenever you feel ready.";
    }

    const resultObj = {
      score,
      accuracy,
      timeTaken: timeFormatted,
      correctAnswers: finalCorrect,
      incorrectAnswers: finalWrong,
      feedbackMessage,
    };

    setFinalResult(resultObj);

    const token = localStorage.getItem("neurosync_token");
    if (token) {
      try {
        await fetch("http://localhost:5000/api/senior/cognitive-games/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gameType: "Attention Challenge",
            score,
            accuracy,
            correctAnswers: finalCorrect,
            incorrectAnswers: finalWrong,
            timeTaken: timeFormatted,
            difficulty: "Easy",
          }),
        });

        if (onGameComplete) onGameComplete();
      } catch (err) {
        console.error("Error saving Attention Challenge result:", err);
      }
    }
  };

  const currentQ = QUESTION_BANK[currentIdx];

  return (
    <div className="ns-card p-4 position-relative">
      {/* Header Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary text-white btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={onClose}
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h4 className="text-white fw-bold mb-0">🎯 Attention Challenge</h4>
            <span className="text-muted small">Identify targets & pattern details</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="px-3 py-1.5 rounded-pill d-flex align-items-center gap-2" style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#60A5FA" }}>
            <FiClock size={16} />
            <span className="fw-bold font-monospace">{formatTime(secondsElapsed)}</span>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary text-white btn-sm rounded-3 d-flex align-items-center gap-1"
            onClick={initGame}
          >
            <FiRotateCcw size={14} /> Restart
          </button>
        </div>
      </div>

      {/* Progress step */}
      <div className="d-flex align-items-center justify-content-between mb-3 text-muted small">
        <span>Question {currentIdx + 1} of {QUESTION_BANK.length}</span>
        <span className="text-emerald-400" style={{ color: "#34D399" }}>Correct: {correctAnswers}</span>
      </div>

      {/* Challenge Card */}
      {currentQ && !isCompleted && (
        <div className="text-center py-4 px-3 rounded-4 mb-4" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <h5 className="text-white fw-semibold mb-3" style={{ fontSize: "1.1rem" }}>{currentQ.prompt}</h5>

          {currentQ.items.length > 0 && (
            <div className="d-flex align-items-center justify-content-center gap-3 my-4 p-3 rounded-3" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
              {currentQ.items.map((item, idx) => (
                <span key={idx} className="fs-1 px-2 py-1 bg-secondary bg-opacity-25 rounded-3">{item}</span>
              ))}
            </div>
          )}

          {/* Options Grid */}
          <div className="row g-3 max-w-md mx-auto mt-3">
            {currentQ.options.map((opt, idx) => {
              const isChosen = selectedOption === opt;
              const isAnswer = opt === currentQ.answer;

              let btnBg = "rgba(255, 255, 255, 0.05)";
              let btnBorder = "rgba(255, 255, 255, 0.1)";

              if (feedbackState && isChosen) {
                if (isAnswer) {
                  btnBg = "rgba(16, 185, 129, 0.3)";
                  btnBorder = "#10B981";
                } else {
                  btnBg = "rgba(239, 68, 68, 0.3)";
                  btnBorder = "#EF4444";
                }
              }

              return (
                <div key={idx} className="col-6">
                  <button
                    type="button"
                    className="btn w-100 py-3 rounded-4 fs-2 text-white d-flex align-items-center justify-content-center gap-2 transition-all"
                    style={{
                      background: btnBg,
                      border: `2px solid ${btnBorder}`,
                      minHeight: "75px",
                    }}
                    onClick={() => handleSelectOption(opt)}
                    disabled={feedbackState !== null}
                  >
                    <span>{opt}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {feedbackState && (
            <div className="mt-4">
              {feedbackState === "correct" ? (
                <span className="badge rounded-pill bg-success bg-opacity-25 text-success px-4 py-2 fs-6 border border-success">
                  <FiCheckCircle className="me-1" /> Correct Answer!
                </span>
              ) : (
                <span className="badge rounded-pill bg-danger bg-opacity-25 text-danger px-4 py-2 fs-6 border border-danger">
                  <FiXCircle className="me-1" /> Not quite right. Correct answer: {currentQ.answer}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME COMPLETED MODAL */}
      {isCompleted && finalResult && (
        <div
          className="modal fade show d-block position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(8px)", zIndex: 1050 }}
        >
          <div className="p-4 rounded-4 text-center text-white border border-secondary border-opacity-25 shadow-lg" style={{ maxWidth: "420px", background: "#0F172A" }}>
            <div className="mb-3">
              <span className="fs-1">🎯</span>
            </div>
            <h3 className="fw-bold text-white mb-2">Challenge Completed!</h3>
            <p className="text-white-50 small mb-4">"{finalResult.feedbackMessage}"</p>

            <div className="row g-2 mb-4">
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <span className="text-muted d-block small">Score</span>
                  <span className="text-emerald-400 fw-bold fs-4" style={{ color: "#34D399" }}>{finalResult.score}%</span>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <span className="text-muted d-block small">Accuracy</span>
                  <span className="text-info fw-bold fs-4">{finalResult.accuracy}%</span>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <span className="text-muted d-block small">Time Taken</span>
                  <span className="text-white fw-bold fs-5">{finalResult.timeTaken}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <span className="text-muted d-block small">Correct Answers</span>
                  <span className="text-white fw-bold fs-6">{finalResult.correctAnswers} / {QUESTION_BANK.length}</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary text-white rounded-3 px-4 py-2"
                onClick={onClose}
              >
                Back to Games
              </button>
              <button
                type="button"
                className="btn px-4 py-2 rounded-3 text-white fw-bold"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)", border: "none" }}
                onClick={initGame}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttentionChallengeGame;
