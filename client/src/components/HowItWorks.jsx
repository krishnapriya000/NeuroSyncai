import { useState, useEffect } from "react";

const steps = [
  {
    id: 1,
    stepNum: "01",
    icon: "👤",
    title: "Data Collection & Sensing",
    short: "Securely sync biometric data, mood logs & voice tone.",
    description: "NeuroSync connects with your everyday devices, mood logs, and optional voice check-ins to continuously analyze emotional signals while keeping all data 100% private and encrypted.",
    badge: "Input Stage",
    metrics: [
      { label: "Data Security", value: "End-to-End Encrypted" },
      { label: "Input Types", value: "Voice, Text, Biometrics" },
      { label: "Sync Speed", value: "< 50ms Real-Time" }
    ],
    features: ["🔒 Zero-Knowledge Privacy", "🎙️ Sentiment & Tone AI", "⌚ Wearable Integration"]
  },
  {
    id: 2,
    stepNum: "02",
    icon: "🧠",
    title: "Multi-Agent AI Engine",
    short: "Specialized AI agents process & classify neural intent.",
    description: "Your input is analyzed by a team of dedicated AI agents: Therapist AI for emotion processing, Mentor AI for study & work focus, and Sleep AI for recovery management.",
    badge: "AI Processing",
    metrics: [
      { label: "Active Agents", value: "4 Specialized Models" },
      { label: "Neural Speed", value: "Sub-Second Inference" },
      { label: "Context Window", value: "Long-term Memory" }
    ],
    features: ["🧘 Therapist AI Agent", "💼 Productivity Coach", "😴 Sleep & Recovery AI"]
  },
  {
    id: 3,
    stepNum: "03",
    icon: "📊",
    title: "Predictive Neural Analytics",
    short: "Detect burnout, stress & mood shifts early.",
    description: "Using advanced neural pattern recognition, NeuroSync predicts burnout curves and cognitive exhaustion before they impact your daily well-being or productivity.",
    badge: "Analytics Stage",
    metrics: [
      { label: "Burnout Accuracy", value: "94.2% Prediction" },
      { label: "Stress Metric", value: "Adaptive HRV Score" },
      { label: "Focus Track", value: "Cognitive Fatigue Index" }
    ],
    features: ["🔥 Burnout Warning System", "📈 Emotional Trajectory", "⚡ Energy Peak Finder"]
  },
  {
    id: 4,
    stepNum: "04",
    icon: "✨",
    title: "Adaptive Action & Wellness",
    short: "Get customized micro-coaching & real-time guidance.",
    description: "Receive instant actionable recommendations, guided breathing prompts, workload adjustments, and personalized mental wellness exercises designed specifically for your current mental state.",
    badge: "Output & Action",
    metrics: [
      { label: "Action Plan", value: "Personalized Daily Routine" },
      { label: "Wellness Lift", value: "+38% Mood Improvement" },
      { label: "Intervention", value: "Real-time Micro Guidance" }
    ],
    features: ["🎯 Micro-Habit Prompting", "🌬️ Guided Mindful Exercises", "🚀 Schedule Optimizer"]
  }
];

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-advance step every 5 seconds if user isn't interacting
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % steps.length) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const currentStepData = steps.find((s) => s.id === activeStep) || steps[0];
  const progressPercent = ((activeStep - 1) / (steps.length - 1)) * 100;

  return (
    <section className="container section" id="how-it-works" onMouseEnter={() => setAutoPlay(false)} onMouseLeave={() => setAutoPlay(true)}>
      <div className="text-center">
        <span className="section-tag">Seamless Intelligence</span>
        <h2 className="section-title">How NeuroSync Works</h2>
        <p className="section-subtitle">
          From raw emotional signals to actionable mental wellness—discover how our multi-agent AI transforms your daily mental well-being in 4 smart steps.
        </p>
      </div>

      <div className="workflow-container">
        {/* Interactive Steps Bar */}
        <div className="workflow-steps-grid">
          {/* Animated Connecting Beam Line */}
          <div className="workflow-connector-line">
            <div
              className="workflow-progress-line"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {steps.map((step) => (
            <div
              key={step.id}
              className={`workflow-step-card ${activeStep === step.id ? "active" : ""}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="step-node">
                {activeStep === step.id ? step.icon : step.stepNum}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-short">{step.short}</p>
            </div>
          ))}
        </div>

        {/* Detailed Interactive Preview Card for Selected Step */}
        <div className="workflow-preview-card mt-4">
          <div className="row align-items-center">
            {/* Left Side: Step Details */}
            <div className="col-lg-7">
              <span className="step-badge">
                Step {currentStepData.stepNum} • {currentStepData.badge}
              </span>
              <h3 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <span className="fs-2">{currentStepData.icon}</span> {currentStepData.title}
              </h3>
              <p className="hero-text text-light mb-4" style={{ fontSize: "1.05rem" }}>
                {currentStepData.description}
              </p>

              <div className="d-flex flex-wrap gap-2 mb-4">
                {currentStepData.features.map((feat, idx) => (
                  <span className="preview-feature-tag" key={idx}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Side: Visual Metrics Card */}
            <div className="col-lg-5 mt-4 mt-lg-0">
              <div
                className="p-4 rounded-4"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(123, 47, 247, 0.3)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
                }}
              >
                <h6 className="text-secondary text-uppercase fw-bold mb-3 fs-7" style={{ letterSpacing: "1px" }}>
                  ⚡ Live Step Metrics
                </h6>
                <div className="d-flex flex-column gap-3">
                  {currentStepData.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="d-flex justify-content-between align-items-center p-2 rounded-3"
                      style={{ background: "rgba(0, 0, 0, 0.25)" }}
                    >
                      <span className="text-secondary small">{metric.label}</span>
                      <span className="fw-bold text-info small">{metric.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                  <span className="small text-muted">
                    Auto-playing steps {autoPlay ? "(Active)" : "(Paused on hover)"}
                  </span>
                  <div className="d-flex gap-1">
                    {steps.map((s) => (
                      <span
                        key={s.id}
                        onClick={() => setActiveStep(s.id)}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          backgroundColor: activeStep === s.id ? "#7B2FF7" : "rgba(255,255,255,0.2)",
                          transition: "all 0.3s ease"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;