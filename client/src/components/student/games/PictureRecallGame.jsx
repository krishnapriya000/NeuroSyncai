import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiArrowLeft, FiEye, FiCheck } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const PICTURE_POOL = ["🚀", "🎨", "⚽", "🎸", "🍕", "🎮", "🏝️", "👑", "🦁", "🚗", "⛵", "🍩"];

function PictureRecallGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState("instructions"); // instructions | memorizing | recall | completed
  const [displayedPictures, setDisplayedPictures] = useState([]);
  const [allOptions, setAllOptions] = useState([]);
  const [selectedPictures, setSelectedPictures] = useState([]);
  const [memorizeCountdown, setMemorizeCountdown] = useState(5);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [resultData, setResultData] = useState(null);

  const cardCount = difficulty === "Hard" ? 6 : difficulty === "Medium" ? 5 : 4;
  const timerRef = useRef(null);
  const memorizeTimerRef = useRef(null);

  useEffect(() => {
    if (gameState === "memorizing" || gameState === "recall") {
      timerRef.current = setInterval(() => {
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleStartGame = () => {
    // Pick random subset of PICTURE_POOL
    const shuffled = [...PICTURE_POOL].sort(() => 0.5 - Math.random());
    const targetSet = shuffled.slice(0, cardCount);
    setDisplayedPictures(targetSet);

    // Options include target set + distractors
    const distractors = PICTURE_POOL.filter((p) => !targetSet.includes(p)).slice(0, cardCount);
    const combined = [...targetSet, ...distractors].sort(() => 0.5 - Math.random());
    setAllOptions(combined);

    setSelectedPictures([]);
    setGameState("memorizing");
    setMemorizeCountdown(5);

    memorizeTimerRef.current = setInterval(() => {
      setMemorizeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(memorizeTimerRef.current);
          setGameState("recall");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePictureToggle = (pic) => {
    if (selectedPictures.includes(pic)) {
      setSelectedPictures((prev) => prev.filter((p) => p !== pic));
    } else {
      if (selectedPictures.length < cardCount) {
        setSelectedPictures((prev) => [...prev, pic]);
      }
    }
  };

  const handleSubmitRecall = () => {
    let correct = 0;
    let wrong = 0;

    selectedPictures.forEach((pic) => {
      if (displayedPictures.includes(pic)) {
        correct++;
      } else {
        wrong++;
      }
    });

    const accuracyVal = Math.round((correct / cardCount) * 100);
    const earnedScore = correct * (difficulty === "Hard" ? 25 : difficulty === "Medium" ? 20 : 15);

    setScore(earnedScore);
    setCorrectAnswers(correct);
    setWrongAnswers(wrong);

    finishGame(earnedScore, accuracyVal, correct, wrong);
  };

  const finishGame = async (finalScore, accuracyVal, finalCorrect, finalWrong) => {
    setGameState("completed");
    clearInterval(timerRef.current);
    clearInterval(memorizeTimerRef.current);

    const payload = {
      gameType: "picture-recall",
      category: "memory",
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
      console.error("Error saving picture recall result:", e);
      setResultData({ ...payload, pointsEarned: finalScore });
    }

    if (onGameComplete) onGameComplete();
  };

  return (
    <div className="ns-card p-4 p-md-5 rounded-4 border border-secondary border-opacity-25" style={{ background: "rgba(15, 23, 42, 0.95)" }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-light rounded-circle p-2" onClick={onClose} title="Back to Exercises">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-white fw-bold mb-0">🖼️ Picture Recall</h3>
            <span className="text-muted small">Memorize the pictures displayed and recall them from a mixed grid</span>
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

        {(gameState === "memorizing" || gameState === "recall") && (
          <div className="d-flex align-items-center gap-4">
            <div className="text-white fw-bold d-flex align-items-center gap-1 fs-6">
              <FiClock className="text-purple-400" /> {timeTaken}s
            </div>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS */}
      {gameState === "instructions" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-3">🖼️</div>
          <h4 className="text-white fw-bold mb-2">How to Play</h4>
          <p className="text-white-50 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            <strong>Phase 1:</strong> You will be shown {cardCount} pictures for 5 seconds.<br/>
            <strong>Phase 2:</strong> The pictures will hide. Pick out the exact pictures you saw from the choices grid.
          </p>
          <button
            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow"
            onClick={handleStartGame}
          >
            <FiPlay className="me-2" /> Start Exercise
          </button>
        </div>
      )}

      {/* MEMORIZATION PHASE */}
      {gameState === "memorizing" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "600px" }}>
          <div className="d-flex align-items-center justify-content-center gap-2 text-warning fw-bold mb-3 fs-5">
            <FiEye /> Memorization Phase — {memorizeCountdown}s
          </div>

          <div className="row g-3 justify-content-center mb-3">
            {displayedPictures.map((pic, idx) => (
              <div key={idx} className="col-4 col-sm-3">
                <div
                  className="p-4 rounded-4 bg-dark border border-warning border-opacity-40 fs-1 text-center shadow"
                  style={{ minHeight: "90px" }}
                >
                  {pic}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECALL PHASE */}
      {gameState === "recall" && (
        <div className="py-2 text-center mx-auto" style={{ maxWidth: "650px" }}>
          <div className="text-white fw-bold mb-3 fs-5">
            Select the {cardCount} pictures you saw ({selectedPictures.length} / {cardCount} selected)
          </div>

          <div className="row g-3 justify-content-center mb-4">
            {allOptions.map((pic, idx) => {
              const isSelected = selectedPictures.includes(pic);
              return (
                <div key={idx} className="col-4 col-sm-3">
                  <button
                    className={`btn p-4 w-100 rounded-4 fs-1 border ${
                      isSelected
                        ? "btn-primary border-primary shadow-lg"
                        : "btn-outline-secondary bg-dark border-secondary border-opacity-25"
                    }`}
                    style={{ minHeight: "90px", transition: "all 0.2s" }}
                    onClick={() => handlePictureToggle(pic)}
                  >
                    {pic}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            disabled={selectedPictures.length !== cardCount}
            className="btn btn-success btn-lg rounded-pill px-5 py-3 fw-bold shadow"
            onClick={handleSubmitRecall}
          >
            <FiCheck className="me-2" /> Submit Answers
          </button>
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

export default PictureRecallGame;
