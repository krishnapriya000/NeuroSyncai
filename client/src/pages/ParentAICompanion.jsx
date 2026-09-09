import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiCpu,
  FiSend,
  FiUser,
  FiZap,
  FiMessageSquare,
  FiHelpCircle
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentAICompanion() {
  const [activeTab, setActiveTab] = useState("ai-companion");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your NeuroSync Parenting AI Companion. How can I assist you with family wellness, emotional guidance, or parent-child communication today?",
      timestamp: "Just now",
    },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
  }, []);

  const starterPrompts = [
    "How can I help my child manage exam stress?",
    "Tips for establishing a balanced screen-time routine?",
    "How to encourage open emotional communication at home?",
    "Strategies to support positive study habits without pressure",
  ];

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "Encouraging open, empathetic communication is key. Ask open-ended questions like 'How did that feel today?' rather than focusing solely on academic results. This builds emotional trust.";

      if (text.toLowerCase().includes("exam") || text.toLowerCase().includes("stress")) {
        aiResponseText = "When children experience exam stress, ensure they take regular 10-minute breaks, maintain consistent sleep schedules, and reassure them that their effort matters more than perfection.";
      } else if (text.toLowerCase().includes("screen") || text.toLowerCase().includes("routine")) {
        aiResponseText = "A healthy screen-time boundary works best when agreed upon together. Set screen-free zones during dinner and 1 hour before bedtime for restorative sleep.";
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={parentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content d-flex flex-column" style={{ minHeight: "calc(100vh - 120px)" }}>
        {/* Header */}
        <div className="mb-4">
          <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
            🤖 Parenting AI
          </span>
          <h1 className="fw-bold text-white fs-3 mb-1">Parenting AI Companion</h1>
          <p className="text-secondary small mb-0">Consult NeuroSync AI for parental guidance, emotional support strategies, and family wellness advice.</p>
        </div>

        {/* Starter Prompts */}
        <div className="row g-2 mb-4">
          {starterPrompts.map((prompt, idx) => (
            <div key={idx} className="col-12 col-md-6">
              <button
                className="btn btn-outline-secondary btn-sm rounded-4 text-start w-100 text-indigo-200 border-secondary border-opacity-25 p-3 hover-shadow"
                style={{ background: "#0F172A", fontSize: "0.85rem" }}
                onClick={() => handleSendMessage(prompt)}
              >
                <FiZap className="text-warning me-2" /> {prompt}
              </button>
            </div>
          ))}
        </div>

        {/* Chat Window Card */}
        <div
          className="p-4 rounded-4 text-white shadow-sm flex-grow-1 d-flex flex-column justify-content-between mb-4"
          style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.08)", minHeight: "420px" }}
        >
          {/* Chat Messages */}
          <div className="overflow-auto pe-2 mb-3 flex-grow-1" style={{ maxHeight: "480px" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div className="d-flex align-items-start gap-2" style={{ maxWidth: "80%" }}>
                  {msg.sender === "ai" && (
                    <div className="rounded-circle bg-primary p-2 text-white d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                      <FiCpu size={18} />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-4 ${
                      msg.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-dark text-indigo-100 border border-secondary border-opacity-25"
                    }`}
                  >
                    <div style={{ fontSize: "0.92rem", lineHeight: "1.5" }}>{msg.text}</div>
                    <div className="text-white-50 extra-small text-end mt-1" style={{ fontSize: "0.68rem" }}>
                      {msg.timestamp}
                    </div>
                  </div>
                  {msg.sender === "user" && (
                    <div className="rounded-circle bg-secondary bg-opacity-50 p-2 text-white d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                      <FiUser size={18} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <FiCpu className="text-primary spinner-border spinner-border-sm" />
                <span>Parenting AI is analyzing...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="input-group"
          >
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary border-opacity-25 rounded-start-pill px-4 py-2.5"
              placeholder="Ask for parenting guidance or family emotional wellness advice..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary rounded-end-pill px-4 d-flex align-items-center gap-2"
              disabled={!inputMessage.trim()}
            >
              <FiSend /> Send
            </button>
          </form>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default ParentAICompanion;
