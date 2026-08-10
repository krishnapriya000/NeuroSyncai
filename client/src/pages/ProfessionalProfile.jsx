import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studentDashboard.css";

import ProfessionalSidebar from "../components/professional/ProfessionalSidebar";
import ProfessionalNavbar from "../components/professional/ProfessionalNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import {
  FiUser,
  FiBriefcase,
  FiHeart,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiX,
  FiCamera,
  FiMail,
  FiPhone,
  FiCalendar,
  FiClock,
  FiTarget,
  FiMoon,
  FiUpload,
  FiTrash2
} from "react-icons/fi";

function ProfessionalProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Section 1: Personal
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    profileImage: "",

    // Section 2: Professional
    jobTitle: "",
    company: "",
    industry: "",
    workType: "Office",
    yearsOfExperience: 0,
    workingHours: "9:00 AM - 5:00 PM",
    workingDays: "Monday - Friday",

    // Section 3: Wellness
    avgSleepHours: 7.5,
    dailyFocusGoal: "5 Hours",
    preferredBreakDuration: "15 Minutes",
    wellnessGoal: "Maintain Work-Life Balance",

    // Section 4: Emergency Contact
    contactName: "",
    relationship: "",
    emergencyPhone: "",
    emergencyEmail: "",
  });

  // Track pristine loaded data for Cancel button
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setErrorMessage("");

    const storedUser = localStorage.getItem("neurosync_current_user");
    const token = localStorage.getItem("neurosync_token");

    let defaultName = "";
    let defaultEmail = "";

    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        defaultName = u.fullName || u.name || "";
        defaultEmail = u.email || "";
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    if (!token) {
      // Fallback local populate if unauthenticated / token missing
      const localForm = {
        ...formData,
        fullName: defaultName || "Professional User",
        email: defaultEmail || "professional@neurosync.ai",
      };
      setFormData(localForm);
      setInitialData(localForm);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/professional/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setErrorMessage("Your login session has expired or is invalid. Please log in again.");
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const loadedForm = {
          fullName: d.fullName || defaultName,
          email: d.email || defaultEmail,
          phone: d.phone || "",
          dob: d.dob || "",
          profileImage: d.profileImage || "",

          jobTitle: d.jobTitle || "",
          company: d.company || "",
          industry: d.industry || "",
          workType: d.workType || "Office",
          yearsOfExperience: d.yearsOfExperience ?? 0,
          workingHours: d.workingHours || "9:00 AM - 5:00 PM",
          workingDays: d.workingDays || "Monday - Friday",

          avgSleepHours: d.avgSleepHours ?? 7.5,
          dailyFocusGoal: d.dailyFocusGoal || "5 Hours",
          preferredBreakDuration: d.preferredBreakDuration || "15 Minutes",
          wellnessGoal: d.wellnessGoal || "Maintain Work-Life Balance",

          contactName: d.contactName || "",
          relationship: d.relationship || "",
          emergencyPhone: d.emergencyPhone || "",
          emergencyEmail: d.emergencyEmail || "",
        };
        setFormData(loadedForm);
        setInitialData(loadedForm);
      } else {
        // Fallback default
        const localForm = {
          ...formData,
          fullName: defaultName,
          email: defaultEmail,
        };
        setFormData(localForm);
        setInitialData(localForm);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      const localForm = {
        ...formData,
        fullName: defaultName,
        email: defaultEmail,
      };
      setFormData(localForm);
      setInitialData(localForm);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  // Image Compress helper function (resizes image to max 400x400 to keep payload small & fast)
  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Image Upload Handler (Device / Gallery Picker with auto-compression)
  const handleImageFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file, 400, 400, 0.82);
      setFormData((prev) => ({
        ...prev,
        profileImage: compressedBase64,
      }));
      if (errorMessage) setErrorMessage("");
      if (successMessage) setSuccessMessage("");
    } catch (err) {
      console.error("Image processing error:", err);
      setErrorMessage("Failed to process image file. Please try another image.");
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return false;
    }

    if (!formData.jobTitle.trim()) {
      setErrorMessage("Job Title / Profession is required.");
      return false;
    }

    if (!formData.workType) {
      setErrorMessage("Work Type is required.");
      return false;
    }

    const expNum = Number(formData.yearsOfExperience);
    if (isNaN(expNum) || expNum < 0) {
      setErrorMessage("Years of Experience must be a valid number (0 or greater).");
      return false;
    }

    const sleepNum = Number(formData.avgSleepHours);
    if (isNaN(sleepNum) || sleepNum < 1 || sleepNum > 24) {
      setErrorMessage("Average Sleep Hours must be a valid number between 1 and 24.");
      return false;
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setErrorMessage("Please enter a valid phone number format.");
        return false;
      }
    }

    if (formData.emergencyEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emergencyEmail.trim())) {
        setErrorMessage("Please enter a valid emergency contact email address.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) return;

    setSaving(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      if (token) {
        const res = await fetch("http://localhost:5000/api/professional/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          let errText = "Failed to update profile.";
          if (res.status === 401) {
            localStorage.removeItem("neurosync_token");
            localStorage.removeItem("neurosync_current_user");
            setErrorMessage("Session expired. Redirecting to Login...");
            setTimeout(() => {
              navigate("/login");
            }, 1800);
            setSaving(false);
            return;
          }
          try {
            const errJson = await res.json();
            errText = errJson.message || errText;
          } catch (e) {
            if (res.status === 413) {
              errText = "Selected image payload is too large. Please try a smaller image.";
            }
          }
          setErrorMessage(errText);
          setSaving(false);
          return;
        }

        const json = await res.json();
        if (json.success) {
          setSuccessMessage("Profile updated successfully.");
          setInitialData(formData);

          // Sync localStorage current user full name & profile image
          const storedUser = localStorage.getItem("neurosync_current_user");
          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              u.fullName = formData.fullName;
              u.occupation = formData.jobTitle;
              u.profileImage = formData.profileImage;
              localStorage.setItem("neurosync_current_user", JSON.stringify(u));
            } catch (err) {
              console.error("Error updating local storage user:", err);
            }
          }
        } else {
          setErrorMessage(json.message || "Failed to update profile.");
        }
      } else {
        // Offline / Unauthenticated fallback save
        setSuccessMessage("Profile updated successfully.");
        setInitialData(formData);
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMessage("Network or server connection error: " + err.message);
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
    setSuccessMessage("");
    setErrorMessage("");
    navigate("/professional/dashboard");
  };

  return (
    <div className="dashboard-container">
      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="d-none"
        onChange={handleImageFileChange}
      />

      {/* SIDEBAR */}
      <ProfessionalSidebar
        activeTab="profile"
        setActiveTab={(tab) => {
          if (tab === "overview" || tab === "dashboard") {
            navigate("/professional/dashboard");
          }
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* NAVBAR */}
      <ProfessionalNavbar
        userName={formData.fullName || "Professional User"}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onTabChange={(tab) => {
          if (tab === "overview" || tab === "dashboard") navigate("/professional/dashboard");
        }}
      />

      {/* MAIN CONTENT */}
      <main className="ns-main-content">
        {/* Page Title Header */}
        <div className="mb-4">
          <h1 className="fw-bold fs-3 text-white mb-1">Professional Profile</h1>
          <p className="text-gray-300 mb-0" style={{ fontSize: "0.95rem", color: "#CBD5E1" }}>
            Manage your personal, professional and wellness information.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="alert bg-success bg-opacity-20 text-success border border-success border-opacity-30 rounded-3 p-3 mb-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <FiCheckCircle size={20} />
              <span className="fw-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white ms-auto"
              onClick={() => setSuccessMessage("")}
            />
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="alert bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30 rounded-3 p-3 mb-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <FiAlertCircle size={20} />
              <span className="fw-semibold">{errorMessage}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white ms-auto"
              onClick={() => setErrorMessage("")}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading Profile...</span>
            </div>
            <p className="text-muted mt-2" style={{ fontSize: "0.88rem" }}>Loading profile information...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row g-4 mb-4">
              {/* SECTION 1 — PERSONAL INFORMATION */}
              <div className="col-12 col-lg-6">
                <div className="ns-card h-100 p-4">
                  <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary">
                      <FiUser className="fs-5" />
                    </div>
                    <h5 className="mb-0 text-white fw-bold fs-6">1. Personal Information</h5>
                  </div>

                  {/* Profile Photo Avatar & Gallery Upload Controls */}
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4 p-3 rounded-4 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-md position-relative cursor-pointer overflow-hidden flex-shrink-0"
                      style={{
                        width: "76px",
                        height: "76px",
                        background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                        border: "2.5px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "1.8rem"
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      title="Click to change profile picture from gallery"
                    >
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Profile Avatar"
                          className="w-100 h-100 object-fit-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "P"
                      )}
                      <div 
                        className="position-absolute bottom-0 w-100 text-center py-1 bg-dark bg-opacity-75 text-white"
                        style={{ fontSize: "0.65rem" }}
                      >
                        <FiCamera />
                      </div>
                    </div>

                    <div className="flex-grow-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{ fontSize: "0.86rem" }}>
                        Profile Photo
                      </label>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 fw-medium shadow-sm"
                          style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none", fontSize: "0.82rem" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FiUpload size={14} /> Upload from Gallery
                        </button>

                        {formData.profileImage && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-pill px-2.5 d-flex align-items-center gap-1 border-opacity-30"
                            style={{ fontSize: "0.78rem" }}
                            onClick={handleRemovePhoto}
                          >
                            <FiTrash2 size={13} /> Remove
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-link text-muted btn-sm text-decoration-none p-0 ms-1"
                          style={{ fontSize: "0.76rem" }}
                          onClick={() => setShowUrlInput(!showUrlInput)}
                        >
                          {showUrlInput ? "Hide URL input" : "Or use URL"}
                        </button>
                      </div>

                      {showUrlInput && (
                        <div className="mt-2">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary border-opacity-25"
                            name="profileImage"
                            value={formData.profileImage}
                            onChange={handleChange}
                            placeholder="Paste image URL (https://...)"
                            style={{ fontSize: "0.8rem" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                        <FiUser />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="mb-3">
                    <label className="form-label text-muted fw-medium" style={{ fontSize: "0.85rem" }}>
                      Email Address <span className="extra-small text-muted font-normal">(Read-only)</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                        <FiMail />
                      </span>
                      <input
                        type="email"
                        className="form-control bg-dark text-white-50 border-secondary border-opacity-25"
                        value={formData.email}
                        readOnly
                        disabled
                        style={{ cursor: "not-allowed" }}
                      />
                    </div>
                  </div>

                  {/* Phone & Date of Birth */}
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Phone Number
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                          <FiPhone />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Date of Birth / Age
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                          <FiCalendar />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          placeholder="YYYY-MM-DD or Age (32)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — PROFESSIONAL INFORMATION */}
              <div className="col-12 col-lg-6">
                <div className="ns-card h-100 p-4">
                  <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <div className="p-2 rounded-3 bg-purple-500 bg-opacity-25 text-purple-400" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}>
                      <FiBriefcase className="fs-5" />
                    </div>
                    <h5 className="mb-0 text-white fw-bold fs-6">2. Professional Information</h5>
                  </div>

                  {/* Job Title */}
                  <div className="mb-3">
                    <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                      Job Title / Profession <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary border-opacity-25"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="Senior Software Engineer, Product Manager, etc."
                      required
                    />
                  </div>

                  {/* Company & Industry */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Acme Corp"
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Industry
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="Technology, Healthcare, Finance..."
                      />
                    </div>
                  </div>

                  {/* Work Type */}
                  <div className="mb-3">
                    <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                      Work Type <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-3 mt-1">
                      {["Office", "Remote", "Hybrid"].map((type) => (
                        <div key={type} className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id={`workType-${type}`}
                            name="workType"
                            value={type}
                            checked={formData.workType === type}
                            onChange={handleChange}
                          />
                          <label className="form-check-label text-light cursor-pointer" htmlFor={`workType-${type}`} style={{ fontSize: "0.88rem" }}>
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Years of Exp, Working Hours, Working Days */}
                  <div className="row g-3">
                    <div className="col-12 col-sm-4">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        step="1"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-sm-4">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Working Hours
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        name="workingHours"
                        value={formData.workingHours}
                        onChange={handleChange}
                        placeholder="9 AM - 5 PM"
                      />
                    </div>

                    <div className="col-12 col-sm-4">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Working Days
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        name="workingDays"
                        value={formData.workingDays}
                        onChange={handleChange}
                        placeholder="Mon - Fri"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — WELLNESS PREFERENCES */}
              <div className="col-12 col-lg-6">
                <div className="ns-card h-100 p-4">
                  <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <div className="p-2 rounded-3 bg-success bg-opacity-25 text-success">
                      <FiHeart className="fs-5" />
                    </div>
                    <h5 className="mb-0 text-white fw-bold fs-6">3. Wellness Preferences</h5>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Average Sleep Hours (Daily)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                          <FiMoon />
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          step="0.5"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="avgSleepHours"
                          value={formData.avgSleepHours}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Daily Focus Goal
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                          <FiTarget />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="dailyFocusGoal"
                          value={formData.dailyFocusGoal}
                          onChange={handleChange}
                          placeholder="5 Hours"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Preferred Break Duration
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                          <FiClock />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="preferredBreakDuration"
                          value={formData.preferredBreakDuration}
                          onChange={handleChange}
                          placeholder="15 Minutes"
                        />
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                        Primary Wellness Goal
                      </label>
                      <select
                        className="form-select bg-dark text-white border-secondary border-opacity-25"
                        name="wellnessGoal"
                        value={formData.wellnessGoal}
                        onChange={handleChange}
                      >
                        <option value="Reduce Stress">Reduce Stress</option>
                        <option value="Improve Sleep">Improve Sleep</option>
                        <option value="Improve Focus">Improve Focus</option>
                        <option value="Maintain Work-Life Balance">Maintain Work-Life Balance</option>
                        <option value="Prevent Burnout">Prevent Burnout</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4 — EMERGENCY / SUPPORT CONTACT */}
              <div className="col-12 col-lg-6">
                <div className="ns-card h-100 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                      <div className="p-2 rounded-3 bg-warning bg-opacity-25 text-warning">
                        <FiShield className="fs-5" />
                      </div>
                      <h5 className="mb-0 text-white fw-bold fs-6">4. Emergency / Support Contact</h5>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                          Contact Name
                        </label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleChange}
                          placeholder="Jane Doe"
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                          Relationship
                        </label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="relationship"
                          value={formData.relationship}
                          onChange={handleChange}
                          placeholder="Spouse, Partner, Friend..."
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label text-light fw-medium" style={{ fontSize: "0.85rem" }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          name="emergencyEmail"
                          value={formData.emergencyEmail}
                          onChange={handleChange}
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mt-2">
                    <p className="mb-0 text-muted" style={{ fontSize: "0.78rem", lineHeight: "1.45" }}>
                      💡 <em>This contact may be used for important wellness alerts if enabled in the future.</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-flex align-items-center justify-content-end gap-3 pt-3 border-top border-secondary border-opacity-25 mb-4">
              <button
                type="button"
                className="btn btn-outline-light rounded-pill px-4 py-2"
                onClick={handleCancel}
                disabled={saving}
              >
                <FiX className="me-1" /> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="me-1" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* FOOTER */}
      <DashboardFooter />
    </div>
  );
}

export default ProfessionalProfile;
