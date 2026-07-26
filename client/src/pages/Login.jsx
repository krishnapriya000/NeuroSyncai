import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  // Mode: "login" or "forgot"
  const [mode, setMode] = useState("login");

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // UI States
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  // Standard Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");

    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGeneralError("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setGeneralError(data.message || "Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("neurosync_current_user", JSON.stringify(data.user));
      localStorage.setItem("neurosync_token", data.token);

      setSuccessMessage(`Welcome back, ${data.user.fullName}! Login successful.`);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setGeneralError("Cannot connect to server. Please ensure the backend is running.", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google Feature
  const handleGoogleSignIn = async () => {
    setGeneralError("");
    setSuccessMessage("");
    setIsGoogleLoading(true);

    try {
      // Simulate Google OAuth Popup & Authentication
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const googleUser = {
        id: Date.now(),
        fullName: "Alex Rivera",
        email: "alex.rivera@gmail.com",
        userType: "Working Professional",
        authProvider: "google",
        avatar: "https://lh3.googleusercontent.com/a/default-user"
      };

      localStorage.setItem("neurosync_current_user", JSON.stringify(googleUser));
      setSuccessMessage("🟢 Successfully authenticated with Google! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setGeneralError("Google authentication failed. Please try again.", err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Forgot Password Submit
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    if (!resetEmail.trim()) {
      setErrors({ resetEmail: "Please enter your Gmail address" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setErrors({ resetEmail: "Please enter a valid email address (e.g. user@gmail.com)" });
      return;
    }

    setIsSendingReset(true);

    try {
      // Simulate sending Gmail reset link
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResetSent(true);
      setSuccessMessage(`📩 Password reset link sent to ${resetEmail}! Please check your inbox.`);
    } catch (err) {
      setGeneralError("Failed to send reset email. Please try again later.", err);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {mode === "login" ? (
          <>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Login to your NeuroSync AI account</p>

            {/* Global Error Alert */}
            {generalError && (
              <div className="auth-alert auth-alert-error" role="alert">
                <span>⚠️</span>
                <div>{generalError}</div>
              </div>
            )}

            {/* Global Success Alert */}
            {successMessage && (
              <div className="auth-alert auth-alert-success" role="alert">
                <div>{successMessage}</div>
              </div>
            )}

            {/* Google Sign In Feature Button */}
            <button
              type="button"
              className="btn-google mb-3"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
              )}
              {isGoogleLoading ? "Connecting to Google..." : "Sign in with Google"}
            </button>

            <div className="auth-divider">OR</div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Address */}
              <div className="mb-3">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid-custom" : ""}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="field-error-text">⚠️ {errors.email}</div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${errors.password ? "is-invalid-custom" : ""}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <div className="field-error-text">⚠️ {errors.password}</div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="me-2 form-check-input"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="rememberMe" className="text-secondary small mb-0">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn-link forgot-link p-0 border-0"
                  onClick={() => {
                    setMode("forgot");
                    setGeneralError("");
                    setSuccessMessage("");
                    setResetSent(false);
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-2 py-2.5"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="auth-bottom mb-0">
              Don't have an account?
              <Link to="/register"> Register</Link>
            </p>
          </>
        ) : (
          /* Forgot Password Recovery Mode */
          <>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">
              Enter your registered Gmail / Email address to receive a recovery link
            </p>

            {generalError && (
              <div className="auth-alert auth-alert-error" role="alert">
                <span>⚠️</span>
                <div>{generalError}</div>
              </div>
            )}

            {successMessage && (
              <div className="auth-alert auth-alert-success" role="alert">
                <div>{successMessage}</div>
              </div>
            )}

            {!resetSent ? (
              <form onSubmit={handleForgotSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="resetEmail">Email Address</label>
                  <input
                    id="resetEmail"
                    type="email"
                    className={`form-control ${errors.resetEmail ? "is-invalid-custom" : ""}`}
                    placeholder="Enter your Gmail (e.g. user@gmail.com)"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (errors.resetEmail) setErrors({});
                    }}
                  />
                  {errors.resetEmail && (
                    <div className="field-error-text">⚠️ {errors.resetEmail}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2.5 mb-3"
                  disabled={isSendingReset}
                >
                  {isSendingReset ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Sending Reset Email...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center my-4">
                <p className="text-secondary small">
                  We've dispatched a password reset link to <strong>{resetEmail}</strong>. Please check your inbox or spam folder.
                </p>
              </div>
            )}

            <button
              type="button"
              className="btn btn-outline-light w-100 py-2"
              onClick={() => {
                setMode("login");
                setGeneralError("");
                setSuccessMessage("");
              }}
            >
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;