function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <h3 className="fw-bold text-white mb-2">🧠 NeuroSync AI</h3>
        <p className="text-secondary max-w-lg mx-auto mb-4" style={{ maxWidth: "500px", margin: "0 auto 24px auto" }}>
          Building a smarter emotional future with cutting-edge artificial intelligence and multi-agent neural systems.
        </p>

        <div className="d-flex justify-content-center gap-4 mb-4 small">
          <a href="/">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#ai-agents">AI Team</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>

        <div className="pt-4 border-top border-secondary border-opacity-25 small text-muted">
          © {new Date().getFullYear()} NeuroSync AI. All rights reserved. Empowering Mental Wellness.
        </div>
      </div>
    </footer>
  );
}

export default Footer;