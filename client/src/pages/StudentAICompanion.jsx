import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import "../styles/studentAICompanion.css";
import {
  FiCpu,
  FiSend,
  FiTrash2,
  FiSmile,
  FiClock,
  FiCalendar,
  FiTarget,
  FiActivity,
  FiZap,
  FiCheckCircle,
  FiChevronRight,
  FiWind,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

function StudentAICompanion() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Insights State
  const [insights, setInsights] = useState({
    mood: null,
    stressLevel: null,
    pendingTasks: null,
    activeGoals: null,
    facialEmotion: null,
  });

  // Modals
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [relaxationModalOpen, setRelaxationModalOpen] = useState(false);
  const [breathePhase, setBreathePhase] = useState("Inhale (4s)");

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Suggested prompts
  const suggestedPrompts = [
    "Help me plan my study session",
    "I'm feeling stressed",
    "How can I improve my focus?",
    "Give me motivation",
    "Review my study progress",
    "Help me reach my goal",
  ];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load user name & initial data
  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchHistory();
    fetchInsights();
  }, []);

  // Fetch Chat History
  const fetchHistory = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      setFetchingHistory(true);
      const res = await fetch("http://localhost:5000/api/ai/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  // Fetch Real-time Insights
  const fetchInsights = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/ai/insights", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setInsights(data.data);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
    }
  };

  // Handle message submission
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || loading) return;

    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setErrorMsg("Authentication session expired. Please log in again.");
      return;
    }

    const tempUserMsg = {
      _id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage("");
    setLoading(true);
    setErrorMsg(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "I'm having trouble connecting right now. Please try again in a moment."
        );
      }

      if (data.data && data.data.assistantMessage) {
        setMessages((prev) => [...prev, data.data.assistantMessage]);
      }
      fetchInsights(); // Refresh insights
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackAssistantMsg = {
        _id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackAssistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Confirm Study Plan tasks addition
  const handleConfirmTasks = async (messageId, tasks) => {
    const token = localStorage.getItem("neurosync_token");
    if (!token || !tasks || tasks.length === 0) return;

    try {
      const res = await fetch("http://localhost:5000/api/ai/study-plan/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId, tasks }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Mark tasks as added locally
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, tasksAdded: true } : msg
          )
        );
        fetchInsights();
      }
    } catch (err) {
      console.error("Error confirming tasks:", err);
    }
  };

  // Clear Conversation
  const handleClearConversation = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat/history", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error("Clear conversation error:", err);
    } finally {
      setClearModalOpen(false);
    }
  };

  // Textarea key listener
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Dynamic textarea height
  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Breathing exercise timer cycle
  useEffect(() => {
    let breatheInterval = null;
    if (relaxationModalOpen) {
      let step = 0;
      const phases = ["Inhale (4s)", "Hold (7s)", "Exhale (8s)"];
      setBreathePhase(phases[0]);
      breatheInterval = setInterval(() => {
        step = (step + 1) % 3;
        setBreathePhase(phases[step]);
      }, 5000);
    }
    return () => clearInterval(breatheInterval);
  }, [relaxationModalOpen]);

  return (
    <div className="dashboard-container ns-ai-companion-page">
      <Sidebar
        activeTab="ai-companion"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={studentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content flex-grow-1">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="ns-ai-header-badge">
                <span className="ns-online-dot" /> AI Companion Online
              </span>
            </div>
            <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
              <FiCpu className="text-purple-400" style={{ color: "#c084fc" }} /> AI Companion
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
              Your personal cognitive, emotional, and study companion.
            </p>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
              style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }}
              onClick={() => setClearModalOpen(true)}
            >
              <FiTrash2 /> Clear Conversation
            </button>
          )}
        </div>

        {/* Main Grid Layout: Left (Chat Interface) + Right (Current Insights) */}
        <div className="row g-4">
          {/* LEFT: Conversation Area */}
          <div className="col-lg-8">
            <div className="ns-ai-chat-card">
              {/* Chat Header bar */}
              <div className="ns-ai-chat-header">
                <div className="d-flex align-items-center gap-2">
                  <div className="ns-msg-avatar assistant">
                    <FiCpu />
                  </div>
                  <div>
                    <span className="text-white fw-semibold d-block" style={{ fontSize: "0.95rem" }}>
                      NeuroSync AI
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Context-Aware Intelligence
                    </span>
                  </div>
                </div>
                <span className="badge bg-dark border border-secondary text-white-50 px-2 py-1" style={{ fontSize: "0.72rem" }}>
                  Student Mode
                </span>
              </div>

              {/* Chat Messages Body */}
              <div className="ns-ai-chat-body">
                {fetchingHistory ? (
                  <div className="text-center py-5 my-auto">
                    <div className="spinner-border text-purple-400" role="status" style={{ color: "#a855f7" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted small mt-2">Loading conversation history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  /* Empty State */
                  <div className="ns-ai-empty-state">
                    <div className="ns-ai-empty-icon">
                      <HiSparkles />
                    </div>
                    <h4 className="text-white fw-bold mb-2">
                      Hi! I'm your NeuroSync AI Companion 👋
                    </h4>
                    <p className="text-muted" style={{ fontSize: "0.92rem" }}>
                      I can help you with studying, focus, stress management, goals, and daily well-being.
                    </p>

                    <div className="ns-suggested-prompts-grid">
                      {suggestedPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="ns-prompt-pill"
                          onClick={() => handleSendMessage(prompt)}
                        >
                          <HiSparkles className="text-purple-400" style={{ color: "#c084fc" }} />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Conversation Messages */
                  messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={msg._id || index} className={`ns-msg-row ${isUser ? "user" : "assistant"}`}>
                        <div className={`ns-msg-avatar ${isUser ? "user" : "assistant"}`}>
                          {isUser ? "You" : <FiCpu />}
                        </div>
                        <div className="d-flex flex-column">
                          <div className="ns-msg-bubble">
                            {msg.content}

                            {/* Study Plan Suggested Tasks Payload with Confirmation */}
                            {!isUser && msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                              <div className="ns-study-suggestion-card">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span className="fw-semibold text-purple-300 small" style={{ color: "#c084fc" }}>
                                    📋 Suggested Study Plan ({msg.suggestedTasks.length} tasks)
                                  </span>
                                </div>
                                {msg.suggestedTasks.map((t, tIdx) => (
                                  <div key={tIdx} className="ns-suggestion-item">
                                    <div>
                                      <span className="text-white fw-semibold">{t.subject}: </span>
                                      <span className="text-white-50">{t.title}</span>
                                    </div>
                                    <span className="badge bg-purple-500 bg-opacity-25 text-purple-300" style={{ color: "#c084fc" }}>
                                      {t.duration}
                                    </span>
                                  </div>
                                ))}

                                <div className="mt-3 d-flex gap-2">
                                  {msg.tasksAdded ? (
                                    <span className="text-success small fw-semibold d-flex align-items-center gap-1">
                                      <FiCheckCircle /> Added to Study Planner
                                    </span>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-primary px-3 py-1 text-white"
                                        style={{ background: "#8b5cf6", border: "none", fontSize: "0.82rem" }}
                                        onClick={() => handleConfirmTasks(msg._id, msg.suggestedTasks)}
                                      >
                                        Add to Planner
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary text-white-50 px-3 py-1"
                                        style={{ fontSize: "0.82rem" }}
                                        onClick={() => {
                                          setMessages((prev) =>
                                            prev.map((m) =>
                                              m._id === msg._id ? { ...m, suggestedTasks: [] } : m
                                            )
                                          );
                                        }}
                                      >
                                        Not Now
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <span className="ns-msg-time">
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {loading && (
                  <div className="ns-msg-row assistant">
                    <div className="ns-msg-avatar assistant">
                      <FiCpu />
                    </div>
                    <div className="ns-typing-wrapper">
                      <div className="ns-typing-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span>NeuroSync is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="ns-ai-chat-footer">
                {errorMsg && (
                  <div className="text-danger small mb-2 d-flex align-items-center gap-1">
                    <FiAlertCircle /> {errorMsg}
                  </div>
                )}
                <div className="ns-input-box-wrapper">
                  <textarea
                    ref={textareaRef}
                    className="ns-chat-textarea"
                    placeholder="Ask your AI Companion anything..."
                    rows={1}
                    value={inputMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    className="ns-send-btn"
                    disabled={!inputMessage.trim() || loading}
                    onClick={() => handleSendMessage()}
                    title="Send Message"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Current Insights Panel */}
          <div className="col-lg-4">
            <div className="ns-insights-panel mb-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2 fs-6">
                <FiActivity className="text-purple-400" style={{ color: "#c084fc" }} /> Your Current Insights
              </h5>

              {/* 1. Today's Mood */}
              <div className="ns-insight-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="ns-insight-icon mood">
                    <FiSmile />
                  </div>
                  <div>
                    <span className="text-muted d-block small">Today's Mood</span>
                    <span className="text-white fw-semibold fs-6">
                      {insights.mood ? insights.mood : "Not available yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Stress Level */}
              <div className="ns-insight-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="ns-insight-icon stress">
                    <FiActivity />
                  </div>
                  <div>
                    <span className="text-muted d-block small">Stress Level</span>
                    <span className="text-white fw-semibold fs-6">
                      {insights.stressLevel != null ? `${insights.stressLevel} / 10` : "Not available yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Study Progress */}
              <div className="ns-insight-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="ns-insight-icon study">
                    <FiCalendar />
                  </div>
                  <div>
                    <span className="text-muted d-block small">Study Progress</span>
                    <span className="text-white fw-semibold fs-6">
                      {insights.pendingTasks != null ? `${insights.pendingTasks} pending` : "Not available yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Active Goals */}
              <div className="ns-insight-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="ns-insight-icon goals">
                    <FiTarget />
                  </div>
                  <div>
                    <span className="text-muted d-block small">Active Goals</span>
                    <span className="text-white fw-semibold fs-6">
                      {insights.activeGoals != null ? `${insights.activeGoals} active` : "Not available yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Latest AI Emotion */}
              <div className="ns-insight-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="ns-insight-icon emotion">
                    <FiZap />
                  </div>
                  <div>
                    <span className="text-muted d-block small">AI Emotion Estimate</span>
                    <span className="text-white fw-semibold fs-6">
                      {insights.facialEmotion
                        ? `${insights.facialEmotion.emotion} · ${insights.facialEmotion.confidence}%`
                        : "Not available yet"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="ns-insights-panel">
              <h5 className="text-white fw-bold mb-3 fs-6">
                Personalized Quick Actions
              </h5>

              <button
                type="button"
                className="ns-quick-action-btn"
                onClick={() => navigate("/student/study-planner")}
              >
                <span>Create Study Plan</span>
                <FiChevronRight />
              </button>

              <button
                type="button"
                className="ns-quick-action-btn"
                onClick={() => navigate("/student/focus-timer")}
              >
                <span>Start Focus Session</span>
                <FiChevronRight />
              </button>

              <button
                type="button"
                className="ns-quick-action-btn"
                onClick={() => navigate("/student/mood-tracker")}
              >
                <span>Check My Mood</span>
                <FiChevronRight />
              </button>

              <button
                type="button"
                className="ns-quick-action-btn"
                onClick={() => navigate("/student/goals")}
              >
                <span>View Goals</span>
                <FiChevronRight />
              </button>

              <button
                type="button"
                className="ns-quick-action-btn"
                onClick={() => setRelaxationModalOpen(true)}
              >
                <span>Relaxation Exercise</span>
                <FiWind className="text-info" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Clear Conversation Confirmation Modal */}
      {clearModalOpen && (
        <div className="ns-modal-overlay">
          <div className="ns-modal-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                <FiTrash2 className="text-danger" /> Clear Conversation
              </h5>
              <button
                className="btn text-white-50 p-1"
                onClick={() => setClearModalOpen(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Are you sure you want to clear your AI Companion chat history? This action cannot be undone.
            </p>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary text-white-50 px-3"
                onClick={() => setClearModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4"
                onClick={handleClearConversation}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Relaxation Exercise Modal */}
      {relaxationModalOpen && (
        <div className="ns-modal-overlay">
          <div className="ns-modal-card text-center">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                <FiWind style={{ color: "#38bdf8" }} /> Guided Box Breathing
              </h5>
              <button
                className="btn text-white-50 p-1"
                onClick={() => setRelaxationModalOpen(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="text-muted small mb-3">
              Follow the rhythmic cycle to calm your nervous system and refocus your mind.
            </p>

            <div className="ns-breathing-circle-wrapper">
              <div className="ns-breathing-circle">{breathePhase}</div>
            </div>

            <p className="text-white-50 small mb-4">
              Deep breathing lowers heart rate and relieves academic pressure.
            </p>

            <button
              type="button"
              className="ns-btn-primary mx-auto text-white px-4"
              onClick={() => setRelaxationModalOpen(false)}
            >
              Done & Ready to Continue
            </button>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}

export default StudentAICompanion;
