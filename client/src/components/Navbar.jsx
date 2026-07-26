import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load authenticated user from localStorage on mount & listen for changes
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("neurosync_current_user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      } else {
        setCurrentUser(null);
      }
    };

    loadUser();

    // Event listener for clicks outside dropdown to close it automatically
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("neurosync_current_user");
    localStorage.removeItem("neurosync_token");
    setCurrentUser(null);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  // Helper to extract 1st letter of user's name
  const getUserInitial = () => {
    if (!currentUser) return "U";
    const name = currentUser.fullName || currentUser.name || currentUser.email || "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <Link className="navbar-brand text-white fw-bold" to="/">
          <span>🧠 NeuroSync</span>
        </Link>

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
              <Link className="nav-link px-3" to="/">
                Home
              </Link>
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

            {currentUser ? (
              /* Authenticated User Profile Circle Avatar */
              <li className="nav-item ms-lg-3 user-profile-wrapper" ref={dropdownRef}>
                <button
                  className="user-avatar-circle"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  title={currentUser.fullName || currentUser.email}
                  aria-label="User Profile"
                  type="button"
                >
                  {currentUser.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.fullName || "User Avatar"}
                      className="user-avatar-img"
                    />
                  ) : (
                    <span className="user-avatar-initial">{getUserInitial()}</span>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="user-dropdown-card">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-avatar-small">
                        {currentUser.profileImage ? (
                          <img
                            src={currentUser.profileImage}
                            alt="Avatar"
                            className="user-avatar-img"
                          />
                        ) : (
                          getUserInitial()
                        )}
                      </div>
                      <div className="user-dropdown-info">
                        <p className="user-dropdown-name">
                          {currentUser.fullName || "NeuroSync User"}
                        </p>
                        <p className="user-dropdown-email">{currentUser.email}</p>
                      </div>
                    </div>

                    <button
                      className="user-dropdown-btn-logout"
                      onClick={handleLogout}
                      type="button"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              /* Unauthenticated State: Login & Register Links */
              <>
                <li className="nav-item">
                  <Link className="nav-link px-3 ms-lg-2" to="/login">
                    Login
                  </Link>
                </li>

                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-primary px-4 py-2" to="/register">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;