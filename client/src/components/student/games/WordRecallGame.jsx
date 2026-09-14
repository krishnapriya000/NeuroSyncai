import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiArrowLeft, FiEye, FiCheck } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const WORD_POOL = [
  "Focus", "Memory", "Neural", "Clarity", "Logic", "Pattern", "Insight", "Brain",
  "Productive", "Mindset", "Wisdom", "Reasoning", "Strategy", "Concept", "Vision", "Energy"
];

function WordRecallGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState("instructions"); // instructions | memorizing | recall | completed
  const [targetWords, setTargetWords] = useState([]);
  const [wordBank, setWordBank] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [memorizeCountdown, setMemorizeCountdown] = useState(6);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [resultData, setResultData] = useState(null);

  const wordCount = difficulty === "Hard" ? 6 : difficulty === "Medium" ? 5 : 4;
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
    const shuffled = [...WORD_POOL].sort(() => 0.5 - Math.random());
    const targets = shuffled.slice(0, wordCount);
    setTargetWords(targets);

    const distractors = WORD_POOL.filter((w) => !targets.includes(w)).slice(0, wordCount + 2);
    const combined = [...targets, ...distractors].sort(() => 0.5 - Math.random());
    setWordBank(combined);

    setSelectedWords([]);
    setGameState("memorizing");
    setMemorizeCountdown(6);

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

  const handleWordToggle = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
    } else {
      if (selectedWords.length < wordCount) {
        setSelectedWords((prev) => [...prev, word]);
      }
    }
  };

  const handleSubmitRecall = () => {
    let correct = 0;
    let wrong = 0;

    selectedWords.forEach((word) => {
      if (targetWords.includes(word)) {
        correct++;
      } else {
        wrong++;
      }
    });

    const accuracyVal = Math.round((correct / wordCount) * 100);
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
      gameType: "word-recall",
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
      console.error("Error saving word recall result:", e);
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
            <h3 className="text-white fw-bold mb-0">📝 Word Recall</h3>
            <span className="text-muted small">Memorize the list of words and select them from memory</span>
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
          <div className="fs-1 mb-3">📝</div>
          <h4 className="text-white fw-bold mb-2">How to Play</h4>
          <p className="text-white-50 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            <strong>Phase 1:</strong> Read and memorize {wordCount} words shown for 6 seconds.<br/>
            <strong>Phase 2:</strong> The list disappears. Select the original words from the word bank grid.
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
            {targetWords.map((word, idx) => (
              <div key={idx} className="col-6 col-sm-4">
                <div
                  className="p-3 rounded-3 bg-dark border border-warning border-opacity-40 text-white fw-bold fs-5 text-center shadow-sm"
                >
                  {word}
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
            Select the {wordCount} words you memorized ({selectedWords.length} / {wordCount} selected)
          </div>

          <div className="row g-3 justify-content-center mb-4">
            {wordBank.map((word, idx) => {
              const isSelected = selectedWords.includes(word);
              return (
                <div key={idx} className="col-6 col-sm-4">
                  <button
                    className={`btn p-3 w-100 rounded-3 fw-bold border ${
                      isSelected
                        ? "btn-primary border-primary shadow"
                        : "btn-outline-secondary bg-dark border-secondary border-opacity-25 text-white"
                    }`}
                    style={{ fontSize: "1rem" }}
                    onClick={() => handleWordToggle(word)}
                  >
                    {word}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            disabled={selectedWords.length !== wordCount}
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

export default WordRecallGame;
