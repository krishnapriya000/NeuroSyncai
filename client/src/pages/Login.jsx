import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { getDashboardPathForRole, getLoginRedirectPathForUser } from "../utils/roleUtils";

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

      const targetPath = getLoginRedirectPathForUser(data.user);

      setTimeout(() => {
        navigate(targetPath);
      }, 1500);
    } catch (err) {
      setGeneralError("Cannot connect to server. Please ensure the backend is running.", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google Feature (Handles credential token from Google OAuth)
  const handleGoogleSuccess = async (credentialResponse) => {
    setGeneralError("");
    setSuccessMessage("");
    setIsGoogleLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setGeneralError(data.message || "Google authentication failed.");
        setIsGoogleLoading(false);
        return;
      }

      localStorage.setItem("neurosync_current_user", JSON.stringify(data.user));
      localStorage.setItem("neurosync_token", data.token);
      setSuccessMessage("🟢 Successfully authenticated with Google!");

      const targetPath = getLoginRedirectPathForUser(data.user);

      setTimeout(() => {
        navigate(targetPath);
      }, 1500);
    } catch (err) {
      setGeneralError("Cannot connect to backend server for Google Auth.", err);
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
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setGeneralError(data.message || "Failed to send reset email.");
        return;
      }

      setResetSent(true);
      setSuccessMessage(data.message || `📩 Password reset link sent to ${resetEmail}! Please check your inbox.`);
    } catch (err) {
      setGeneralError("Cannot connect to backend server. Please ensure the server is running.");
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

            {/* Google OAuth Login Component */}
            <div className="d-flex justify-content-center mb-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setGeneralError("Google Login was cancelled or failed.")}
                theme="filled_blue"
                shape="pill"
              />
            </div>

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
                    if (!resetEmail && formData.email) {
                      setResetEmail(formData.email.trim());
                    }
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