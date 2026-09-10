import React, { useState, useEffect } from "react";
import { FiClock, FiRotateCcw, FiCheckCircle, FiXCircle, FiAward, FiArrowLeft } from "react-icons/fi";

const EMOJI_PAIRS = ["🍎", "🌸", "🌟", "🐶", "🎨", "🎵", "🚗", "⚽"];

function MemoryMatchGame({ onClose, onGameComplete }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize and shuffle cards
  const initGame = () => {
    const deck = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
      }));
    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setWrongAttempts(0);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setIsCompleted(false);
    setFinalResult(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  // Format MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  // Card click handler
  const handleCardClick = (index) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].emoji) ||
      isCompleted
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match found
        const newMatched = [...matchedPairs, cards[firstIdx].emoji];
        setMatchedPairs(newMatched);
        setFlippedIndices([]);

        // Check if all 8 pairs matched
        if (newMatched.length === EMOJI_PAIRS.length) {
          handleGameFinish(moves + 1, wrongAttempts, secondsElapsed);
        }
      } else {
        // Mismatch
        setWrongAttempts((prev) => prev + 1);
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // Calculate score & save to backend
  const handleGameFinish = async (totalMoves, wrongs, secs) => {
    setIsTimerRunning(false);
    setIsCompleted(true);

    const totalPairs = EMOJI_PAIRS.length;
    const rawAccuracy = Math.round((totalPairs / Math.max(1, totalMoves)) * 100);
    const accuracy = Math.min(100, Math.max(10, rawAccuracy));
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
      correctMatches: `${totalPairs}/${totalPairs}`,
      wrongAttempts: wrongs,
      feedbackMessage,
    };

    setFinalResult(resultObj);

    // Save result to MongoDB
    const token = localStorage.getItem("neurosync_token");
    if (token) {
      setIsSubmitting(true);
      try {
        await fetch("http://localhost:5000/api/senior/cognitive-games/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gameType: "Memory Match",
            score,
            accuracy,
            correctAnswers: totalPairs,
            incorrectAnswers: wrongs,
            timeTaken: timeFormatted,
            difficulty: "Easy",
          }),
        });

        if (onGameComplete) onGameComplete();
      } catch (err) {
        console.error("Error saving Memory Match game result:", err);
      } finally {
        setIsSubmitting(false);
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
            <h4 className="text-white fw-bold mb-0">🧠 Memory Match</h4>
            <span className="text-muted small">Match the cards and exercise your memory</span>
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

      {/* Senior Stats Bar */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="p-2.5 rounded-3 text-center" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
            <span className="text-muted small d-block">Moves</span>
            <span className="text-white fw-bold fs-5">{moves}</span>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2.5 rounded-3 text-center" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
            <span className="text-muted small d-block">Matched Pairs</span>
            <span className="text-emerald-400 fw-bold fs-5" style={{ color: "#34D399" }}>{matchedPairs.length} / 8</span>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2.5 rounded-3 text-center" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
            <span className="text-muted small d-block">Wrong Attempts</span>
            <span className="text-warning fw-bold fs-5">{wrongAttempts}</span>
          </div>
        </div>
      </div>

      {/* 4x4 Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          maxWidth: "480px",
          margin: "0 auto 20px auto",
        }}
      >
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedPairs.includes(card.emoji);
          const isMatched = matchedPairs.includes(card.emoji);

          return (
            <button
              key={idx}
              type="button"
              className="btn border-0 rounded-4 d-flex align-items-center justify-content-center transition-all shadow-sm"
              style={{
                height: "85px",
                fontSize: isFlipped ? "2.2rem" : "1.2rem",
                background: isMatched
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.4) 100%)"
                  : isFlipped
                  ? "rgba(139, 92, 246, 0.3)"
                  : "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)",
                border: isMatched
                  ? "2px solid #10B981"
                  : isFlipped
                  ? "2px solid #A78BFA"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                cursor: isFlipped ? "default" : "pointer",
                userSelect: "none",
              }}
              onClick={() => handleCardClick(idx)}
            >
              {isFlipped ? card.emoji : "❓"}
            </button>
          );
        })}
      </div>

      {/* GAME COMPLETED MODAL */}
      {isCompleted && finalResult && (
        <div
          className="modal fade show d-block position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(8px)", zIndex: 1050 }}
        >
          <div className="p-4 rounded-4 text-center text-white border border-secondary border-opacity-25 shadow-lg" style={{ maxWidth: "420px", background: "#0F172A" }}>
            <div className="mb-3">
              <span className="fs-1">🎉</span>
            </div>
            <h3 className="fw-bold text-white mb-2">Game Completed!</h3>
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
                  <span className="text-muted d-block small">Matches / Wrongs</span>
                  <span className="text-white fw-bold fs-6">{finalResult.correctMatches} ({finalResult.wrongAttempts} w)</span>
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

export default MemoryMatchGame;
