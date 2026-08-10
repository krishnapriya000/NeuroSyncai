import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBook, 
  FiSmile, 
  FiSave, 
  FiArrowLeft,
  FiCheckCircle,
  FiZap,
  FiClock,
  FiTarget,
  FiShield,
  FiCalendar,
  FiAlertTriangle,
  FiBell,
  FiHeart,
  FiTrash2,
  FiUsers
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function StudentProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Student Profile State
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Other",
    occupation: "",
    lifestyle: "",
    profileImage: "",
    role: "Student",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Emergency Contact Form State
  const [emergencyForm, setEmergencyForm] = useState({
    guardianName: "",
    relationship: "",
    guardianEmail: "",
    guardianPhone: "",
    emergencyAlertsEnabled: true,
  });

  const [hasEmergencyContact, setHasEmergencyContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSuccessMsg, setContactSuccessMsg] = useState("");
  const [contactErrorMsg, setContactErrorMsg] = useState("");

  // Emergency Alert History State
  const [alertHistory, setAlertHistory] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchProfileFromDB();
    fetchEmergencyContactFromDB();
    fetchAlertHistoryFromDB();
  }, []);

  const fetchProfileFromDB = async () => {
    setIsLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setErrorMsg("Authentication token missing. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/student/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Failed to load profile from database.");
        setIsLoading(false);
        return;
      }

      const dbUser = data.user;
      setUserProfile({
        fullName: dbUser.fullName || "",
        email: dbUser.email || "",
        phone: dbUser.phone || "",
        dob: dbUser.dob || (dbUser.dateOfBirth ? dbUser.dateOfBirth.split("T")[0] : "") || "",
        gender: dbUser.gender || "Other",
        occupation: dbUser.occupation || "",
        lifestyle: dbUser.lifestyle || "",
        profileImage: dbUser.profileImage || "",
        role: dbUser.role || "Student",
      });

      localStorage.setItem("neurosync_current_user", JSON.stringify(dbUser));
    } catch (err) {
      console.error("Fetch profile DB error:", err);
      setErrorMsg("Cannot connect to server to fetch profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmergencyContactFromDB = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/student/emergency/contact", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.contact) {
        setHasEmergencyContact(true);
        setEmergencyForm({
          guardianName: data.contact.guardianName || "",
          relationship: data.contact.relationship || "",
          guardianEmail: data.contact.guardianEmail || "",
          guardianPhone: data.contact.guardianPhone || "",
          emergencyAlertsEnabled: data.contact.emergencyAlertsEnabled !== false,
        });
      } else {
        setHasEmergencyContact(false);
      }
    } catch (err) {
      console.error("Fetch emergency contact error:", err);
    }
  };

  const fetchAlertHistoryFromDB = async () => {
    setIsLoadingAlerts(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/student/emergency/alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlertHistory(data.alerts || []);
      }
    } catch (err) {
      console.error("Fetch alert history error:", err);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (successMsg) setSuccessMsg("");
    if (errorMsg) setErrorMsg("");
  };

  const handleEmergencyChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setEmergencyForm((prev) => ({
      ...prev,
      [name]: val,
    }));
    if (contactSuccessMsg) setContactSuccessMsg("");
    if (contactErrorMsg) setContactErrorMsg("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!userProfile.fullName.trim()) {
      setErrorMsg("Full Name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("neurosync_token");

      const response = await fetch("http://localhost:5000/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: userProfile.fullName.trim(),
          phone: userProfile.phone.trim(),
          dob: userProfile.dob,
          gender: userProfile.gender,
          occupation: userProfile.occupation.trim(),
          lifestyle: userProfile.lifestyle.trim(),
          profileImage: userProfile.profileImage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Failed to save profile to database.");
        setIsSaving(false);
        return;
      }

      setSuccessMsg(data.message || "🎉 Profile updated and saved to database successfully!");
      setIsEditing(false);

      if (data.user) {
        localStorage.setItem("neurosync_current_user", JSON.stringify(data.user));
      }

      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
    } catch (err) {
      console.error("Save profile DB error:", err);
      setErrorMsg("Cannot connect to server to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmergencyContact = async (e) => {
    e.preventDefault();
    setContactErrorMsg("");
    setContactSuccessMsg("");

    if (!emergencyForm.guardianName.trim()) {
      setContactErrorMsg("Guardian name is required.");
      return;
    }

    if (!emergencyForm.relationship.trim()) {
      setContactErrorMsg("Relationship is required.");
      return;
    }

    if (!emergencyForm.guardianEmail.trim()) {
      setContactErrorMsg("Guardian email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emergencyForm.guardianEmail.trim())) {
      setContactErrorMsg("Please enter a valid guardian email address.");
      return;
    }

    setIsSavingContact(true);

    try {
      const token = localStorage.getItem("neurosync_token");

      const response = await fetch("http://localhost:5000/api/student/emergency/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guardianName: emergencyForm.guardianName.trim(),
          relationship: emergencyForm.relationship.trim(),
          guardianEmail: emergencyForm.guardianEmail.trim(),
          guardianPhone: emergencyForm.guardianPhone.trim(),
          emergencyAlertsEnabled: emergencyForm.emergencyAlertsEnabled,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setContactErrorMsg(data.message || "Failed to save emergency contact.");
        setIsSavingContact(false);
        return;
      }

      setHasEmergencyContact(true);
      setContactSuccessMsg(
        hasEmergencyContact
          ? "🛡️ Emergency contact updated successfully!"
          : "🛡️ Emergency contact saved and registered successfully!"
      );

      fetchAlertHistoryFromDB();

      setTimeout(() => {
        setContactSuccessMsg("");
      }, 4000);
    } catch (err) {
      console.error("Save emergency contact error:", err);
      setContactErrorMsg("Server error occurred while saving emergency contact.");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleDeleteEmergencyContact = async () => {
    if (!window.confirm("Are you sure you want to remove your emergency contact?")) return;

    setContactErrorMsg("");
    setContactSuccessMsg("");
    setIsSavingContact(true);

    try {
      const token = localStorage.getItem("neurosync_token");
      const response = await fetch("http://localhost:5000/api/student/emergency/contact", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setContactErrorMsg(data.message || "Failed to delete emergency contact.");
        setIsSavingContact(false);
        return;
      }

      setHasEmergencyContact(false);
      setEmergencyForm({
        guardianName: "",
        relationship: "",
        guardianEmail: "",
        guardianPhone: "",
        emergencyAlertsEnabled: true,
      });

      setContactSuccessMsg("Emergency contact removed successfully.");

      setTimeout(() => {
        setContactSuccessMsg("");
      }, 4000);
    } catch (err) {
      console.error("Delete emergency contact error:", err);
      setContactErrorMsg("Server error occurred while deleting emergency contact.");
    } finally {
      setIsSavingContact(false);
    }
  };

  // Helper to format Date for Alert History
  const formatAlertDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitial = () => {
    if (!userProfile.fullName) return "S";
    return userProfile.fullName.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Top Navbar */}
      <TopNavbar 
        studentName={userProfile.fullName || "Student"} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />

      {/* Main Content Area */}
      <main className="ns-main-content">
        {/* Navigation / Header Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <button 
              onClick={() => navigate("/student/dashboard")}
              className="btn btn-outline-secondary btn-sm rounded-pill text-white border-secondary mb-2 d-inline-flex align-items-center gap-2"
            >
              <FiArrowLeft /> Back to Student Dashboard
            </button>
            <h1 className="fw-bold text-white fs-3 mb-1">Student Profile</h1>
            <p className="text-secondary small mb-0">Enter and update your profile details and emergency contact settings.</p>
          </div>
          <button 
            className={`btn ${isEditing ? "btn-outline-light" : "btn-primary"} rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2`}
            onClick={() => setIsEditing(!isEditing)}
            disabled={isLoading}
          >
            {isEditing ? "Cancel Editing" : "✏️ Edit Profile"}
          </button>
        </div>

        {/* Loading Spinner State */}
        {isLoading ? (
          <div className="p-5 text-center text-white my-5 rounded-4 bg-dark bg-opacity-50">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
            <h5 className="fw-bold">Loading Student Profile from Database...</h5>
            <p className="text-secondary small">Fetching your record from MongoDB</p>
          </div>
        ) : (
          <>
            {/* Profile Notifications */}
            {successMsg && (
              <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 d-flex align-items-center gap-2 mb-4" role="alert">
                <FiCheckCircle size={20} />
                <div>{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 d-flex align-items-center gap-2 mb-4" role="alert">
                <span>⚠️</span>
                <div>{errorMsg}</div>
              </div>
            )}

            {/* Student Profile Hero Header Card */}
            <div 
              className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg"
              style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)",
                border: "1px solid rgba(255, 255, 255, 0.12)"
              }}
            >
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="position-relative">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg"
                      style={{
                        width: "90px",
                        height: "90px",
                        fontSize: "2.2rem",
                        background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                        border: "3px solid rgba(255, 255, 255, 0.25)"
                      }}
                    >
                      {userProfile.profileImage ? (
                        <img 
                          src={userProfile.profileImage} 
                          alt="Student Avatar" 
                          className="rounded-circle w-100 h-100" 
                          style={{ objectFit: "cover" }} 
                        />
                      ) : (
                        getInitial()
                      )}
                    </div>
                  </div>
                </div>

                <div className="col ms-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h2 className="fw-bold fs-3 mb-0 text-white">{userProfile.fullName || "Student User"}</h2>
                    <span className="badge bg-primary text-white rounded-pill px-3 py-1" style={{ fontSize: "0.78rem" }}>
                      🎓 {userProfile.role}
                    </span>
                  </div>
                  <p className="text-secondary small mb-2">{userProfile.email} {userProfile.occupation ? `• ${userProfile.occupation}` : ""}</p>
                  <div className="d-flex flex-wrap gap-3 text-secondary" style={{ fontSize: "0.83rem" }}>
                    <span>📍 Database Status: <strong className="text-success">Synced with MongoDB</strong></span>
                    <span>🛡️ Emergency Alert: <strong className={emergencyForm.emergencyAlertsEnabled ? "text-success" : "text-warning"}>{emergencyForm.emergencyAlertsEnabled ? "Emergency Alerts: ON" : "Emergency Alerts: OFF"}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Quick Stat Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="d-flex align-items-center gap-2 text-primary mb-1">
                    <FiZap />
                    <span className="small text-secondary fw-semibold">Study Streak</span>
                  </div>
                  <div className="fs-4 fw-bold">7 Days 🔥</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="d-flex align-items-center gap-2 text-info mb-1">
                    <FiClock />
                    <span className="small text-secondary fw-semibold">Focus Hours</span>
                  </div>
                  <div className="fs-4 fw-bold">34.5 hrs</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="d-flex align-items-center gap-2 text-success mb-1">
                    <FiSmile />
                    <span className="small text-secondary fw-semibold">Mood Score</span>
                  </div>
                  <div className="fs-4 fw-bold">88% Calm</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="p-3 rounded-4 bg-slate-900 border border-slate-800 text-white" style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <FiTarget />
                    <span className="small text-secondary fw-semibold">Goals Met</span>
                  </div>
                  <div className="fs-4 fw-bold">12 / 15</div>
                </div>
              </div>
            </div>

            {/* Profile Details & Form */}
            <div className="row g-4 mb-4">
              {/* Main Details Form */}
              <div className="col-lg-8">
                <div 
                  className="p-4 rounded-4 text-white shadow-sm mb-4"
                  style={{
                    background: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-white">
                    <FiUser className="text-primary" /> Database Student Information
                  </h5>

                  <form onSubmit={handleSave}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Full Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiUser />
                          </span>
                          <input 
                            type="text" 
                            name="fullName"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="Enter your full name"
                            value={userProfile.fullName}
                            onChange={handleChange}
                            disabled={!isEditing || isSaving}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Email Address (Read-only)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiMail />
                          </span>
                          <input 
                            type="email" 
                            name="email"
                            className="form-control bg-dark text-white-50 border-secondary border-opacity-25"
                            value={userProfile.email}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Phone Number</label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiPhone />
                          </span>
                          <input 
                            type="text" 
                            name="phone"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="e.g. +1 (555) 234-5678"
                            value={userProfile.phone}
                            onChange={handleChange}
                            disabled={!isEditing || isSaving}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label text-secondary small fw-semibold">Date of Birth (DOB)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiCalendar />
                          </span>
                          <input 
                            type="date" 
                            name="dob"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            style={{ colorScheme: "dark" }}
                            value={userProfile.dob}
                            onChange={handleChange}
                            disabled={!isEditing || isSaving}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label text-secondary small fw-semibold">Gender</label>
                        <select 
                          name="gender"
                          className="form-select bg-dark text-white border-secondary border-opacity-25"
                          value={userProfile.gender}
                          onChange={handleChange}
                          disabled={!isEditing || isSaving}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Major / Academic Discipline</label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiBook />
                          </span>
                          <input 
                            type="text" 
                            name="occupation"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="e.g. Computer Science & AI"
                            value={userProfile.occupation}
                            onChange={handleChange}
                            disabled={!isEditing || isSaving}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Study Focus / Lifestyle Goal</label>
                        <input 
                          type="text" 
                          name="lifestyle"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          placeholder="e.g. Deep Focus & Cognitive Wellness"
                          value={userProfile.lifestyle}
                          onChange={handleChange}
                          disabled={!isEditing || isSaving}
                        />
                      </div>

                      {isEditing && (
                        <div className="col-12">
                          <label className="form-label text-secondary small fw-semibold">Avatar Image URL (Optional)</label>
                          <input 
                            type="text" 
                            name="profileImage"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="https://example.com/photo.jpg"
                            value={userProfile.profileImage}
                            onChange={handleChange}
                            disabled={isSaving}
                          />
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary text-white rounded-pill px-4"
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                              Saving to Database...
                            </>
                          ) : (
                            <>
                              <FiSave /> Save Profile to Database
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* ==================================================
                    SECTION: EMERGENCY CONTACT (Requirement 1 & 12)
                    ================================================== */}
                <div 
                  className="p-4 rounded-4 text-white shadow-sm mb-4"
                  style={{
                    background: "#0F172A",
                    border: "1px solid rgba(239, 68, 68, 0.25)"
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-white">
                      <span style={{ fontSize: "1.3rem" }}>🛡️</span> Emergency Contact
                    </h5>
                    <span 
                      className={`badge rounded-pill px-3 py-1.5 fw-semibold ${
                        emergencyForm.emergencyAlertsEnabled
                          ? "bg-success bg-opacity-20 text-success border border-success border-opacity-50"
                          : "bg-secondary bg-opacity-20 text-warning border border-warning border-opacity-50"
                      }`}
                    >
                      Emergency Alerts: {emergencyForm.emergencyAlertsEnabled ? "ON" : "OFF"}
                    </span>
                  </div>

                  <p className="text-secondary small mb-4">
                    Add a trusted parent or guardian who can be contacted if NeuroSync detects a high-risk wellbeing situation.
                  </p>

                  {/* Feedback Banners */}
                  {contactSuccessMsg && (
                    <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 d-flex align-items-center gap-2 mb-4" role="alert">
                      <FiCheckCircle size={20} />
                      <div>{contactSuccessMsg}</div>
                    </div>
                  )}

                  {contactErrorMsg && (
                    <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 d-flex align-items-center gap-2 mb-4" role="alert">
                      <FiAlertTriangle size={20} />
                      <div>{contactErrorMsg}</div>
                    </div>
                  )}

                  <form onSubmit={handleSaveEmergencyContact}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">
                          Guardian Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiUser />
                          </span>
                          <input 
                            type="text" 
                            name="guardianName"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="e.g. Anu Rajesh"
                            value={emergencyForm.guardianName}
                            onChange={handleEmergencyChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">
                          Relationship <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiUsers />
                          </span>
                          <input 
                            type="text" 
                            name="relationship"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="e.g. Mother, Father, Guardian"
                            value={emergencyForm.relationship}
                            onChange={handleEmergencyChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">
                          Guardian Email <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiMail />
                          </span>
                          <input 
                            type="email" 
                            name="guardianEmail"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="guardian@example.com"
                            value={emergencyForm.guardianEmail}
                            onChange={handleEmergencyChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">
                          Phone Number (Optional)
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                            <FiPhone />
                          </span>
                          <input 
                            type="text" 
                            name="guardianPhone"
                            className="form-control bg-dark text-white border-secondary border-opacity-25"
                            placeholder="e.g. +91 9876543210"
                            value={emergencyForm.guardianPhone}
                            onChange={handleEmergencyChange}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                          <div>
                            <div className="fw-semibold text-white mb-0">Emergency Alerts Status</div>
                            <div className="text-secondary small">Automatically notify guardian if high-risk pattern is detected</div>
                          </div>
                          <div className="form-check form-switch fs-4 mb-0">
                            <input
                              className="form-check-input style-toggle-switch"
                              type="checkbox"
                              role="switch"
                              name="emergencyAlertsEnabled"
                              id="emergencyAlertsSwitch"
                              checked={emergencyForm.emergencyAlertsEnabled}
                              onChange={handleEmergencyChange}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                      {hasEmergencyContact ? (
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1"
                          onClick={handleDeleteEmergencyContact}
                          disabled={isSavingContact}
                        >
                          <FiTrash2 size={14} /> Remove Contact
                        </button>
                      ) : (
                        <span className="text-secondary small">No guardian contact configured yet</span>
                      )}

                      <button 
                        type="submit" 
                        className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2 fw-bold"
                        disabled={isSavingContact}
                      >
                        {isSavingContact ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            Saving Contact...
                          </>
                        ) : (
                          <>
                            <FiSave /> {hasEmergencyContact ? "Update Contact" : "Save Emergency Contact"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* ==================================================
                    SECTION: EMERGENCY ALERT HISTORY (Requirement 9 & 12)
                    ================================================== */}
                <div 
                  className="p-4 rounded-4 text-white shadow-sm"
                  style={{
                    background: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <h5 className="fw-bold mb-2 d-flex align-items-center gap-2 text-white">
                    <FiBell className="text-warning" /> Emergency Alert History
                  </h5>
                  <p className="text-secondary small mb-4">
                    Log of wellbeing evaluations and automated guardian notifications.
                  </p>

                  {isLoadingAlerts ? (
                    <div className="text-center py-4 text-secondary">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      Loading alert history...
                    </div>
                  ) : alertHistory.length === 0 ? (
                    <div className="p-4 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25 text-center">
                      <FiCheckCircle size={32} className="text-success mb-2" />
                      <div className="fw-semibold text-white mb-1">No Emergency Alerts Triggered</div>
                      <p className="text-secondary small mb-0">Your recent check-in & mood records show balanced wellbeing scores.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {alertHistory.map((alertItem) => {
                        const isHigh = alertItem.riskLevel === "HIGH_RISK";
                        const isMod = alertItem.riskLevel === "MODERATE_RISK";

                        const badgeBg = isHigh ? "#EF4444" : isMod ? "#F59E0B" : "#10B981";
                        const badgeLabel = isHigh ? "🔴 High Risk" : isMod ? "🟡 Moderate Risk" : "🟢 Low Risk";

                        const statusLabel =
                          alertItem.status === "SENT"
                            ? "Guardian notified"
                            : alertItem.status === "COOLDOWN_SKIPPED"
                            ? "Cooldown Active (Skipped)"
                            : alertItem.status === "ALERTS_DISABLED"
                            ? "Alerts Disabled"
                            : "Notification Failed";

                        const statusClass =
                          alertItem.status === "SENT"
                            ? "text-success"
                            : alertItem.status === "COOLDOWN_SKIPPED"
                            ? "text-info"
                            : "text-danger";

                        return (
                          <div 
                            key={alertItem._id}
                            className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25"
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span 
                                className="badge rounded-pill px-3 py-1.5 fw-semibold"
                                style={{ background: badgeBg, color: "#FFF" }}
                              >
                                {badgeLabel}
                              </span>

                              <span className="text-secondary small d-flex align-items-center gap-1">
                                <FiClock size={13} />
                                {formatAlertDate(alertItem.createdAt || alertItem.sentAt)}
                              </span>
                            </div>

                            <div className="d-flex align-items-center justify-content-between mt-2">
                              <span className={`fw-semibold small ${statusClass}`}>
                                {statusLabel}
                              </span>
                              <span className="text-secondary small">
                                {alertItem.guardianEmail}
                              </span>
                            </div>

                            {alertItem.triggerReason && (
                              <div className="mt-2 text-secondary small font-monospace opacity-75 text-truncate" style={{ fontSize: "0.78rem" }}>
                                Reason: {alertItem.triggerReason}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Side Card: Academic Summary & Security */}
              <div className="col-lg-4">
                <div 
                  className="p-4 rounded-4 text-white shadow-sm mb-4"
                  style={{
                    background: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
                    <FiShield className="text-success" /> Database Protection
                  </h6>
                  <p className="text-secondary small mb-3">
                    Your profile details and emergency contact settings are stored in MongoDB and protected with JWT token encryption.
                  </p>

                  <div className="d-flex flex-column gap-2">
                    <button 
                      className="btn btn-outline-light btn-sm text-start rounded-3 p-2 text-decoration-none"
                      onClick={() => navigate("/reset-password")}
                    >
                      🔑 Change Account Password
                    </button>
                    <div className="p-2 rounded bg-white bg-opacity-5 text-secondary small">
                      <strong>Role Access:</strong> <span className="text-info">Student Only Portal</span>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-4 text-white shadow-sm"
                  style={{
                    background: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <h6 className="fw-bold mb-3 text-white">🎓 Student Quick Actions</h6>
                  <div className="d-flex flex-column gap-2">
                    <button 
                      className="btn btn-primary btn-sm rounded-pill text-start px-3 py-2"
                      onClick={() => navigate("/student/dashboard")}
                    >
                      📊 Go to Main Dashboard
                    </button>
                    <button 
                      className="btn btn-outline-info btn-sm rounded-pill text-start px-3 py-2 text-info"
                      onClick={() => alert("NeuroSync AI Assistant ready for study support!")}
                    >
                      🤖 Talk to Study AI
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
}

export default StudentProfile;
