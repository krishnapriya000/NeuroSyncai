import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setGeneralError("Invalid password reset link. Please request a new link from the login page.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");
    setErrors({});

    if (!token) {
      setGeneralError("Reset token is missing. Please request a new reset link.");
      return;
    }

    const newErrors = {};
    if (!password) {
      newErrors.password = "New password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setGeneralError(data.message || "Failed to reset password. The link may have expired.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(data.message || "🎉 Password reset successful! Redirecting to login...");
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setGeneralError("Cannot connect to server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          {emailFromUrl ? `Create a new secure password for ${emailFromUrl}` : "Enter your new password below"}
        </p>

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

        {!isSuccess && token && (
          <form onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="mb-3">
              <label htmlFor="password">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${errors.password ? "is-invalid-custom" : ""}`}
                  placeholder="Enter new password (min. 6 characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
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
              {errors.password && <div className="field-error-text">⚠️ {errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control ${errors.confirmPassword ? "is-invalid-custom" : ""}`}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && <div className="field-error-text">⚠️ {errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 mb-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Updating Password...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="btn btn-outline-light w-100 py-2">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
