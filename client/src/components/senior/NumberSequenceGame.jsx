import React, { useState, useEffect } from "react";
import { FiClock, FiRotateCcw, FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";

const NUMBER_QUESTIONS = [
  {
    id: 1,
    sequence: "2 → 4 → 6 → 8 → ?",
    options: [9, 10, 12, 14],
    answer: 10,
    hint: "Adding +2 each step",
  },
  {
    id: 2,
    sequence: "5 → 10 → 15 → 20 → ?",
    options: [22, 24, 25, 30],
    answer: 25,
    hint: "Counting by 5s",
  },
  {
    id: 3,
    sequence: "10 → 20 → 30 → 40 → ?",
    options: [45, 50, 55, 60],
    answer: 50,
    hint: "Counting by 10s",
  },
  {
    id: 4,
    sequence: "3 → 6 → 9 → 12 → ?",
    options: [13, 14, 15, 16],
    answer: 15,
    hint: "Adding +3 each step",
  },
  {
    id: 5,
    sequence: "1 → 3 → 5 → 7 → ?",
    options: [8, 9, 10, 11],
    answer: 9,
    hint: "Odd numbers sequence",
  },
];

function NumberSequenceGame({ onClose, onGameComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null);
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

  const handleSelectOption = (num) => {
    if (feedbackState !== null) return;
    setSelectedOption(num);

    const q = NUMBER_QUESTIONS[currentIdx];
    const isRight = num === q.answer;

    if (isRight) {
      setFeedbackState("correct");
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setFeedbackState("wrong");
      setIncorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < NUMBER_QUESTIONS.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setFeedbackState(null);
      } else {
        handleGameFinish(
          isRight ? correctAnswers + 1 : correctAnswers,
          isRight ? incorrectAnswers : incorrectAnswers + 1,
          secondsElapsed
        );
      }
    }, 1200);
  };

  const handleGameFinish = async (finalCorrect, finalWrong, secs) => {
    setIsTimerRunning(false);
    setIsCompleted(true);

    const totalQ = NUMBER_QUESTIONS.length;
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
            gameType: "Number Sequence",
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
        console.error("Error saving Number Sequence result:", err);
      }
    }
  };

  const currentQ = NUMBER_QUESTIONS[currentIdx];

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
            <h4 className="text-white fw-bold mb-0">🔢 Number Sequence</h4>
            <span className="text-muted small">Complete simple number patterns & logical thinking</span>
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
        <span>Question {currentIdx + 1} of {NUMBER_QUESTIONS.length}</span>
        <span className="text-emerald-400" style={{ color: "#34D399" }}>Correct: {correctAnswers}</span>
      </div>

      {/* Challenge Card */}
      {currentQ && !isCompleted && (
        <div className="text-center py-4 px-3 rounded-4 mb-4" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <span className="text-muted small d-block mb-2">Complete the pattern:</span>
          <h2 className="text-white fw-bold display-6 mb-4" style={{ letterSpacing: "2px" }}>
            {currentQ.sequence}
          </h2>

          {/* Large Options Grid */}
          <div className="row g-3 max-w-md mx-auto">
            {currentQ.options.map((num, idx) => {
              const isChosen = selectedOption === num;
              const isAnswer = num === currentQ.answer;

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
                    className="btn w-100 py-3 rounded-4 fs-3 text-white fw-bold d-flex align-items-center justify-content-center transition-all"
                    style={{
                      background: btnBg,
                      border: `2px solid ${btnBorder}`,
                      minHeight: "75px",
                    }}
                    onClick={() => handleSelectOption(num)}
                    disabled={feedbackState !== null}
                  >
                    <span>{num}</span>
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
                  <FiXCircle className="me-1" /> Incorrect. Correct answer: {currentQ.answer}
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
              <span className="fs-1">🔢</span>
            </div>
            <h3 className="fw-bold text-white mb-2">Sequence Completed!</h3>
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
                  <span className="text-white fw-bold fs-6">{finalResult.correctAnswers} / {NUMBER_QUESTIONS.length}</span>
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

export default NumberSequenceGame;
