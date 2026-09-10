import React, { useState, useEffect } from "react";
import { FiClock, FiRotateCcw, FiArrowLeft, FiPlay, FiCheckCircle } from "react-icons/fi";

const TARGET_WORDS = ["APPLE", "BOOK", "CHAIR", "FLOWER", "RIVER"];
const ALL_WORD_CHOICES = ["APPLE", "RIVER", "SUN", "BOOK", "MUSIC", "CHAIR", "BIRD", "FLOWER", "TREE", "MOON"];

function WordRecallExercise({ onClose, onExerciseComplete }) {
  const [phase, setPhase] = useState("instructions");
  const [countdown, setCountdown] = useState(5);
  const [selectedWords, setSelectedWords] = useState([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

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
    setSelectedWords([]);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setFinalResult(null);
  };

  const toggleSelectWord = (word) => {
    if (phase !== "recall") return;
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmitRecall = async () => {
    setIsTimerRunning(false);
    setPhase("completed");

    let correctCount = 0;
    let incorrectCount = 0;

    selectedWords.forEach((w) => {
      if (TARGET_WORDS.includes(w)) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const accuracy = Math.round((correctCount / TARGET_WORDS.length) * 100);
    const score = Math.max(0, Math.round(accuracy - incorrectCount * 10));
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
      accuracy: `${correctCount}/${TARGET_WORDS.length}`,
      accuracyPercent: accuracy,
      timeTaken: timeFormatted,
      correctCount,
      incorrectCount,
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
            exerciseType: "Word Recall",
            difficulty: "Easy",
            score,
            accuracy,
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            timeTaken: timeFormatted,
          }),
        });

        if (onExerciseComplete) onExerciseComplete();
      } catch (err) {
        console.error("Error saving Word Recall result:", err);
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
            <h4 className="text-white fw-bold mb-0">📝 Word Recall</h4>
            <span className="text-muted small">Remember a group of words & identify them later</span>
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
            <span className="fs-1">📝</span>
          </div>
          <h4 className="text-white fw-bold mb-2">Exercise Instructions</h4>
          <p className="text-white-50 small mb-4" style={{ lineHeight: "1.6" }}>
            You will see <strong>5 simple words</strong> for <strong>5 seconds</strong>.
            Remember as many as you can, then select them from a larger word list.
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

      {/* PHASE 2: MEMORIZE */}
      {phase === "memorize" && (
        <div className="text-center py-4 px-3 rounded-4" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <span className="badge rounded-pill bg-warning text-dark px-3 py-1 fw-bold mb-3">
            ⏱️ Remember words in {countdown}s
          </span>

          <h5 className="text-white fw-semibold mb-4">Remember these 5 words:</h5>

          <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 my-4">
            {TARGET_WORDS.map((w, idx) => (
              <span
                key={idx}
                className="fs-4 fw-bold px-4 py-3 rounded-4 shadow-sm text-white"
                style={{
                  background: "rgba(168, 85, 247, 0.2)",
                  border: "2px solid #8B5CF6",
                  letterSpacing: "1px",
                }}
              >
                {w}
              </span>
            ))}
          </div>

          <p className="text-muted small mb-0">The words will hide automatically when countdown finishes.</p>
        </div>
      )}

      {/* PHASE 3: RECALL & RECONSTRUCT */}
      {phase === "recall" && (
        <div className="text-center py-4 px-3 rounded-4" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <h5 className="text-white fw-semibold mb-3">Select the words you remember seeing:</h5>
          <span className="text-muted small d-block mb-4">Click words to select/deselect (Selected: {selectedWords.length}):</span>

          {/* Word Choices Grid */}
          <div className="row g-3 max-w-lg mx-auto mb-4">
            {ALL_WORD_CHOICES.map((w, idx) => {
              const isSelected = selectedWords.includes(w);
              return (
                <div key={idx} className="col-6 col-sm-4">
                  <button
                    type="button"
                    className="btn w-100 py-3 rounded-4 fs-6 fw-bold text-white d-flex align-items-center justify-content-center transition-all"
                    style={{
                      background: isSelected ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.04)",
                      border: isSelected ? "2px solid #10B981" : "1px solid rgba(255, 255, 255, 0.1)",
                      minHeight: "60px",
                    }}
                    onClick={() => toggleSelectWord(w)}
                  >
                    <span>{w}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn px-5 py-2.5 rounded-3 text-white fw-bold"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)", border: "none" }}
            onClick={handleSubmitRecall}
            disabled={selectedWords.length === 0}
          >
            Submit Words
          </button>
        </div>
      )}

      {/* PHASE 4: RESULT MODAL */}
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

export default WordRecallExercise;
