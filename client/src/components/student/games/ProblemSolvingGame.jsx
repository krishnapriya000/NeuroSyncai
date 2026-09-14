import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiClock, FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import GameResultModal from "./GameResultModal";

const PUZZLE_QUESTIONS = {
  Easy: [
    {
      question: "If a circle is inside a square, and a triangle is inside the circle, which shape is on the outermost layer?",
      options: ["Circle", "Square", "Triangle", "Pentagon"],
      answer: "Square",
    },
    {
      question: "Which number replaces the question mark?  4 + 4 = 8, 8 + 4 = 12, 12 + 4 = ?",
      options: ["14", "16", "18", "20"],
      answer: "16",
    },
    {
      question: "If TOMORROW is 2 days after YESTERDAY, how many days are in a weekend?",
      options: ["1", "2", "3", "7"],
      answer: "2",
    },
    {
      question: "A doctor gives you 3 pills and tells you to take one every half hour. How long will the pills last?",
      options: ["30 minutes", "1 hour", "1.5 hours", "2 hours"],
      answer: "1 hour",
    },
    {
      question: "Which item does NOT belong in the group: Apple, Banana, Carrot, Grape?",
      options: ["Apple", "Banana", "Carrot", "Grape"],
      answer: "Carrot",
    },
  ],
  Medium: [
    {
      question: "If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
      options: ["3", "10", "30", "100"],
      answer: "3",
    },
    {
      question: "Look at the pattern: 2, 6, 12, 20, 30. What comes next?",
      options: ["36", "40", "42", "50"],
      answer: "42",
    },
    {
      question: "If ALL Bloops are Lazzies, and ALL Lazzies are Zazzies, are ALL Bloops definitely Zazzies?",
      options: ["Yes", "No", "Cannot be determined", "Only on Tuesdays"],
      answer: "Yes",
    },
    {
      question: "What is lighter: 1 kg of feathers or 1 kg of bricks?",
      options: ["Feathers", "Bricks", "They weigh the same", "Depends on humidity"],
      answer: "They weigh the same",
    },
    {
      question: "A train leaves Station A heading East at 60 mph. Another train leaves Station A heading West at 40 mph. How far apart are they after 2 hours?",
      options: ["100 miles", "120 miles", "200 miles", "240 miles"],
      answer: "200 miles",
    },
  ],
  Hard: [
    {
      question: "A bat and ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
      options: ["$0.10", "$0.05", "$0.15", "$1.00"],
      answer: "$0.05",
    },
    {
      question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
      options: ["100 minutes", "5 minutes", "1 minute", "50 minutes"],
      answer: "5 minutes",
    },
    {
      question: "In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?",
      options: ["24 days", "47 days", "12 days", "36 days"],
      answer: "47 days",
    },
    {
      question: "What comes next in the sequence: 1, 11, 21, 1211, 111221, ?",
      options: ["312211", "122211", "211211", "131122"],
      answer: "312211",
    },
    {
      question: "You have 8 balls that look identical. 7 weigh the same, but 1 is slightly heavier. What is the minimum number of balance scale weighings to find the heavy ball?",
      options: ["1", "2", "3", "4"],
      answer: "2",
    },
  ],
};

function ProblemSolvingGame({ onClose, onGameComplete, initialDifficulty = "Easy" }) {
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
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);
  const questions = PUZZLE_QUESTIONS[difficulty] || PUZZLE_QUESTIONS.Easy;

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
    setSelectedOption(option);
    setIsAnswered(true);

    const q = questions[currentRound];
    const correct = option === q.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + (difficulty === "Hard" ? 25 : difficulty === "Medium" ? 20 : 15));
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentRound + 1 < questions.length) {
        setCurrentRound((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        finishGame();
      }
    }, 1200);
  };

  const finishGame = async () => {
    setGameState("completed");
    clearInterval(timerRef.current);

    const totalQuestions = questions.length;
    const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
    const finalWrong = totalQuestions - finalCorrect;
    const accuracyVal = Math.round((finalCorrect / totalQuestions) * 100);
    const finalScore = score + (isCorrect ? (difficulty === "Hard" ? 25 : difficulty === "Medium" ? 20 : 15) : 0);

    const payload = {
      gameType: "problem-solving",
      category: "cognitive",
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
      console.error("Error saving problem solving result:", e);
      setResultData({ ...payload, pointsEarned: finalScore });
    }

    if (onGameComplete) onGameComplete();
  };

  const currentQ = questions[currentRound];

  return (
    <div className="ns-card p-4 p-md-5 rounded-4 border border-secondary border-opacity-25" style={{ background: "rgba(15, 23, 42, 0.95)" }}>
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-light rounded-circle p-2" onClick={onClose} title="Back to Games">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-white fw-bold mb-0">💡 Problem Solving</h3>
            <span className="text-muted small">Solve logical puzzles and analytical reasoning challenges</span>
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
            <div className="text-white fw-bold d-flex align-items-center gap-1 fs-6">
              <FiClock className="text-purple-400" /> {timeTaken}s
            </div>
            <span className="badge bg-primary px-3 py-1 rounded-pill">
              Puzzle {currentRound + 1} / {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS */}
      {gameState === "instructions" && (
        <div className="py-4 text-center mx-auto" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-3">💡</div>
          <h4 className="text-white fw-bold mb-2">How to Play</h4>
          <p className="text-white-50 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
            Read each logical reasoning question carefully. Pick the single correct option from the choices provided.
          </p>
          <button
            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow"
            onClick={handleStartGame}
          >
            <FiPlay className="me-2" /> Start Game
          </button>
        </div>
      )}

      {/* PLAYING VIEW */}
      {gameState === "playing" && currentQ && (
        <div className="py-2 text-center mx-auto" style={{ maxWidth: "650px" }}>
          <div
            className="p-4 mb-4 rounded-4 bg-dark border border-secondary border-opacity-30 text-start shadow-sm"
            style={{ background: "rgba(30, 41, 59, 0.7)" }}
          >
            <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 mb-2">Question {currentRound + 1}</span>
            <h5 className="text-white fw-semibold mb-0" style={{ lineHeight: "1.5" }}>
              {currentQ.question}
            </h5>
          </div>

          <div className="row g-3 text-start">
            {currentQ.options.map((opt, idx) => {
              let btnClass = "btn-outline-secondary text-white";
              if (isAnswered) {
                if (opt === currentQ.answer) btnClass = "btn-success text-white fw-bold";
                else if (opt === selectedOption) btnClass = "btn-danger text-white";
              }

              return (
                <div key={idx} className="col-12 col-sm-6">
                  <button
                    disabled={isAnswered}
                    className={`btn ${btnClass} p-3 w-100 rounded-3 text-start d-flex align-items-center justify-content-between border border-secondary border-opacity-25 bg-dark`}
                    style={{ minHeight: "60px", fontSize: "0.95rem" }}
                    onClick={() => handleOptionSelect(opt)}
                  >
                    <span>{opt}</span>
                    {isAnswered && opt === currentQ.answer && <FiCheck className="text-white fs-5" />}
                    {isAnswered && opt === selectedOption && opt !== currentQ.answer && <FiX className="text-white fs-5" />}
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

export default ProblemSolvingGame;
