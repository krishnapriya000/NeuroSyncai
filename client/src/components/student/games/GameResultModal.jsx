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
    <div className="ns-modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div className="ns-modal-card-container p-4 p-md-5 text-center shadow-lg position-relative">
        {/* Glow Header Accent */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "220px",
            height: "110px",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)",
            filter: "blur(22px)",
            pointerEvents: "none",
          }}
        />

        <div className="mb-3">
          <span
            className="badge rounded-pill px-3.5 py-1.5 fw-bold mb-2 ns-float-icon"
            style={{
              background: "rgba(139, 92, 246, 0.2)",
              color: "#A855F7",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              fontSize: "0.85rem",
              display: "inline-block",
            }}
          >
            Game Completed 🎉
          </span>
          <h2 className="text-theme-primary fw-extrabold fs-3 mb-1">{performanceTitle}</h2>
          <p className="text-theme-secondary small mb-3" style={{ lineHeight: "1.5" }}>
            {performanceMsg}
          </p>
        </div>

        {/* Big Score Display */}
        <div className="ns-score-hero-card mb-4 text-center mx-auto" style={{ maxWidth: "360px" }}>
          <div className="small fw-bold text-uppercase tracking-wider text-theme-secondary mb-1">
            Total Score
          </div>
          <div className="display-4 fw-extrabold lh-1 mb-2" style={{ color: "#38BDF8", textShadow: "0 0 16px rgba(56, 189, 248, 0.3)" }}>
            {score} <span className="fs-5 text-theme-secondary">pts</span>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-2 text-warning fw-bold small">
            <FiZap className="text-warning" /> +{pointsEarned} Gamification XP Earned
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="row g-2.5 mb-4 text-start">
          <div className="col-6">
            <div className="ns-stat-card-item d-flex align-items-center gap-2.5">
              <FiTarget className="fs-5" style={{ color: "#38BDF8" }} />
              <div>
                <div className="text-theme-secondary" style={{ fontSize: "0.78rem" }}>Accuracy</div>
                <div className="fw-bold fs-6" style={{ color: "#38BDF8" }}>{accuracy}%</div>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="ns-stat-card-item d-flex align-items-center gap-2.5">
              <FiClock className="fs-5" style={{ color: "#C084FC" }} />
              <div>
                <div className="text-theme-secondary" style={{ fontSize: "0.78rem" }}>Time Taken</div>
                <div className="fw-bold fs-6 text-theme-primary">{timeTaken}s</div>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="ns-stat-card-item d-flex align-items-center gap-2.5">
              <FiCheckCircle className="fs-5" style={{ color: "#10B981" }} />
              <div>
                <div className="text-theme-secondary" style={{ fontSize: "0.78rem" }}>Correct</div>
                <div className="fw-bold fs-6" style={{ color: "#10B981" }}>{correctAnswers}</div>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="ns-stat-card-item d-flex align-items-center gap-2.5">
              <FiXCircle className="fs-5" style={{ color: "#EF4444" }} />
              <div>
                <div className="text-theme-secondary" style={{ fontSize: "0.78rem" }}>Wrong</div>
                <div className="fw-bold fs-6" style={{ color: "#EF4444" }}>{wrongAnswers}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-center">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 flex-grow-1 btn-animated"
            onClick={onBackToHub}
          >
            <FiArrowLeft size={18} /> Games Hub
          </button>
          <button
            type="button"
            className="btn rounded-pill px-4 py-2.5 text-white fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-1 shadow-lg btn-animated"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
              border: "none",
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

