import { useState } from "react";

const agents = [
  {
    icon: "🧘",
    name: "Therapist AI",
    role: "Emotional Healing & Guidance",
    status: "Active & Listening",
    description: "Offers empathetic listening, cognitive behavioral prompts, and real-time stress relief tools.",
    tags: ["Empathy", "CBT Techniques", "Stress Relief"]
  },
  {
    icon: "📚",
    name: "Study Mentor AI",
    role: "Learning & Retention",
    status: "Focus Mode Ready",
    description: "Breaks down complex subjects, optimizes study sessions with Pomodoro AI, and prevents fatigue.",
    tags: ["Memory Sync", "Focus Timers", "Concept Maps"]
  },
  {
    icon: "💼",
    name: "Productivity AI",
    role: "Goal & Workflow Coach",
    status: "Workflow Active",
    description: "Prioritizes daily tasks based on your current energy levels and prevents cognitive overload.",
    tags: ["Energy-Based Planning", "Goal Tracker", "Prioritizer"]
  },
  {
    icon: "😴",
    name: "Sleep Assistant",
    role: "Circadian & Recovery Coach",
    status: "Night Protocol",
    description: "Monitors sleep cycles, crafts relaxing night routines, and optimizes your morning wakefulness.",
    tags: ["Sleep Tracking", "Mindful Soundscapes", "HRV Recovery"]
  }
];

function AIAgents() {
  const [selectedAgent, setSelectedAgent] = useState(0);

  return (
    <section className="container section" id="ai-agents">
      <div className="text-center">
        <span className="section-tag">Dedicated AI Companions</span>
        <h2 className="section-title">Your Personal AI Team</h2>
        <p className="section-subtitle">
          Four specialized neural agents working in harmony to support every dimension of your daily life.
        </p>
      </div>

      <div className="row mt-4 g-4">
        {agents.map((agent, index) => (
          <div className="col-lg-3 col-md-6" key={index}>
            <div
              className={`agent-card h-100 ${selectedAgent === index ? "border-primary" : ""}`}
              onClick={() => setSelectedAgent(index)}
              style={{ cursor: "pointer" }}
            >
              <div className="agent-avatar">{agent.icon}</div>
              <h5 className="fw-bold text-white mb-1">{agent.name}</h5>
              <p className="text-info small mb-2">{agent.role}</p>

              <div className="status-pill mb-3">
                <span className="status-dot-active" />
                <span>{agent.status}</span>
              </div>

              <p className="text-secondary small mb-3">{agent.description}</p>

              <div className="d-flex flex-wrap justify-content-center gap-1">
                {agent.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="badge bg-dark text-light border border-secondary border-opacity-50 font-monospace"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AIAgents;