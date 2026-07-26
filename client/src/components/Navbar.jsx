function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <a className="navbar-brand text-white fw-bold" href="/">
          <span>🧠 NeuroSync</span>
        </a>

        <button
          className="navbar-toggler border-secondary text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <a className="nav-link px-3" href="/">
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link px-3" href="#features">
                Features
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link px-3" href="#how-it-works">
                How It Works
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link px-3" href="#ai-agents">
                AI Team
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link px-3 ms-lg-2" href="/login">
                Login
              </a>
            </li>

            <li className="nav-item ms-lg-2">
              <a className="btn btn-primary px-4 py-2" href="/register">
                Get Started
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;