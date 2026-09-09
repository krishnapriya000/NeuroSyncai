import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studentDashboard.css";

import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
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
  FiMessageSquare,
  FiLayers,
  FiCompass,
  FiBarChart2,
  FiActivity
} from "react-icons/fi";

const QUICK_PROMPTS = [
  { icon: "📋", label: "Help me plan my workday", text: "Help me plan my workday" },
  { icon: "⚡", label: "How can I improve my focus?", text: "How can I improve my focus?" },
  { icon: "🧘", label: "I'm feeling stressed about work", text: "I'm feeling stressed about work" },
  { icon: "⚖️", label: "How can I improve my work-life balance?", text: "How can I improve my work-life balance?" },
  { icon: "🎯", label: "Help me prioritize my tasks", text: "Help me prioritize my tasks" },
  { icon: "📊", label: "Analyze my productivity", text: "Analyze my productivity" },
];

function ProfessionalAICompanion() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ai-companion");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profName, setProfName] = useState("Professional User");

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
        const userObj = JSON.parse(storedUser);
        if (userObj.fullName || userObj.name) {
          setProfName(userObj.fullName || userObj.name);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Error fetching AI chat history:", err);
    }
  };

  const handleSendMessage = async (customPrompt) => {
    const messageToSend = customPrompt || inputMessage;
    if (!messageToSend || !messageToSend.trim() || loading) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setError("Authentication session expired. Please log in again.");
      return;
    }

    const trimmedMsg = messageToSend.trim();
    setInputMessage("");
    setError(null);
    setLastPrompt(trimmedMsg);

    // Optimistically add user message to UI
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
          // Replace or append assistant message
          const filtered = prev.filter((m) => m !== tempUserMsg);
          return [...filtered, json.data.userMessage, json.data.assistantMessage];
        });
      } else {
        throw new Error(json.message || "Failed to process message.");
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setError("Sorry, I couldn't process that message right now.");
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error starting new chat:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Utility to format markdown text into nicely formatted JSX
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Split text into paragraphs
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, pIdx) => {
      // Check if paragraph contains bullet points or lines
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

  // Inline formatting helper for **bold** text
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
      {/* SIDEBAR */}
      <ProfessionalSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === "overview") navigate("/professional/dashboard");
          if (tab === "checkin") navigate("/professional/checkin");
          if (tab === "profile") navigate("/professional/profile");
          if (tab === "mood") navigate("/professional/mood-stress");
          if (tab === "balance") navigate("/professional/work-life-balance");
          if (tab === "focus") navigate("/professional/focus");
          if (tab === "analytics") navigate("/professional/analytics");
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* TOP NAVBAR */}
      <ProfessionalNavbar
        userName={profName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "overview") navigate("/professional/dashboard");
          if (tab === "checkin") navigate("/professional/checkin");
          if (tab === "profile") navigate("/professional/profile");
        }}
      />

      {/* MAIN CONTENT AREA */}
      <main className="ns-main-content">
        {/* HEADER AREA */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fs-3">🤖</span>
              <h1 className="fw-bold fs-3 mb-0 text-white">NeuroSync AI Companion</h1>
              <span className="badge bg-primary bg-opacity-25 text-blue-300 border border-primary border-opacity-30 rounded-pill px-2.5 py-1 ms-2" style={{ fontSize: "0.75rem" }}>
                Workplace Assistant
              </span>
            </div>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem", color: "#CBD5E1" }}>
              Your personal AI companion for productivity, focus, and work-life balance.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-light rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 border-opacity-25 shadow-sm"
              onClick={handleNewChat}
              style={{ fontSize: "0.88rem" }}
            >
              <FiPlus /> New Chat
            </button>
          </div>
        </div>

        {/* DATA PERSONALIZATION CONTEXT BAR */}
        <div
          className="p-3 rounded-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2 text-white"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
            <span className="badge bg-purple-500 bg-opacity-25 text-purple-300 p-1.5 rounded-circle">
              ⚡
            </span>
            <span className="text-muted">
              Connected with your <strong>Focus Sessions</strong>, <strong>Daily Check-in</strong>, & <strong>Workplace Analytics</strong>.
            </span>
          </div>
          <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-2.5 py-1" style={{ fontSize: "0.72rem" }}>
            Context Sync Active ✓
          </span>
        </div>

        {/* MAIN CHAT WINDOW CONTAINER */}
        <div
          className="ns-card p-0 overflow-hidden d-flex flex-column"
          style={{
            height: "calc(100vh - 270px)",
            minHeight: "520px",
            maxHeight: "750px",
            background: "rgba(15, 23, 42, 0.85)",
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
                    width: "72px",
                    height: "72px",
                    borderRadius: "22px",
                    background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                    fontSize: "2.2rem"
                  }}
                >
                  🤖
                </div>
                <h3 className="fw-bold text-white fs-4 mb-2">Hi, I'm your NeuroSync AI Companion</h3>
                <p className="text-muted mb-4" style={{ maxWidth: "540px", fontSize: "0.95rem" }}>
                  I'm here to help you work smarter while maintaining a healthy work-life balance. Select a quick prompt or type your question below.
                </p>

                {/* QUICK PROMPTS GRID */}
                <div className="w-100" style={{ maxWidth: "720px" }}>
                  <div className="row g-2.5">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <div key={idx} className="col-12 col-md-6">
                        <button
                          type="button"
                          className="w-100 p-3 rounded-4 text-start text-white border border-secondary border-opacity-25 d-flex align-items-center gap-3 transition-all"
                          style={{
                            background: "rgba(30, 41, 59, 0.5)",
                            fontSize: "0.88rem",
                            cursor: "pointer"
                          }}
                          onClick={() => handleSendMessage(prompt.text)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          }}
                        >
                          <span className="fs-5">{prompt.icon}</span>
                          <span className="fw-medium text-light">{prompt.label}</span>
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
                          width: "38px",
                          height: "38px",
                          borderRadius: "12px",
                          background: isUser
                            ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
                            : "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
                          fontSize: "1.1rem"
                        }}
                      >
                        {isUser ? <FiUser className="text-white" /> : "🤖"}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3.5 rounded-4 shadow-sm ${
                          isUser
                            ? "bg-primary bg-gradient text-white"
                            : "bg-dark bg-opacity-60 border border-secondary border-opacity-25 text-light"
                        }`}
                        style={{
                          maxWidth: "78%",
                          fontSize: "0.92rem",
                          lineHeight: "1.6",
                          background: isUser ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" : "#0F172A",
                          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px"
                        }}
                      >
                        {isUser ? (
                          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                        ) : (
                          renderFormattedText(msg.content)
                        )}

                        <div
                          className={`extra-small mt-1.5 text-end ${isUser ? "text-white-50" : "text-muted"}`}
                          style={{ fontSize: "0.7rem" }}
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
                        width: "38px",
                        height: "38px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
                        fontSize: "1.1rem"
                      }}
                    >
                      🤖
                    </div>
                    <div
                      className="p-3 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-25 text-light d-flex align-items-center gap-2"
                      style={{ borderRadius: "18px 18px 18px 4px", fontSize: "0.88rem" }}
                    >
                      <span className="text-muted fw-medium me-1">🤖 NeuroSync AI is thinking</span>
                      <div className="d-flex gap-1 align-items-center">
                        <span
                          className="spinner-grow spinner-grow-sm text-primary"
                          style={{ width: "6px", height: "6px", animationDuration: "0.8s" }}
                        />
                        <span
                          className="spinner-grow spinner-grow-sm text-info"
                          style={{ width: "6px", height: "6px", animationDuration: "1s" }}
                        />
                        <span
                          className="spinner-grow spinner-grow-sm text-purple-400"
                          style={{ width: "6px", height: "6px", animationDuration: "1.2s" }}
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
                      <span style={{ fontSize: "0.88rem" }}>{error}</span>
                    </div>
                    {lastPrompt && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1"
                        onClick={() => handleSendMessage(lastPrompt)}
                        style={{ fontSize: "0.8rem" }}
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
            className="p-3 border-top border-secondary border-opacity-25"
            style={{ background: "#0B1120" }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="d-flex align-items-center gap-2"
            >
              <div className="position-relative flex-grow-1">
                <textarea
                  ref={textareaRef}
                  className="form-control bg-dark bg-opacity-70 text-white border-secondary border-opacity-25 rounded-4 px-3.5 py-2.5 pe-4"
                  style={{
                    resize: "none",
                    height: "48px",
                    maxHeight: "120px",
                    fontSize: "0.92rem",
                    lineHeight: "1.4",
                    color: "#FFFFFF"
                  }}
                  rows={1}
                  placeholder="Ask your AI companion anything about work, productivity, or wellbeing..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary rounded-4 px-3.5 py-2.5 fw-semibold d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  height: "48px",
                  minWidth: "48px",
                  background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                  border: "none"
                }}
                disabled={!inputMessage.trim() || loading}
              >
                <FiSend size={18} />
              </button>
            </form>
            <div className="d-flex align-items-center justify-content-between px-2 pt-2">
              <span className="text-muted extra-small" style={{ fontSize: "0.72rem" }}>
                Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
              </span>
              <span className="text-muted extra-small" style={{ fontSize: "0.72rem" }}>
                * Supportive Workplace Companion. Not a substitute for professional medical care.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* DASHBOARD FOOTER */}
      <DashboardFooter />
    </div>
  );
}

export default ProfessionalAICompanion;
