import React from "react";
import { FiAward, FiCheckCircle, FiXCircle, FiClock, FiTarget, FiZap, FiRotateCcw, FiArrowLeft } from "react-icons/fi";

function GameResultModal({ result, onPlayAgain, onBackToHub }) {
  if (!result) return null;

  const {
    score = 0,
    accuracy = 0,
    correctAnswers = 0,
    wrongAnswers = 0,
    timeTaken = 0,
    difficulty = "Easy",
    pointsEarned = 0,
  } = result;

  // Non-clinical, encouraging performance messages based on accuracy/score
  let performanceTitle = "Good Effort!";
  let performanceMsg = "Keep practicing to strengthen your cognitive speed and accuracy.";

  if (accuracy >= 90) {
    performanceTitle = "Outstanding Performance! 🌟";
    performanceMsg = `Excellent! You achieved ${accuracy}% accuracy with fantastic focus and precision.`;
  } else if (accuracy >= 75) {
    performanceTitle = "Great Job! 🎉";
    performanceMsg = `Well done! You achieved ${accuracy}% accuracy. Strong problem-solving skills!`;
  } else if (accuracy >= 50) {
    performanceTitle = "Good Steady Progress! 👍";
    performanceMsg = `You scored ${accuracy}% accuracy. Regular practice helps sharpen pattern recognition.`;
  }

  return (
    <div
      className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 1050,
      }}
    >
      <div
        className="ns-card p-4 p-md-5 text-center shadow-lg position-relative overflow-hidden"
        style={{
          maxWidth: "520px",
          width: "100%",
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          borderRadius: "24px",
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        {/* Glow Header Accent */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "100px",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />

        <div className="mb-3">
          <span
            className="badge rounded-pill px-3 py-1.5 fw-bold mb-2"
            style={{
              background: "rgba(139, 92, 246, 0.2)",
              color: "#C084FC",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              fontSize: "0.85rem",
            }}
          >
            Game Completed 🎉
          </span>
          <h2 className="text-white fw-extrabold fs-3 mb-1">{performanceTitle}</h2>
          <p className="text-white-50 small mb-4" style={{ lineHeight: "1.5" }}>
            {performanceMsg}
          </p>
        </div>

        {/* Big Score Display */}
        <div
          className="p-3 mb-4 rounded-4 text-center mx-auto"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            maxWidth: "320px",
          }}
        >
          <div className="text-muted small text-uppercase tracking-wider mb-1">Total Score</div>
          <div className="display-4 fw-black text-white lh-1 mb-2" style={{ color: "#38BDF8" }}>
            {score} <span className="fs-5 text-muted">pts</span>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-2 text-warning fw-bold small">
            <FiZap /> +{pointsEarned} Gamification XP Earned
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="row g-2 mb-4 text-start">
          <div className="col-6">
            <div
              className="p-2.5 rounded-3 d-flex align-items-center gap-2"
              style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
            >
              <FiTarget className="text-primary fs-5" />
              <div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Accuracy</div>
                <div className="text-white fw-bold">{accuracy}%</div>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div
              className="p-2.5 rounded-3 d-flex align-items-center gap-2"
              style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
            >
              <FiClock className="text-purple-400 fs-5" style={{ color: "#C084FC" }} />
              <div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Time Taken</div>
                <div className="text-white fw-bold">{timeTaken}s</div>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div
              className="p-2.5 rounded-3 d-flex align-items-center gap-2"
              style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
            >
              <FiCheckCircle className="text-success fs-5" />
              <div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Correct</div>
                <div className="text-success fw-bold">{correctAnswers}</div>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div
              className="p-2.5 rounded-3 d-flex align-items-center gap-2"
              style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
            >
              <FiXCircle className="text-danger fs-5" />
              <div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Wrong</div>
                <div className="text-danger fw-bold">{wrongAnswers}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-center">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-4 py-2.5 text-white fw-semibold d-flex align-items-center gap-2 flex-grow-1"
            onClick={onBackToHub}
          >
            <FiArrowLeft size={18} /> Games Hub
          </button>
          <button
            type="button"
            className="btn rounded-pill px-4 py-2.5 text-white fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-1"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
              border: "none",
              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
            }}
            onClick={onPlayAgain}
          >
            <FiRotateCcw size={18} /> Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameResultModal;
