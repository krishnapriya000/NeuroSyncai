import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiSend,
  FiPlus,
  FiRotateCcw,
  FiCpu,
  FiZap,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiSmile,
  FiActivity,
  FiUsers
} from "react-icons/fi";
import "../styles/studentDashboard.css";

const SENIOR_QUICK_PROMPTS = [
  { icon: "🌿", label: "Gentle daily exercises & mobility", text: "What are some gentle daily exercises I can do?" },
  { icon: "💊", label: "Organize my medication reminders", text: "How can I organize my medication reminders safely?" },
  { icon: "😴", label: "Tips for restful sleep & relaxation", text: "How can I improve my sleep quality and evening routine?" },
  { icon: "🧠", label: "Keep my memory & mind active", text: "What are fun ways to keep my memory and mind sharp?" },
  { icon: "💬", label: "Feeling lonely or anxious today", text: "I'm feeling a bit lonely or anxious today. Any comforting advice?" },
  { icon: "👨‍👩‍👧", label: "Stay connected with family", text: "Ideas for staying connected with my children and family?" },
];

function SeniorAICompanion() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setSeniorName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, error]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Error fetching Senior AI chat history:", err);
    }
  };

  const handleSendMessage = async (customPrompt) => {
    const messageToSend = customPrompt || inputMessage;
    if (!messageToSend || !messageToSend.trim() || loading) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    const trimmedMsg = messageToSend.trim();
    setInputMessage("");
    setError(null);
    setLastPrompt(trimmedMsg);

    const tempUserMsg = {
      role: "user",
      content: trimmedMsg,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmedMsg }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data?.assistantMessage) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m !== tempUserMsg);
          return [...filtered, json.data.userMessage, json.data.assistantMessage];
        });
      } else {
        throw new Error(json.message || "Failed to process message.");
      }
    } catch (err) {
      console.error("Senior AI Chat Error:", err);
      setError("Sorry, I couldn't process that message right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      setMessages([]);
      setError(null);
      await fetch("http://localhost:5000/api/ai/chat/history", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error clearing chat history:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, pIdx) => {
      const lines = paragraph.split("\n");

      if (lines.length > 1 || lines[0].trim().startsWith("•") || lines[0].trim().startsWith("*") || /^\d+\./.test(lines[0].trim())) {
        return (
          <div key={pIdx} className="mb-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isBullet = trimmed.startsWith("•") || trimmed.startsWith("*") || trimmed.startsWith("-");
              const isNumbered = /^\d+\./.test(trimmed);

              return (
                <div key={lIdx} className={`${isBullet || isNumbered ? "ps-2 my-1 d-flex gap-2" : "mb-1"}`}>
                  <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {formatInlineMarkup(trimmed)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <p key={pIdx} className="mb-2" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {formatInlineMarkup(paragraph)}
        </p>
      );
    });
  };

  const formatInlineMarkup = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white fw-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="ai-companion"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={seniorName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* HEADER AREA */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fs-3">🤖</span>
              <h1 className="fw-bold fs-2 mb-0 text-white">Senior AI Companion</h1>
              <span
                className="badge rounded-pill px-3 py-1.5 ms-2"
                style={{
                  background: "rgba(236, 72, 153, 0.15)",
                  color: "#F472B6",
                  border: "1px solid rgba(236, 72, 153, 0.3)",
                  fontSize: "0.85rem"
                }}
              >
                Senior Citizen Mode
              </span>
            </div>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Your gentle companion for daily health routines, medication reminders, memory activities, and comforting guidance.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2 border-opacity-25 shadow-sm"
              onClick={handleNewChat}
              style={{ fontSize: "0.95rem" }}
            >
              <FiPlus /> Start New Chat
            </button>
          </div>
        </div>

        {/* CONNECTED DATA CONTEXT BAR */}
        <div
          className="p-3.5 rounded-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2 text-white"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.92rem" }}>
            <span className="badge bg-info bg-opacity-25 text-info p-1.5 rounded-circle fs-6">
              🌿
            </span>
            <span className="text-light">
              Connected with your <strong>Daily Check-in</strong>, <strong>Health & Activity</strong>, <strong>Medication Reminders</strong>, & <strong>Family Contacts</strong>.
            </span>
          </div>
          <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-1.5 fw-bold" style={{ fontSize: "0.8rem" }}>
            Senior Context Active ✓
          </span>
        </div>

        {/* MAIN CHAT WINDOW CONTAINER */}
        <div
          className="ns-card p-0 overflow-hidden d-flex flex-column"
          style={{
            height: "calc(100vh - 270px)",
            minHeight: "540px",
            maxHeight: "750px",
            background: "rgba(15, 23, 42, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* CHAT MESSAGES SCROLLABLE AREA */}
          <div className="flex-grow-1 p-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {messages.length === 0 ? (
              /* EMPTY STATE */
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center px-3 py-4">
                <div
                  className="mb-3 d-flex align-items-center justify-content-center shadow-lg"
                  style={{
                    width: "76px",
                    height: "76px",
                    borderRadius: "24px",
                    background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
                    fontSize: "2.5rem"
                  }}
                >
                  🌿
                </div>
                <h3 className="fw-extrabold text-white fs-3 mb-2">Hi! I'm your Senior AI Companion 👋</h3>
                <p className="text-muted mb-4" style={{ maxWidth: "580px", fontSize: "1.05rem" }}>
                  I can assist you with daily physical routines, health & medication organization, memory exercises, and staying connected with family.
                </p>

                {/* SENIOR QUICK PROMPTS GRID */}
                <div className="w-100" style={{ maxWidth: "760px" }}>
                  <div className="row g-3">
                    {SENIOR_QUICK_PROMPTS.map((prompt, idx) => (
                      <div key={idx} className="col-12 col-md-6">
                        <button
                          type="button"
                          className="w-100 p-3.5 rounded-4 text-start text-white border border-secondary border-opacity-25 d-flex align-items-center gap-3 transition-all shadow-sm"
                          style={{
                            background: "rgba(30, 41, 59, 0.6)",
                            fontSize: "0.95rem",
                            minHeight: "70px",
                            cursor: "pointer"
                          }}
                          onClick={() => handleSendMessage(prompt.text)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(236, 72, 153, 0.15)";
                            e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(30, 41, 59, 0.6)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          }}
                        >
                          <span className="fs-3">{prompt.icon}</span>
                          <span className="fw-semibold text-light">{prompt.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* MESSAGES THREAD */
              <div className="d-flex flex-column gap-3">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg._id || index}
                      className={`d-flex align-items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "14px",
                          background: isUser
                            ? "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)"
                            : "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
                          fontSize: "1.2rem"
                        }}
                      >
                        {isUser ? <FiUser className="text-white" /> : "🌿"}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3.5 rounded-4 shadow-sm ${
                          isUser
                            ? "bg-pink-600 text-white"
                            : "bg-dark bg-opacity-70 border border-secondary border-opacity-25 text-light"
                        }`}
                        style={{
                          maxWidth: "80%",
                          fontSize: "1rem",
                          lineHeight: "1.6",
                          background: isUser ? "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)" : "#0F172A",
                          borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px"
                        }}
                      >
                        {isUser ? (
                          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                        ) : (
                          renderFormattedText(msg.content)
                        )}

                        <div
                          className={`extra-small mt-2 text-end ${isUser ? "text-white-50" : "text-muted"}`}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "Just now"}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* TYPING INDICATOR */}
                {loading && (
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
                        fontSize: "1.2rem"
                      }}
                    >
                      🌿
                    </div>
                    <div
                      className="p-3.5 rounded-4 bg-dark bg-opacity-70 border border-secondary border-opacity-25 text-light d-flex align-items-center gap-2"
                      style={{ borderRadius: "20px 20px 20px 4px", fontSize: "0.95rem" }}
                    >
                      <span className="text-muted fw-medium me-1">🌿 Senior AI Companion is thinking...</span>
                      <div className="d-flex gap-1 align-items-center">
                        <span
                          className="spinner-grow spinner-grow-sm text-pink-400"
                          style={{ width: "8px", height: "8px", animationDuration: "0.8s" }}
                        />
                        <span
                          className="spinner-grow spinner-grow-sm text-info"
                          style={{ width: "8px", height: "8px", animationDuration: "1s" }}
                        />
                        <span
                          className="spinner-grow spinner-grow-sm text-purple-400"
                          style={{ width: "8px", height: "8px", animationDuration: "1.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ERROR STATE */}
                {error && (
                  <div className="p-3 rounded-4 bg-danger bg-opacity-15 border border-danger border-opacity-30 d-flex align-items-center justify-content-between my-2">
                    <div className="d-flex align-items-center gap-2 text-danger">
                      <FiAlertTriangle />
                      <span style={{ fontSize: "0.92rem" }}>{error}</span>
                    </div>
                    {lastPrompt && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1"
                        onClick={() => handleSendMessage(lastPrompt)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        <FiRotateCcw /> Try Again
                      </button>
                    )}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* CHAT INPUT COMPOSER */}
          <div
            className="p-3.5 border-top border-secondary border-opacity-25"
            style={{ background: "#0B1120" }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="d-flex align-items-center gap-3"
            >
              <div className="position-relative flex-grow-1">
                <textarea
                  ref={textareaRef}
                  className="form-control bg-dark bg-opacity-80 text-white border-secondary border-opacity-30 rounded-4 px-4 py-3"
                  style={{
                    resize: "none",
                    height: "54px",
                    maxHeight: "130px",
                    fontSize: "1rem",
                    lineHeight: "1.4",
                    color: "#FFFFFF"
                  }}
                  rows={1}
                  placeholder="Ask your AI companion about health, sleep, routines, or family..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary rounded-4 px-4 py-3 fw-bold d-flex align-items-center justify-content-center shadow"
                style={{
                  height: "54px",
                  minWidth: "110px",
                  background: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
                  border: "none",
                  fontSize: "1.05rem"
                }}
                disabled={!inputMessage.trim() || loading}
              >
                <FiSend className="me-2" /> Send
              </button>
            </form>

            <div className="d-flex align-items-center justify-content-between px-2 pt-2.5 flex-wrap gap-2">
              <span className="text-muted extra-small" style={{ fontSize: "0.8rem" }}>
                Press <strong>Enter</strong> to send message
              </span>
              <span className="text-muted extra-small" style={{ fontSize: "0.8rem" }}>
                🌿 Senior Wellness Companion. Non-clinical advice — consult your doctor for medical concerns.
              </span>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default SeniorAICompanion;
