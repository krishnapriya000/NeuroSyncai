import React, { useState, useEffect } from "react";
import { FiClock, FiRotateCcw, FiArrowLeft, FiCheckCircle, FiXCircle, FiPlay, FiTrash2, FiCornerUpLeft } from "react-icons/fi";

const EASY_SEQUENCE = ["🍎", "⭐", "🔵", "🌸"];
const SYMBOL_POOL = ["🍎", "⭐", "🔵", "🌸", "🟢", "🚗", "🎵", "🎨"];

function RememberSequenceExercise({ onClose, onExerciseComplete }) {
  // Phase: 'instructions' | 'memorize' | 'recall' | 'completed'
  const [phase, setPhase] = useState("instructions");
  const [countdown, setCountdown] = useState(5);
  const [userSequence, setUserSequence] = useState([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  // Memorization countdown timer (5 seconds)
  useEffect(() => {
    let timer = null;
    if (phase === "memorize") {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("recall");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  // Overall time elapsed timer
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && phase !== "completed") {
      interval = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, phase]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  const handleStartExercise = () => {
    setPhase("memorize");
    setUserSequence([]);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setFinalResult(null);
  };

  const handleAddSymbol = (sym) => {
    if (phase !== "recall" || userSequence.length >= EASY_SEQUENCE.length) return;
    setUserSequence((prev) => [...prev, sym]);
  };

  const handleUndo = () => {
    setUserSequence((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUserSequence([]);
  };

  const handleSubmitSequence = async () => {
    setIsTimerRunning(false);
    setPhase("completed");

    let correctCount = 0;
    EASY_SEQUENCE.forEach((sym, idx) => {
      if (userSequence[idx] === sym) {
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / EASY_SEQUENCE.length) * 100);
    const score = accuracy;
    const timeFormatted = formatTime(secondsElapsed);

    let feedbackMessage = "";
    if (score >= 80) {
      feedbackMessage = "Great work! You recalled most of the information correctly.";
    } else if (score >= 60) {
      feedbackMessage = "Good effort! Try again and see if you can improve your score.";
    } else {
      feedbackMessage = "Nice attempt! Regular practice can help you become more familiar with the exercise.";
    }

    const resultObj = {
      score,
      accuracy: `${correctCount}/${EASY_SEQUENCE.length}`,
      accuracyPercent: accuracy,
      timeTaken: timeFormatted,
      correctCount,
      incorrectCount: EASY_SEQUENCE.length - correctCount,
      feedbackMessage,
    };

    setFinalResult(resultObj);

    // Save to backend
    const token = localStorage.getItem("neurosync_token");
    if (token) {
      try {
        await fetch("http://localhost:5000/api/senior/memory-exercises/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exerciseType: "Remember the Sequence",
            difficulty: "Easy",
            score,
            accuracy,
            correctAnswers: correctCount,
            incorrectAnswers: EASY_SEQUENCE.length - correctCount,
            timeTaken: timeFormatted,
          }),
        });

        if (onExerciseComplete) onExerciseComplete();
      } catch (err) {
        console.error("Error saving Sequence memory exercise result:", err);
      }
    }
  };

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
            <h4 className="text-white fw-bold mb-0">🔢 Remember the Sequence</h4>
            <span className="text-muted small">Short-term sequence memory exercise</span>
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
            onClick={handleStartExercise}
          >
            <FiRotateCcw size={14} /> Restart
          </button>
        </div>
      </div>

      {/* PHASE 1: INSTRUCTIONS */}
      {phase === "instructions" && (
        <div className="text-center py-4 px-3 max-w-lg mx-auto">
          <div className="mb-3">
            <span className="fs-1">🔢</span>
          </div>
          <h4 className="text-white fw-bold mb-2">Exercise Instructions</h4>
          <p className="text-white-50 small mb-4" style={{ lineHeight: "1.6" }}>
            A sequence of <strong>4 symbols</strong> will appear on screen for <strong>5 seconds</strong>.
            Memorize the exact order, then select the symbols in the same sequence.
          </p>
          <button
            type="button"
            className="btn px-5 py-3 rounded-4 text-white fw-bold fs-6 shadow-lg"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)", border: "none" }}
            onClick={handleStartExercise}
          >
            <FiPlay size={18} className="me-2" /> Start Exercise
          </button>
        </div>
      )}

      {/* PHASE 2: MEMORIZE (COUNTDOWN) */}
      {phase === "memorize" && (
        <div className="text-center py-4 px-3 rounded-4" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <span className="badge rounded-pill bg-warning text-dark px-3 py-1 fw-bold mb-3">
            ⏱️ Memorize in {countdown}s
          </span>

          <h5 className="text-white fw-semibold mb-4">Remember this sequence:</h5>

          <div className="d-flex align-items-center justify-content-center gap-3 my-4">
            {EASY_SEQUENCE.map((sym, idx) => (
              <span
                key={idx}
                className="fs-1 px-4 py-3 rounded-4 shadow-sm"
                style={{
                  background: "rgba(139, 92, 246, 0.2)",
                  border: "2px solid #8B5CF6",
                }}
              >
                {sym}
              </span>
            ))}
          </div>

          <p className="text-muted small mb-0">The sequence will hide automatically when countdown finishes.</p>
        </div>
      )}

      {/* PHASE 3: RECALL & RECONSTRUCT */}
      {phase === "recall" && (
        <div className="text-center py-4 px-3 rounded-4" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <h5 className="text-white fw-semibold mb-3">What was the correct sequence?</h5>

          {/* User Sequence Slots */}
          <div className="d-flex align-items-center justify-content-center gap-3 my-4">
            {Array.from({ length: EASY_SEQUENCE.length }).map((_, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
                style={{
                  width: "70px",
                  height: "70px",
                  fontSize: "2rem",
                  background: userSequence[idx] ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.05)",
                  border: userSequence[idx] ? "2px solid #3B82F6" : "2px dashed rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                }}
              >
                {userSequence[idx] || (idx + 1)}
              </div>
            ))}
          </div>

          {/* Available Symbols Pool */}
          <span className="text-muted small d-block mb-3">Select symbols in order:</span>
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-4 max-w-md mx-auto">
            {SYMBOL_POOL.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-outline-secondary text-white rounded-3 fs-3 px-3 py-2 border-opacity-25"
                onClick={() => handleAddSymbol(sym)}
                disabled={userSequence.length >= EASY_SEQUENCE.length}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="d-flex align-items-center justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary text-white btn-sm rounded-3 d-flex align-items-center gap-1"
              onClick={handleUndo}
              disabled={userSequence.length === 0}
            >
              <FiCornerUpLeft size={16} /> Undo
            </button>
            <button
              type="button"
              className="btn btn-outline-danger text-danger border-danger border-opacity-25 btn-sm rounded-3 d-flex align-items-center gap-1"
              onClick={handleClear}
              disabled={userSequence.length === 0}
            >
              <FiTrash2 size={16} /> Clear
            </button>
            <button
              type="button"
              className="btn px-4 py-2 rounded-3 text-white fw-bold"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)", border: "none" }}
              onClick={handleSubmitSequence}
              disabled={userSequence.length < EASY_SEQUENCE.length}
            >
              Check Sequence
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: RESULT SCREEN MODAL */}
      {phase === "completed" && finalResult && (
        <div
          className="modal fade show d-block position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(8px)", zIndex: 1050 }}
        >
          <div className="p-4 rounded-4 text-center text-white border border-secondary border-opacity-25 shadow-lg" style={{ maxWidth: "420px", background: "#0F172A" }}>
            <div className="mb-3">
              <span className="fs-1">🎉</span>
            </div>
            <h3 className="fw-bold text-white mb-2">Exercise Completed!</h3>
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
                  <span className="text-info fw-bold fs-4">{finalResult.accuracy}</span>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <span className="text-muted d-block small">Time Taken</span>
                  <span className="text-white fw-bold fs-5">{finalResult.timeTaken}</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary text-white rounded-3 px-3 py-2"
                onClick={onClose}
              >
                Back to Memory Exercises
              </button>
              <button
                type="button"
                className="btn px-4 py-2 rounded-3 text-white fw-bold"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)", border: "none" }}
                onClick={handleStartExercise}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RememberSequenceExercise;
