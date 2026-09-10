import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import ChildFaceAnalysisModal from "../components/parent/ChildFaceAnalysisModal";
import {
  FiCheckSquare,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiAlertCircle,
  FiUser,
  FiArrowLeft,
  FiArrowRight,
  FiPlus,
  FiEye,
  FiInfo,
  FiX,
  FiCamera
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentCheckInPage() {
  const navigate = useNavigate();
  const { childId: routeChildId } = useParams();

  const [activeTab, setActiveTab] = useState("check-in");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");

  const [isLoading, setIsLoading] = useState(true);
  const [statusData, setStatusData] = useState({
    todayDate: "",
    totalChildren: 0,
    completedCount: 0,
    children: [],
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Survey Flow State
  const [activeChildForSurvey, setActiveChildForSurvey] = useState(null);
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyForm, setSurveyForm] = useState({
    mood: "",
    energy: "",
    socialInteraction: "",
    unusualBehavior: false,
    unusualBehaviorNote: "",
    wellbeingScore: 0,
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyError, setSurveyError] = useState("");
  const [surveySuccess, setSurveySuccess] = useState("");

  // Read-only View Modal State
  const [viewChildRecord, setViewChildRecord] = useState(null);

  // Face Analysis Modal State
  const [activeChildForFaceAnalysis, setActiveChildForFaceAnalysis] = useState(null);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
    fetchCheckInStatus();
  }, []);

  // Handle routeChildId param if passed via URL
  useEffect(() => {
    if (routeChildId && statusData.children.length > 0) {
      const target = statusData.children.find(
        (c) => (c.childId && c.childId.toString() === routeChildId) || (c.parentChildId && c.parentChildId.toString() === routeChildId)
      );
      if (target) {
        if (target.status === "completed") {
          setViewChildRecord(target);
        } else {
          openStartSurvey(target);
        }
      }
    }
  }, [routeChildId, statusData]);

  const fetchCheckInStatus = async () => {
    setIsLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setErrorMsg("Authentication token missing. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/parent/check-ins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusData(data);
      } else {
        setErrorMsg(data.message || "Failed to load check-in status.");
      }
    } catch (err) {
      console.error("Fetch check-in status error:", err);
      setErrorMsg("Server error loading check-in data.");
    } finally {
      setIsLoading(false);
    }
  };

  const openStartSurvey = (child) => {
    setActiveChildForSurvey(child);
    setSurveyStep(1);
    setSurveyForm({
      mood: "",
      energy: "",
      socialInteraction: "",
      unusualBehavior: false,
      unusualBehaviorNote: "",
      wellbeingScore: 0,
      additionalNotes: "",
    });
    setSurveyError("");
    setSurveySuccess("");
  };

  const handleSurveyOptionSelect = (field, value) => {
    setSurveyForm((prev) => ({ ...prev, [field]: value }));
    if (surveyError) setSurveyError("");
  };

  const handleNextStep = () => {
    setSurveyError("");
    if (surveyStep === 1 && !surveyForm.mood) {
      setSurveyError("Please select your child's mood today.");
      return;
    }
    if (surveyStep === 2 && !surveyForm.energy) {
      setSurveyError("Please select your child's energy level today.");
      return;
    }
    if (surveyStep === 3 && !surveyForm.socialInteraction) {
      setSurveyError("Please select how social interaction was today.");
      return;
    }
    if (surveyStep === 4 && surveyForm.unusualBehavior && !surveyForm.unusualBehaviorNote.trim()) {
      setSurveyError("Please briefly describe the unusual behavior observed.");
      return;
    }
    if (surveyStep === 5 && !surveyForm.wellbeingScore) {
      setSurveyError("Please select an overall wellbeing rating (1 to 5 stars).");
      return;
    }

    if (surveyStep < 6) {
      setSurveyStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setSurveyError("");
    if (surveyStep > 1) {
      setSurveyStep((prev) => prev - 1);
    }
  };

  const handleSubmitSurvey = async (e) => {
    if (e) e.preventDefault();
    setSurveyError("");
    setSurveySuccess("");

    if (!surveyForm.mood || !surveyForm.energy || !surveyForm.socialInteraction || !surveyForm.wellbeingScore) {
      setSurveyError("Please complete all required survey questions.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/parent/check-ins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parentChildId: activeChildForSurvey.parentChildId,
          mood: surveyForm.mood,
          energy: surveyForm.energy,
          socialInteraction: surveyForm.socialInteraction,
          unusualBehavior: surveyForm.unusualBehavior,
          unusualBehaviorNote: surveyForm.unusualBehaviorNote,
          wellbeingScore: surveyForm.wellbeingScore,
          additionalNotes: surveyForm.additionalNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSurveyError(data.message || "Failed to submit check-in.");
        setIsSubmitting(false);
        return;
      }

      setSurveySuccess("Check-in completed successfully.");
      fetchCheckInStatus();

      setTimeout(() => {
        setSurveySuccess("");
        setActiveChildForSurvey(null);
      }, 1600);
    } catch (err) {
      console.error("Submit check-in error:", err);
      setSurveyError("Server error submitting check-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitial = (name) => {
    if (!name) return "C";
    return name.trim().charAt(0).toUpperCase();
  };

  const percentage = statusData.totalChildren > 0
    ? Math.round((statusData.completedCount / statusData.totalChildren) * 100)
    : 0;

  // Options for survey questions
  const moodOptions = [
    { label: "Happy", emoji: "😊", desc: "Joyful & Positive" },
    { label: "Calm", emoji: "😌", desc: "Relaxed & Peaceful" },
    { label: "Neutral", emoji: "😐", desc: "Normal / Steady" },
    { label: "Stressed", emoji: "😟", desc: "Tense / Anxious" },
    { label: "Sad", emoji: "😢", desc: "Down / Emotional" },
    { label: "Irritated", emoji: "😡", desc: "Fussy / Frustrated" },
  ];

  const energyOptions = [
    { label: "High", emoji: "⚡", desc: "Active & Energetic" },
    { label: "Normal", emoji: "🙂", desc: "Balanced Energy" },
    { label: "Low", emoji: "🥱", desc: "Tired & Sluggish" },
  ];

  const socialOptions = [
    { label: "Positive", emoji: "😊", desc: "Friendly & Engaged" },
    { label: "Normal", emoji: "😐", desc: "Usual Interaction" },
    { label: "Difficult", emoji: "😟", desc: "Withdrawn or Conflict" },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={parentName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <span className="badge bg-indigo-500 bg-opacity-25 text-indigo-200 px-3 py-1 rounded-pill mb-2 border border-indigo-400 border-opacity-30">
              📝 Family Check-in
            </span>
            <h1 className="fw-bold text-white fs-3 mb-1">Today's Family Check-in</h1>
            <p className="text-secondary small mb-0">Take a moment to check in on how your children are doing today.</p>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm rounded-pill text-white border-secondary px-3 py-2 d-inline-flex align-items-center gap-2"
            onClick={() => navigate("/parent/children")}
          >
            <FiUser /> Manage Children
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mb-4">
            {errorMsg}
          </div>
        )}

        {/* Progress Card */}
        {!isLoading && statusData.totalChildren > 0 && (
          <div
            className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-bold text-white mb-0">
                    Today's Check-ins: <span className="text-info">{statusData.completedCount} / {statusData.totalChildren} completed</span>
                  </h5>
                  <span className="badge bg-indigo-500 bg-opacity-30 text-white rounded-pill px-3 py-1 border border-indigo-400 border-opacity-30">
                    {percentage}% Completed
                  </span>
                </div>
                <div className="progress bg-dark bg-opacity-50 mb-2" style={{ height: "10px" }}>
                  <div
                    className="progress-bar bg-gradient"
                    role="progressbar"
                    style={{
                      width: `${percentage}%`,
                      background: "linear-gradient(90deg, #3B82F6, #10B981)"
                    }}
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
                <p className="text-indigo-200 extra-small mb-0">
                  {statusData.completedCount === statusData.totalChildren
                    ? "🎉 Great job! All children have been checked in for today."
                    : `Please complete daily check-ins for the remaining ${statusData.totalChildren - statusData.completedCount} child(ren).`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="p-5 text-center text-white my-5 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
            <h5 className="fw-bold">Loading Linked Children & Check-in Status...</h5>
            <p className="text-secondary small">Connecting to MongoDB</p>
          </div>
        ) : statusData.totalChildren === 0 ? (
          /* Empty State */
          <div className="p-5 text-center rounded-4 border border-dashed border-secondary border-opacity-25 my-4 bg-dark bg-opacity-30">
            <div className="fs-1 mb-3 text-secondary">👨‍👩‍👧</div>
            <h5 className="fw-bold text-white mb-2">No children linked yet</h5>
            <p className="text-secondary small mb-4" style={{ maxWidth: "450px", margin: "0 auto" }}>
              Link a child to start completing daily wellbeing check-ins and monitoring emotional health.
            </p>
            <button
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
              onClick={() => navigate("/parent/children")}
            >
              <FiPlus /> Go to Children Page
            </button>
          </div>
        ) : (
          /* Children Check-In Cards Grid */
          <div className="row g-4 mb-4">
            {statusData.children.map((child) => (
              <div key={child.parentChildId} className="col-12 col-md-6 col-xl-4">
                <div
                  className="p-4 rounded-4 text-white h-100 d-flex flex-column justify-content-between shadow-sm position-relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, #1E293B 0%, #0F172A 100%)",
                    border: child.status === "completed"
                      ? "1px solid rgba(16, 185, 129, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <div>
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow"
                          style={{
                            width: "52px",
                            height: "52px",
                            fontSize: "1.3rem",
                            background: child.isDependentOnly
                              ? "linear-gradient(135deg, #F59E0B, #D97706)"
                              : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                            border: "2px solid rgba(255, 255, 255, 0.2)"
                          }}
                        >
                          {child.avatar ? (
                            <img
                              src={child.avatar}
                              alt={child.name}
                              className="w-100 h-100 rounded-circle"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            getInitial(child.name)
                          )}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0 text-white fs-6">{child.name}</h5>
                          <span className="text-secondary extra-small" style={{ fontSize: "0.78rem" }}>
                            {child.relationship} • Age: {child.age}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`badge rounded-pill px-3 py-1.5 fw-semibold ${
                          child.status === "completed"
                            ? "bg-success bg-opacity-20 text-success border border-success border-opacity-40"
                            : "bg-warning bg-opacity-20 text-warning border border-warning border-opacity-40"
                        }`}
                        style={{ fontSize: "0.78rem" }}
                      >
                        {child.status === "completed" ? "✅ Completed" : "⏳ Not Completed"}
                      </span>
                    </div>

                    {/* Check-in & Face Analysis Details Card */}
                    <div className="p-3 rounded-3 mb-3" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="row g-2 text-secondary" style={{ fontSize: "0.82rem" }}>
                        <div className="col-6">Class/Grade: <strong className="d-block text-white mt-0.5">{child.grade}</strong></div>
                        <div className="col-6">Date: <strong className="d-block text-white mt-0.5">{statusData.todayDate}</strong></div>
                        <div className="col-6">
                          Check-in: <strong className={child.status === "completed" ? "d-block text-success mt-0.5" : "d-block text-warning mt-0.5"}>
                            {child.status === "completed" ? "Completed" : "Pending"}
                          </strong>
                        </div>
                        <div className="col-6">
                          Face Analysis: <strong className={child.faceAnalysisRecord ? "d-block text-info mt-0.5" : "d-block text-secondary mt-0.5"}>
                            {child.faceAnalysisRecord ? "Completed" : "Pending"}
                          </strong>
                        </div>
                        {child.faceAnalysisRecord && (
                          <div className="col-12 pt-1 border-top border-secondary border-opacity-20 mt-1">
                            Expression: <strong className="text-info ms-1">{child.faceAnalysisRecord.expression} ({child.faceAnalysisRecord.confidence}%)</strong>
                          </div>
                        )}
                        {child.status === "completed" && child.checkInRecord && (
                          <>
                            <div className="col-6">Mood: <strong className="d-block text-info mt-0.5">{child.checkInRecord.mood}</strong></div>
                            <div className="col-6">Rating: <strong className="d-block text-warning mt-0.5">⭐ {child.checkInRecord.wellbeingScore}/5</strong></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons: Start Check-in & Face Analysis */}
                  <div className="pt-2 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
                    {child.status === "completed" ? (
                      <button
                        className="btn btn-outline-success rounded-pill w-100 py-2 text-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                        onClick={() => setViewChildRecord(child)}
                      >
                        <FiEye /> View Check-in
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary rounded-pill w-100 py-2 text-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
                        onClick={() => openStartSurvey(child)}
                      >
                        <FiCheckSquare /> Start Check-in
                      </button>
                    )}

                    <button
                      className="btn btn-outline-info rounded-pill w-100 py-2 text-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                      style={{ borderColor: "rgba(56, 189, 248, 0.4)", color: "#38BDF8" }}
                      onClick={() => {
                        setActiveChildForFaceAnalysis(child);
                        setFaceModalOpen(true);
                      }}
                    >
                      <FiCamera /> Face Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ==================================================
          SURVEY MODAL FLOW (6 Questions)
          ================================================== */}
      {activeChildForSurvey && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content text-white rounded-4 shadow-lg overflow-hidden"
              style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.15)" }}
            >
              {/* Header */}
              <div className="modal-header border-secondary border-opacity-25 px-4 py-3 bg-dark bg-opacity-50">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                    style={{
                      width: "42px",
                      height: "42px",
                      fontSize: "1.1rem",
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                    }}
                  >
                    {activeChildForSurvey.avatar ? (
                      <img
                        src={activeChildForSurvey.avatar}
                        alt={activeChildForSurvey.name}
                        className="w-100 h-100 rounded-circle"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      getInitial(activeChildForSurvey.name)
                    )}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white fs-6 mb-0">
                      Daily Check-in: <span className="text-info">{activeChildForSurvey.name}</span>
                    </h5>
                    <div className="text-secondary extra-small">
                      {activeChildForSurvey.relationship} • Age {activeChildForSurvey.age} • {statusData.todayDate}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setActiveChildForSurvey(null)}
                />
              </div>

              {/* Progress Indicator */}
              <div className="px-4 pt-3">
                <div className="d-flex align-items-center justify-content-between mb-1 text-secondary extra-small">
                  <span>Question {surveyStep} of 6</span>
                  <span>Progress: {Math.round((surveyStep / 6) * 100)}%</span>
                </div>
                <div className="progress bg-dark" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${(surveyStep / 6) * 100}%`, transition: "width 0.3s ease" }}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="modal-body p-4">
                {surveyError && (
                  <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mb-4 small d-flex align-items-center gap-2">
                    <FiAlertCircle size={18} />
                    <div>{surveyError}</div>
                  </div>
                )}

                {surveySuccess && (
                  <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 mb-4 small d-flex align-items-center gap-2">
                    <FiCheckCircle size={18} />
                    <div>{surveySuccess}</div>
                  </div>
                )}

                {/* QUESTION 1: Mood */}
                {surveyStep === 1 && (
                  <div>
                    <h5 className="fw-bold text-white mb-2 fs-5">
                      Question 1: How is {activeChildForSurvey.name} feeling today? <span className="text-danger">*</span>
                    </h5>
                    <p className="text-secondary small mb-4">Select the primary mood observed today.</p>

                    <div className="row g-3">
                      {moodOptions.map((opt) => {
                        const isSelected = surveyForm.mood === opt.label;
                        return (
                          <div key={opt.label} className="col-6 col-md-4">
                            <div
                              onClick={() => handleSurveyOptionSelect("mood", opt.label)}
                              className={`p-3 rounded-4 cursor-pointer text-center transition-all ${
                                isSelected
                                  ? "bg-primary text-white border border-primary shadow-lg"
                                  : "bg-dark bg-opacity-60 text-white-50 border border-secondary border-opacity-25 hover-border-primary"
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="fs-1 mb-1">{opt.emoji}</div>
                              <div className="fw-bold text-white small">{opt.label}</div>
                              <div className="extra-small text-secondary">{opt.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUESTION 2: Energy */}
                {surveyStep === 2 && (
                  <div>
                    <h5 className="fw-bold text-white mb-2 fs-5">
                      Question 2: How was {activeChildForSurvey.name}'s energy today? <span className="text-danger">*</span>
                    </h5>
                    <p className="text-secondary small mb-4">Select energy and stamina level observed.</p>

                    <div className="row g-3">
                      {energyOptions.map((opt) => {
                        const isSelected = surveyForm.energy === opt.label;
                        return (
                          <div key={opt.label} className="col-12 col-md-4">
                            <div
                              onClick={() => handleSurveyOptionSelect("energy", opt.label)}
                              className={`p-4 rounded-4 cursor-pointer text-center transition-all ${
                                isSelected
                                  ? "bg-primary text-white border border-primary shadow-lg"
                                  : "bg-dark bg-opacity-60 text-white-50 border border-secondary border-opacity-25"
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="fs-1 mb-2">{opt.emoji}</div>
                              <div className="fw-bold text-white fs-6">{opt.label}</div>
                              <div className="small text-secondary">{opt.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUESTION 3: Social Interaction */}
                {surveyStep === 3 && (
                  <div>
                    <h5 className="fw-bold text-white mb-2 fs-5">
                      Question 3: How was {activeChildForSurvey.name}'s interaction with family or friends today? <span className="text-danger">*</span>
                    </h5>
                    <p className="text-secondary small mb-4">Select social & family communication status.</p>

                    <div className="row g-3">
                      {socialOptions.map((opt) => {
                        const isSelected = surveyForm.socialInteraction === opt.label;
                        return (
                          <div key={opt.label} className="col-12 col-md-4">
                            <div
                              onClick={() => handleSurveyOptionSelect("socialInteraction", opt.label)}
                              className={`p-4 rounded-4 cursor-pointer text-center transition-all ${
                                isSelected
                                  ? "bg-primary text-white border border-primary shadow-lg"
                                  : "bg-dark bg-opacity-60 text-white-50 border border-secondary border-opacity-25"
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="fs-1 mb-2">{opt.emoji}</div>
                              <div className="fw-bold text-white fs-6">{opt.label}</div>
                              <div className="small text-secondary">{opt.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUESTION 4: Unusual Behavior */}
                {surveyStep === 4 && (
                  <div>
                    <h5 className="fw-bold text-white mb-2 fs-5">
                      Question 4: Did you notice anything unusual in {activeChildForSurvey.name}'s behavior today? <span className="text-danger">*</span>
                    </h5>
                    <p className="text-secondary small mb-3">Any sudden mood swings, isolation, or unusual stress?</p>

                    <div className="d-flex gap-3 mb-4">
                      <button
                        type="button"
                        className={`btn rounded-pill px-5 py-2.5 flex-grow-1 fw-bold ${
                          !surveyForm.unusualBehavior
                            ? "btn-success text-white"
                            : "btn-outline-secondary text-white-50"
                        }`}
                        onClick={() => handleSurveyOptionSelect("unusualBehavior", false)}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        className={`btn rounded-pill px-5 py-2.5 flex-grow-1 fw-bold ${
                          surveyForm.unusualBehavior
                            ? "btn-warning text-dark"
                            : "btn-outline-secondary text-white-50"
                        }`}
                        onClick={() => handleSurveyOptionSelect("unusualBehavior", true)}
                      >
                        Yes
                      </button>
                    </div>

                    {surveyForm.unusualBehavior && (
                      <div>
                        <label className="form-label text-secondary small fw-semibold">
                          Please describe briefly <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control bg-dark text-white border-secondary border-opacity-25 rounded-3 p-3"
                          rows="3"
                          placeholder="e.g. Seemed unusually quiet during dinner and avoided talking about school..."
                          value={surveyForm.unusualBehaviorNote}
                          onChange={(e) => setSurveyForm({ ...surveyForm, unusualBehaviorNote: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* QUESTION 5: Wellbeing Rating */}
                {surveyStep === 5 && (
                  <div>
                    <h5 className="fw-bold text-white mb-2 fs-5">
                      Question 5: How would you rate {activeChildForSurvey.name}'s overall wellbeing today? <span className="text-danger">*</span>
                    </h5>
                    <p className="text-secondary small mb-4">Select a star rating from 1 (Very Poor) to 5 (Excellent).</p>

                    <div className="d-flex justify-content-center gap-3 my-4">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isSelected = surveyForm.wellbeingScore >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            className="btn p-2 border-0 bg-transparent"
                            onClick={() => handleSurveyOptionSelect("wellbeingScore", star)}
                            style={{ cursor: "pointer", fontSize: "2.5rem" }}
                          >
                            <FiStar
                              className={isSelected ? "text-warning fill-warning" : "text-secondary opacity-40"}
                              style={{ fill: isSelected ? "#F59E0B" : "none" }}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {surveyForm.wellbeingScore > 0 && (
                      <div className="text-center fw-bold text-warning fs-5">
                        {surveyForm.wellbeingScore} / 5 Stars
                      </div>
                    )}
                  </div>
                )}

                {/* QUESTION 6: Additional Notes */}
                {surveyStep === 6 && (
                  <div>
                    <h5 className="fw-bold text-white mb-2 fs-5">
                      Question 6: Is there anything else you'd like to mention?
                    </h5>
                    <p className="text-secondary small mb-3">Optional additional notes or parent observations.</p>

                    <textarea
                      className="form-control bg-dark text-white border-secondary border-opacity-25 rounded-3 p-3 mb-3"
                      rows="4"
                      placeholder="e.g. Had a great day at sports practice, went to bed early..."
                      value={surveyForm.additionalNotes}
                      onChange={(e) => setSurveyForm({ ...surveyForm, additionalNotes: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer border-secondary border-opacity-25 px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary text-white rounded-pill px-4"
                  onClick={handlePrevStep}
                  disabled={surveyStep === 1 || isSubmitting}
                >
                  <FiArrowLeft /> Back
                </button>

                {surveyStep < 6 ? (
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                    onClick={handleNextStep}
                  >
                    Next <FiArrowRight />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
                    onClick={handleSubmitSurvey}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Check-in"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          READ-ONLY VIEW MODAL FOR COMPLETED CHECK-IN
          ================================================== */}
      {viewChildRecord && viewChildRecord.checkInRecord && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 shadow-lg"
              style={{ background: "#0F172A", border: "1px solid rgba(16, 185, 129, 0.3)" }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FiCheckCircle className="text-success" /> Today's Check-in: {viewChildRecord.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setViewChildRecord(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="p-3 rounded-3 mb-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                  <div className="row g-3 text-secondary small">
                    <div className="col-6">
                      <span>Mood Observed:</span>
                      <strong className="d-block text-white fs-6 mt-0.5">{viewChildRecord.checkInRecord.mood}</strong>
                    </div>
                    <div className="col-6">
                      <span>Energy Level:</span>
                      <strong className="d-block text-white fs-6 mt-0.5">{viewChildRecord.checkInRecord.energy}</strong>
                    </div>
                    <div className="col-6">
                      <span>Social Interaction:</span>
                      <strong className="d-block text-white fs-6 mt-0.5">{viewChildRecord.checkInRecord.socialInteraction}</strong>
                    </div>
                    <div className="col-6">
                      <span>Overall Wellbeing:</span>
                      <strong className="d-block text-warning fs-6 mt-0.5">⭐ {viewChildRecord.checkInRecord.wellbeingScore} / 5</strong>
                    </div>
                    <div className="col-12">
                      <span>Unusual Behavior Observed:</span>
                      <strong className={viewChildRecord.checkInRecord.unusualBehavior ? "d-block text-warning mt-0.5" : "d-block text-success mt-0.5"}>
                        {viewChildRecord.checkInRecord.unusualBehavior ? `Yes — ${viewChildRecord.checkInRecord.unusualBehaviorNote || "Note recorded"}` : "No"}
                      </strong>
                    </div>
                    {viewChildRecord.checkInRecord.additionalNotes && (
                      <div className="col-12 pt-2 border-top border-secondary border-opacity-25">
                        <span>Additional Parent Notes:</span>
                        <p className="text-white mb-0 mt-1">{viewChildRecord.checkInRecord.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 w-100"
                  onClick={() => setViewChildRecord(null)}
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          PER-CHILD FACE ANALYSIS MODAL
          ================================================== */}
      <ChildFaceAnalysisModal
        isOpen={faceModalOpen}
        onClose={() => {
          setFaceModalOpen(false);
          setActiveChildForFaceAnalysis(null);
        }}
        child={activeChildForFaceAnalysis}
        onAnalysisComplete={() => {
          fetchCheckInStatus();
        }}
      />

      <DashboardFooter />
    </div>
  );
}

export default ParentCheckInPage;
