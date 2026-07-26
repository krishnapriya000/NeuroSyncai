function Hero() {
  return (
    <section className="container hero-section">
      {/* Background Ambient Glow */}
      <div className="bg-ambient-glow" />

      <div className="row align-items-center">
        {/* Left Content */}
        <div className="col-lg-6 z-2">
          <div className="badge-ai mb-3">
            <span className="badge-dot" />
            <span>🚀 AI Powered Emotional Intelligence Platform</span>
          </div>

          <h1 className="hero-title mt-2">
            Understand Your Mind.
            <br />
            <span>Improve Your Life.</span>
          </h1>

          <p className="hero-text mt-4">
            NeuroSync is an AI-powered emotional intelligence companion that helps individuals
            understand emotions, improve mental wellness, predict burnout, and build a healthier
            lifestyle through personalized multi-agent AI insights.
          </p>

          <div className="mt-4 d-flex flex-wrap gap-3">
            <a href="/register" className="btn btn-primary btn-lg px-4">
              Get Started Free
            </a>

            <a href="#how-it-works" className="btn btn-outline-light btn-lg px-4">
              How NeuroSync Works ↓
            </a>
          </div>

          {/* Statistics */}
          <div className="row mt-5 g-3">
            <div className="col-4">
              <div className="stat-box">
                <h3 className="fw-bold text-white mb-0">10K+</h3>
                <p className="text-secondary small mb-0">Active Users</p>
              </div>
            </div>

            <div className="col-4">
              <div className="stat-box">
                <h3 className="fw-bold text-white mb-0">24/7</h3>
                <p className="text-secondary small mb-0">AI Support</p>
              </div>
            </div>

            <div className="col-4">
              <div className="stat-box">
                <h3 className="fw-bold text-white mb-0">100%</h3>
                <p className="text-secondary small mb-0">Private & Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="col-lg-6 text-center mt-5 mt-lg-0 z-2">
          <div className="hero-image-wrapper">
            <img
              src="/brain.png"
              alt="NeuroSync AI Brain"
              className="img-fluid floating"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;