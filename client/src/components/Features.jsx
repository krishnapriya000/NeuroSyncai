const features = [
  {
    icon: "🧠",
    title: "Emotion Intelligence",
    text: "AI detects emotional nuances through facial expressions, voice sentiment, and real-time behavioral logs.",
    badge: "Core AI"
  },
  {
    icon: "🤖",
    title: "Multi-Agent AI Network",
    text: "Seamlessly switch between Therapist AI, Study Mentor, Productivity Coach, and Sleep Assistant.",
    badge: "Multi Agent"
  },
  {
    icon: "📊",
    title: "Dynamic Mood Tracking",
    text: "Track your emotional changes across days and weeks to unlock deep personalized mental insights.",
    badge: "Analytics"
  },
  {
    icon: "🔥",
    title: "Burnout Early Warning",
    text: "Predict stress build-up and mental fatigue patterns before they impact your performance or wellbeing.",
    badge: "Predictive"
  },
  {
    icon: "🎯",
    title: "Smart Productivity",
    text: "Optimize daily schedules, balance work-rest cycles, and maintain peak focus without cognitive overload.",
    badge: "Routine"
  },
  {
    icon: "👶",
    title: "Child & Family Wellness",
    text: "Help parents monitor infant activity, mood indicators, and holistic family emotional health.",
    badge: "Family"
  }
];

function Features() {
  return (
    <section className="container section" id="features">
      <div className="text-center">
        <span className="section-tag">Empower Your Mind</span>
        <h2 className="section-title">Powerful AI Features</h2>
        <p className="section-subtitle">
          Designed to bring harmony to your mental wellness, productivity, and emotional growth.
        </p>
      </div>

      <div className="row mt-4 g-4">
        {features.map((item, index) => (
          <div className="col-lg-4 col-md-6" key={index}>
            <div className="glass-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="feature-icon-wrapper mb-0">{item.icon}</div>
                <span className="badge rounded-pill bg-dark border border-secondary text-info px-3 py-2 small">
                  {item.badge}
                </span>
              </div>
              <h4 className="fw-bold text-white mb-2">{item.title}</h4>
              <p className="text-secondary mb-0">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;