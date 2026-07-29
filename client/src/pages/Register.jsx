import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardPathForRole, getLoginRedirectPathForUser } from "../utils/roleUtils";

function Register() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    termsAccepted: false
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle Input Changes & Clear Errors
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  // Password Strength Meter Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 33, label: "Weak", color: "#ef4444" };
    if (score <= 4) return { score: 66, label: "Fair", color: "#f59e0b" };
    return { score: 100, label: "Strong", color: "#22c55e" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Form Validation Logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. user@example.com)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.userType) {
      newErrors.userType = "Please select your user category";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must agree to the Terms of Service & Privacy Policy";
    }

    return newErrors;
  };

  // Handle Form Submission (Authentication Feature)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGeneralError("Please fix the errors below before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          userType: formData.userType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setGeneralError(data.message || "Registration failed. Please try again.");
        if (data.message && data.message.includes("email")) {
          setErrors((prev) => ({ ...prev, email: "Email already registered" }));
        }
        setIsLoading(false);
        return;
      }

      // Save user & token into localStorage
      localStorage.setItem("neurosync_current_user", JSON.stringify(data.user));
      localStorage.setItem("neurosync_token", data.token);

      const targetUser = data.user || { role: formData.userType };
      const targetPath = getLoginRedirectPathForUser(targetUser);

      setSuccessMessage(`🎉 Account created successfully! Redirecting...`);

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        userType: "",
        termsAccepted: false
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(targetPath);
      }, 1500);


    } catch (err) {
      setGeneralError("Cannot connect to server. Please ensure the backend is running.", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">
          Join NeuroSync AI and start your mental wellness journey
        </p>

        {/* Global Error Banner Display */}
        {generalError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>⚠️</span>
            <div>{generalError}</div>
          </div>
        )}

        {/* Global Success Banner Display */}
        {successMessage && (
          <div className="auth-alert auth-alert-success" role="alert">
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="mb-3">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`form-control ${errors.fullName ? "is-invalid-custom" : ""}`}
              placeholder="e.g. Sarah Jenkins"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <div className="field-error-text">⚠️ {errors.fullName}</div>
            )}
          </div>

          {/* Email Address */}
          <div className="mb-3">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid-custom" : ""}`}
              placeholder="e.g. sarah@example.com"
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
                placeholder="Create strong password"
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="password-strength-container">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-secondary">Password strength:</span>
                  <span className="small fw-bold" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="password-strength-track">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${passwordStrength.score}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`form-control ${errors.confirmPassword ? "is-invalid-custom" : ""}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            {errors.confirmPassword && (
              <div className="field-error-text">⚠️ {errors.confirmPassword}</div>
            )}
          </div>

          {/* Select User Category */}
          <div className="mb-3">
            <label htmlFor="userType">Select User Category</label>
            <select
              id="userType"
              name="userType"
              className={`form-select ${errors.userType ? "is-invalid-custom" : ""}`}
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="">Choose category...</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
              <option value="Working Professional">Working Professional</option>
              <option value="Senior Citizen">Senior Citizen</option>
            </select>
            {errors.userType && (
              <div className="field-error-text">⚠️ {errors.userType}</div>
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="mb-3 form-check">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              className="form-check-input"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <label htmlFor="termsAccepted" className="form-check-label small text-secondary">
              I agree to NeuroSync's <a href="#" className="forgot-link">Terms of Service</a> & <a href="#" className="forgot-link">Privacy Policy</a>
            </label>
            {errors.termsAccepted && (
              <div className="field-error-text">⚠️ {errors.termsAccepted}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 mt-2 py-2.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-bottom mb-0">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;