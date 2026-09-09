import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiSave,
  FiArrowLeft,
  FiCheckCircle,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiAlertTriangle,
  FiUsers,
  FiShield,
  FiInfo,
  FiX
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Parent Profile State
  const [parentProfile, setParentProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Other",
    occupation: "",
    lifestyle: "",
    profileImage: "",
    role: "Parent",
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // Linked Children State
  const [childrenList, setChildrenList] = useState([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [childrenErrorMsg, setChildrenErrorMsg] = useState("");

  // Add Child Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState("link"); // 'link' or 'dependent'
  const [linkForm, setLinkForm] = useState({
    childEmail: "",
    relationship: "Mother",
  });
  const [dependentForm, setDependentForm] = useState({
    childName: "",
    dob: "",
    gender: "Female",
    grade: "",
    relationship: "Mother",
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState("");
  const [addModalSuccess, setAddModalSuccess] = useState("");

  // Edit Child Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChildForEdit, setSelectedChildForEdit] = useState(null);
  const [editChildForm, setEditChildForm] = useState({
    relationship: "Guardian",
    grade: "",
    notes: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState("");

  // View Child Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChildForView, setSelectedChildForView] = useState(null);

  // Unlink Child Confirmation Modal State
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [childToUnlink, setChildToUnlink] = useState(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState("");

  useEffect(() => {
    fetchParentProfile();
    fetchLinkedChildren();
  }, []);

  const fetchParentProfile = async () => {
    setIsLoadingProfile(true);
    setProfileErrorMsg("");
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setProfileErrorMsg("Authentication token missing. Please log in.");
      setIsLoadingProfile(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/parent/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setProfileErrorMsg(data.message || "Failed to load parent profile.");
        setIsLoadingProfile(false);
        return;
      }

      const dbUser = data.user;
      setParentProfile({
        fullName: dbUser.fullName || "",
        email: dbUser.email || "",
        phone: dbUser.phone || "",
        dob: dbUser.dob || "",
        gender: dbUser.gender || "Other",
        occupation: dbUser.occupation || "",
        lifestyle: dbUser.lifestyle || "",
        profileImage: dbUser.profileImage || "",
        role: dbUser.role || "Parent",
      });

      localStorage.setItem("neurosync_current_user", JSON.stringify(dbUser));
    } catch (err) {
      console.error("Fetch Parent Profile Error:", err);
      setProfileErrorMsg("Server error fetching parent profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchLinkedChildren = async () => {
    setIsLoadingChildren(true);
    setChildrenErrorMsg("");
    const token = localStorage.getItem("neurosync_token");

    if (!token) {
      setIsLoadingChildren(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/parent/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setChildrenList(data.children || []);
      } else {
        setChildrenErrorMsg(data.message || "Failed to load linked children.");
      }
    } catch (err) {
      console.error("Fetch Linked Children Error:", err);
      setChildrenErrorMsg("Server error loading children list.");
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setParentProfile((prev) => ({ ...prev, [name]: value }));
    if (profileSuccessMsg) setProfileSuccessMsg("");
    if (profileErrorMsg) setProfileErrorMsg("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    if (!parentProfile.fullName.trim()) {
      setProfileErrorMsg("Full Name cannot be empty.");
      return;
    }

    setIsSavingProfile(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/parent/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: parentProfile.fullName.trim(),
          phone: parentProfile.phone.trim(),
          dob: parentProfile.dob,
          gender: parentProfile.gender,
          occupation: parentProfile.occupation.trim(),
          lifestyle: parentProfile.lifestyle.trim(),
          profileImage: parentProfile.profileImage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setProfileErrorMsg(data.message || "Failed to save profile.");
        setIsSavingProfile(false);
        return;
      }

      setProfileSuccessMsg(data.message || "🎉 Parent profile updated successfully!");
      setIsEditingProfile(false);

      if (data.user) {
        localStorage.setItem("neurosync_current_user", JSON.stringify(data.user));
      }

      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save Parent Profile Error:", err);
      setProfileErrorMsg("Server error saving profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Add Child Handlers
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setAddModalError("");
    setAddModalSuccess("");

    if (!linkForm.childEmail.trim()) {
      setAddModalError("Please enter a valid email address.");
      return;
    }

    setIsSubmittingAdd(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/parent/children/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childEmail: linkForm.childEmail.trim(),
          relationship: linkForm.relationship,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAddModalError(data.message || "Failed to link child account.");
        setIsSubmittingAdd(false);
        return;
      }

      setAddModalSuccess("Link request sent successfully.");
      setLinkForm({ childEmail: "", relationship: "Mother" });
      fetchLinkedChildren();

      setTimeout(() => {
        setAddModalSuccess("");
        setShowAddModal(false);
      }, 2000);
    } catch (err) {
      console.error("Link Child Error:", err);
      setAddModalError("Server error while attempting to link child.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleDependentSubmit = async (e) => {
    e.preventDefault();
    setAddModalError("");
    setAddModalSuccess("");

    if (!dependentForm.childName.trim()) {
      setAddModalError("Child Name is required.");
      return;
    }

    setIsSubmittingAdd(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/parent/children/dependent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childName: dependentForm.childName.trim(),
          dob: dependentForm.dob,
          gender: dependentForm.gender,
          grade: dependentForm.grade.trim(),
          relationship: dependentForm.relationship,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAddModalError(data.message || "Failed to add dependent child.");
        setIsSubmittingAdd(false);
        return;
      }

      setAddModalSuccess("Dependent profile created successfully!");
      setDependentForm({ childName: "", dob: "", gender: "Female", grade: "", relationship: "Mother" });
      fetchLinkedChildren();

      setTimeout(() => {
        setAddModalSuccess("");
        setShowAddModal(false);
      }, 2000);
    } catch (err) {
      console.error("Add Dependent Error:", err);
      setAddModalError("Server error adding dependent profile.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Edit Child Details Handlers
  const handleOpenEditChild = (child) => {
    setSelectedChildForEdit(child);
    setEditChildForm({
      relationship: child.relationship || "Guardian",
      grade: child.grade && child.grade !== "N/A" ? child.grade : "",
      notes: child.notes || "",
    });
    setEditModalError("");
    setShowEditModal(true);
  };

  const handleSaveChildEdit = async (e) => {
    e.preventDefault();
    if (!selectedChildForEdit) return;

    setEditModalError("");
    setIsSubmittingEdit(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/parent/children/${selectedChildForEdit.relationshipId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          relationship: editChildForm.relationship,
          grade: editChildForm.grade,
          notes: editChildForm.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setEditModalError(data.message || "Failed to update child details.");
        setIsSubmittingEdit(false);
        return;
      }

      setShowEditModal(false);
      fetchLinkedChildren();
    } catch (err) {
      console.error("Update Child Details Error:", err);
      setEditModalError("Server error updating child details.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Unlink Child Handler
  const handleOpenUnlinkModal = (child) => {
    setChildToUnlink(child);
    setUnlinkError("");
    setShowUnlinkModal(true);
  };

  const handleConfirmUnlink = async () => {
    if (!childToUnlink) return;

    setIsUnlinking(true);
    setUnlinkError("");
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/parent/children/${childToUnlink.relationshipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUnlinkError(data.message || "Failed to unlink child.");
        setIsUnlinking(false);
        return;
      }

      setShowUnlinkModal(false);
      setChildToUnlink(null);
      fetchLinkedChildren();
    } catch (err) {
      console.error("Unlink Child Error:", err);
      setUnlinkError("Server error while unlinking child.");
    } finally {
      setIsUnlinking(false);
    }
  };

  const getInitial = (name) => {
    if (!name) return "P";
    return name.trim().charAt(0).toUpperCase();
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
        studentName={parentProfile.fullName || "Parent"}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <main className="ns-main-content">
        {/* Navigation & Header Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <button
              onClick={() => navigate("/parent/dashboard")}
              className="btn btn-outline-secondary btn-sm rounded-pill text-white border-secondary mb-2 d-inline-flex align-items-center gap-2"
            >
              <FiArrowLeft /> Back to Parent Dashboard
            </button>
            <h1 className="fw-bold text-white fs-3 mb-1">Parent Profile & Dependents</h1>
            <p className="text-secondary small mb-0">Manage your profile and linked children with NeuroSync accounts.</p>
          </div>
          <button
            className={`btn ${isEditingProfile ? "btn-outline-light" : "btn-primary"} rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2`}
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            disabled={isLoadingProfile}
          >
            {isEditingProfile ? "Cancel Editing" : "✏️ Edit Profile"}
          </button>
        </div>

        {/* Loading Spinner for Profile */}
        {isLoadingProfile ? (
          <div className="p-5 text-center text-white my-5 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
            <h5 className="fw-bold">Loading Parent Profile...</h5>
            <p className="text-secondary small">Connecting to MongoDB</p>
          </div>
        ) : (
          <>
            {/* Feedback Notifications */}
            {profileSuccessMsg && (
              <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 d-flex align-items-center gap-2 mb-4" role="alert">
                <FiCheckCircle size={20} />
                <div>{profileSuccessMsg}</div>
              </div>
            )}

            {profileErrorMsg && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 d-flex align-items-center gap-2 mb-4" role="alert">
                <FiAlertTriangle size={20} />
                <div>{profileErrorMsg}</div>
              </div>
            )}

            {/* A. Profile Header Card */}
            <div
              className="p-4 mb-4 rounded-4 text-white position-relative overflow-hidden shadow-lg"
              style={{
                background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
                border: "1px solid rgba(255, 255, 255, 0.12)"
              }}
            >
              <div className="row align-items-center">
                <div className="col-auto">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg overflow-hidden"
                    style={{
                      width: "90px",
                      height: "90px",
                      fontSize: "2.2rem",
                      background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                      border: "3px solid rgba(255, 255, 255, 0.25)"
                    }}
                  >
                    {parentProfile.profileImage ? (
                      <img
                        src={parentProfile.profileImage}
                        alt="Parent Avatar"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      getInitial(parentProfile.fullName)
                    )}
                  </div>
                </div>

                <div className="col ms-2">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <h2 className="fw-bold fs-3 mb-0 text-white">{parentProfile.fullName || "Parent User"}</h2>
                    <span className="badge bg-indigo-500 bg-opacity-30 text-white rounded-pill px-3 py-1 border border-indigo-400 border-opacity-40" style={{ fontSize: "0.8rem" }}>
                      👨‍👩‍👧 Parent
                    </span>
                  </div>
                  <p className="text-indigo-200 small mb-2">{parentProfile.email} {parentProfile.phone ? `• ${parentProfile.phone}` : ""}</p>
                  <div className="d-flex flex-wrap gap-3 text-indigo-200" style={{ fontSize: "0.83rem" }}>
                    <span>👨‍👩‍👧 Active Dependents: <strong>{childrenList.length} Linked</strong></span>
                    <span>🛡️ Account Security: <strong className="text-success">Verified Parent</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Personal Information Section */}
            <div
              className="p-4 rounded-4 text-white shadow-sm mb-5"
              style={{
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-white">
                  <FiUser className="text-primary" /> Personal Information
                </h5>
                <span className="text-secondary small">
                  Email & Role are protected authentication parameters
                </span>
              </div>

              <form onSubmit={handleSaveProfile}>
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
                        placeholder="Enter full name"
                        value={parentProfile.fullName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
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
                        value={parentProfile.email}
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
                        placeholder="e.g. +1 (555) 019-2834"
                        value={parentProfile.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-secondary small fw-semibold">Date of Birth</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                        <FiCalendar />
                      </span>
                      <input
                        type="date"
                        name="dob"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        style={{ colorScheme: "dark" }}
                        value={parentProfile.dob}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-secondary small fw-semibold">Gender</label>
                    <select
                      name="gender"
                      className="form-select bg-dark text-white border-secondary border-opacity-25"
                      value={parentProfile.gender}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile || isSavingProfile}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Role Badge</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white-50 border-secondary border-opacity-25"
                      value={parentProfile.role}
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Occupation / Notes</label>
                    <input
                      type="text"
                      name="occupation"
                      className="form-control bg-dark text-white border-secondary border-opacity-25"
                      placeholder="e.g. Primary Guardian / Working Parent"
                      value={parentProfile.occupation}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile || isSavingProfile}
                    />
                  </div>

                  {isEditingProfile && (
                    <div className="col-12">
                      <label className="form-label text-secondary small fw-semibold">Avatar Image URL (Optional)</label>
                      <input
                        type="text"
                        name="profileImage"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        placeholder="https://example.com/avatar.jpg"
                        value={parentProfile.profileImage}
                        onChange={handleProfileChange}
                        disabled={isSavingProfile}
                      />
                    </div>
                  )}
                </div>

                {isEditingProfile && (
                  <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary text-white rounded-pill px-4"
                      onClick={() => setIsEditingProfile(false)}
                      disabled={isSavingProfile}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* C. CHILDREN / DEPENDENTS SECTION */}
            <div
              className="p-4 rounded-4 text-white shadow-sm mb-4"
              style={{
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                  <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                    <FiUsers className="text-primary" /> Children & Dependents
                  </h4>
                  <p className="text-secondary small mb-0">
                    Manage the children linked to your NeuroSync account.
                  </p>
                </div>
                <button
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                  onClick={() => {
                    setAddModalError("");
                    setAddModalSuccess("");
                    setShowAddModal(true);
                  }}
                >
                  <FiPlus size={18} /> Add Child
                </button>
              </div>

              {childrenErrorMsg && (
                <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mb-4">
                  {childrenErrorMsg}
                </div>
              )}

              {/* Children Loading State */}
              {isLoadingChildren ? (
                <div className="row g-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="col-md-6 col-xl-4">
                      <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-center">
                        <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
                        <div className="text-secondary small">Loading child card...</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : childrenList.length === 0 ? (
                /* Empty State */
                <div className="p-5 text-center rounded-4 border border-dashed border-secondary border-opacity-25 my-3">
                  <div className="fs-1 mb-3 text-secondary">👧👦</div>
                  <h5 className="fw-bold text-white mb-2">No children linked yet.</h5>
                  <p className="text-secondary small mb-4" style={{ maxWidth: "450px", margin: "0 auto" }}>
                    Link an existing NeuroSync student account or create a dependent profile to start monitoring wellness and insights.
                  </p>
                  <button
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    onClick={() => {
                      setAddModalError("");
                      setAddModalSuccess("");
                      setShowAddModal(true);
                    }}
                  >
                    <FiPlus /> Add Child
                  </button>
                </div>
              ) : (
                /* Children Cards Grid */
                <div className="row g-4">
                  {childrenList.map((child) => (
                    <div key={child.id} className="col-12 col-md-6 col-xl-4">
                      <div
                        className="p-4 rounded-4 position-relative text-white h-100 d-flex flex-column justify-content-between shadow-sm"
                        style={{
                          background: "linear-gradient(145deg, #1E293B 0%, #0F172A 100%)",
                          border: "1px solid rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        <div>
                          {/* Card Top Header */}
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
                              className={`badge rounded-pill px-2.5 py-1 ${
                                child.status === "accepted"
                                  ? "bg-success bg-opacity-20 text-success border border-success border-opacity-40"
                                  : child.status === "pending"
                                  ? "bg-warning bg-opacity-20 text-warning border border-warning border-opacity-40"
                                  : "bg-danger bg-opacity-20 text-danger border border-danger border-opacity-40"
                              }`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {child.status === "accepted" ? "Linked" : child.status === "pending" ? "Request Pending" : "Request Rejected"}
                            </span>
                          </div>

                          {/* Details Grid */}
                          <div className="p-3 rounded-3 mb-3" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="row g-2 text-secondary" style={{ fontSize: "0.82rem" }}>
                              <div className="col-6">
                                <span>Class/Grade:</span>
                                <strong className="d-block text-white mt-0.5">{child.grade}</strong>
                              </div>
                              <div className="col-6">
                                <span>Gender:</span>
                                <strong className="d-block text-white mt-0.5">{child.gender}</strong>
                              </div>
                              <div className="col-6">
                                <span>DOB:</span>
                                <strong className="d-block text-white mt-0.5">{child.dob}</strong>
                              </div>
                              <div className="col-6">
                                <span>Status:</span>
                                <strong className="d-block text-success mt-0.5">🟢 {child.activeStatus || "Active"}</strong>
                              </div>
                              <div className="col-12 mt-1">
                                <span>Account:</span>
                                <strong className="d-block text-info text-truncate mt-0.5">
                                  {child.email}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Buttons */}
                        <div className="d-flex align-items-center gap-2 pt-2 border-top border-secondary border-opacity-25">
                          <button
                            className="btn btn-sm btn-outline-light rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
                            onClick={() => {
                              setSelectedChildForView(child);
                              setShowViewModal(true);
                            }}
                            style={{ fontSize: "0.8rem" }}
                          >
                            <FiEye size={14} /> View Profile
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
                            onClick={() => handleOpenEditChild(child)}
                            style={{ fontSize: "0.8rem" }}
                          >
                            <FiEdit2 size={14} /> Edit Details
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-2.5 d-inline-flex align-items-center justify-content-center"
                            onClick={() => handleOpenUnlinkModal(child)}
                            title="Unlink Child"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ==================================================
          MODAL 1: ADD CHILD / LINK CHILD
          ================================================== */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 shadow-lg"
              style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.15)" }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FiPlus className="text-primary" /> Add Child to NeuroSync
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                {/* Mode Selector Tabs */}
                <div className="d-flex rounded-pill bg-dark p-1 mb-4 border border-secondary border-opacity-25">
                  <button
                    className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold ${addMode === "link" ? "btn-primary text-white" : "btn-dark text-secondary"}`}
                    onClick={() => {
                      setAddMode("link");
                      setAddModalError("");
                      setAddModalSuccess("");
                    }}
                  >
                    Option A — Link Existing Account
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold ${addMode === "dependent" ? "btn-primary text-white" : "btn-dark text-secondary"}`}
                    onClick={() => {
                      setAddMode("dependent");
                      setAddModalError("");
                      setAddModalSuccess("");
                    }}
                  >
                    Option B — Add Dependent Profile
                  </button>
                </div>

                {addModalError && (
                  <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mb-3 small d-flex align-items-center gap-2">
                    <FiAlertTriangle />
                    <div>{addModalError}</div>
                  </div>
                )}

                {addModalSuccess && (
                  <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 mb-3 small d-flex align-items-center gap-2">
                    <FiCheckCircle />
                    <div>{addModalSuccess}</div>
                  </div>
                )}

                {/* Option A Form */}
                {addMode === "link" && (
                  <form onSubmit={handleLinkSubmit}>
                    <p className="text-secondary small mb-3">
                      Enter your child's registered NeuroSync student email to link their account.
                    </p>
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-semibold">Child's NeuroSync Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-25">
                          <FiMail />
                        </span>
                        <input
                          type="email"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          placeholder="e.g. child@example.com"
                          value={linkForm.childEmail}
                          onChange={(e) => setLinkForm({ ...linkForm, childEmail: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-secondary small fw-semibold">Your Relationship to Child</label>
                      <select
                        className="form-select bg-dark text-white border-secondary border-opacity-25"
                        value={linkForm.relationship}
                        onChange={(e) => setLinkForm({ ...linkForm, relationship: e.target.value })}
                      >
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary text-white rounded-pill px-4"
                        onClick={() => setShowAddModal(false)}
                        disabled={isSubmittingAdd}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4"
                        disabled={isSubmittingAdd}
                      >
                        {isSubmittingAdd ? "Sending..." : "Send Link Request"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Option B Form */}
                {addMode === "dependent" && (
                  <form onSubmit={handleDependentSubmit}>
                    <div className="alert alert-info border-0 bg-info bg-opacity-10 text-info rounded-3 mb-3 small d-flex align-items-center gap-2">
                      <FiInfo />
                      <div>Creates a parent-managed dependent profile without login credentials.</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-semibold">Child Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        placeholder="e.g. Ananya"
                        value={dependentForm.childName}
                        onChange={(e) => setDependentForm({ ...dependentForm, childName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label text-secondary small fw-semibold">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          style={{ colorScheme: "dark" }}
                          value={dependentForm.dob}
                          onChange={(e) => setDependentForm({ ...dependentForm, dob: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-secondary small fw-semibold">Gender</label>
                        <select
                          className="form-select bg-dark text-white border-secondary border-opacity-25"
                          value={dependentForm.gender}
                          onChange={(e) => setDependentForm({ ...dependentForm, gender: e.target.value })}
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <label className="form-label text-secondary small fw-semibold">Class / Grade</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-opacity-25"
                          placeholder="e.g. Grade 7"
                          value={dependentForm.grade}
                          onChange={(e) => setDependentForm({ ...dependentForm, grade: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-secondary small fw-semibold">Relationship</label>
                        <select
                          className="form-select bg-dark text-white border-secondary border-opacity-25"
                          value={dependentForm.relationship}
                          onChange={(e) => setDependentForm({ ...dependentForm, relationship: e.target.value })}
                        >
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary text-white rounded-pill px-4"
                        onClick={() => setShowAddModal(false)}
                        disabled={isSubmittingAdd}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4"
                        disabled={isSubmittingAdd}
                      >
                        {isSubmittingAdd ? "Saving..." : "Add Dependent Profile"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 2: EDIT CHILD DETAILS
          ================================================== */}
      {showEditModal && selectedChildForEdit && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 shadow-lg"
              style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.15)" }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FiEdit2 className="text-info" /> Edit Details: {selectedChildForEdit.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditModal(false)}
                />
              </div>

              <form onSubmit={handleSaveChildEdit}>
                <div className="modal-body p-4">
                  {editModalError && (
                    <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mb-3 small">
                      {editModalError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Relationship</label>
                    <select
                      className="form-select bg-dark text-white border-secondary border-opacity-25"
                      value={editChildForm.relationship}
                      onChange={(e) => setEditChildForm({ ...editChildForm, relationship: e.target.value })}
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Class / Grade</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary border-opacity-25"
                      placeholder="e.g. Class 7"
                      value={editChildForm.grade}
                      onChange={(e) => setEditChildForm({ ...editChildForm, grade: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Parent Notes (Private)</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary border-opacity-25"
                      rows="3"
                      placeholder="Optional notes for your reference"
                      value={editChildForm.notes}
                      onChange={(e) => setEditChildForm({ ...editChildForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white rounded-pill px-4"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSubmittingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={isSubmittingEdit}
                  >
                    {isSubmittingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 3: VIEW CHILD PROFILE
          ================================================== */}
      {showViewModal && selectedChildForView && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 shadow-lg"
              style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.15)" }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FiEye className="text-primary" /> Child Profile Summary
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                />
              </div>

              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg mx-auto mb-3"
                  style={{
                    width: "80px",
                    height: "80px",
                    fontSize: "2rem",
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    border: "3px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  {selectedChildForView.avatar ? (
                    <img
                      src={selectedChildForView.avatar}
                      alt={selectedChildForView.name}
                      className="w-100 h-100 rounded-circle"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    getInitial(selectedChildForView.name)
                  )}
                </div>

                <h4 className="fw-bold text-white mb-1">{selectedChildForView.name}</h4>
                <p className="text-secondary small mb-3">{selectedChildForView.email}</p>

                <div className="p-3 rounded-3 text-start bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-3">
                  <div className="row g-2 text-secondary small">
                    <div className="col-6">Relationship: <strong className="text-white d-block">{selectedChildForView.relationship}</strong></div>
                    <div className="col-6">Class/Grade: <strong className="text-white d-block">{selectedChildForView.grade}</strong></div>
                    <div className="col-6">Age: <strong className="text-white d-block">{selectedChildForView.age}</strong></div>
                    <div className="col-6">Gender: <strong className="text-white d-block">{selectedChildForView.gender}</strong></div>
                    <div className="col-6">DOB: <strong className="text-white d-block">{selectedChildForView.dob}</strong></div>
                    <div className="col-6">Link Status: <strong className="text-success d-block">{selectedChildForView.status}</strong></div>
                  </div>
                  {selectedChildForView.notes && (
                    <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 small text-secondary">
                      Notes: <span className="text-white">{selectedChildForView.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  className="btn btn-primary rounded-pill px-4 w-100"
                  onClick={() => setShowViewModal(false)}
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 4: UNLINK CHILD CONFIRMATION
          ================================================== */}
      {showUnlinkModal && childToUnlink && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white rounded-4 shadow-lg"
              style={{ background: "#0F172A", border: "1px solid rgba(239, 68, 68, 0.4)" }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FiAlertTriangle className="text-danger" /> Unlink Child Confirmation
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowUnlinkModal(false)}
                />
              </div>

              <div className="modal-body p-4 text-center">
                <p className="fs-5 fw-bold text-white mb-2">
                  Are you sure you want to unlink <span className="text-danger">{childToUnlink.name}</span>?
                </p>
                <p className="text-secondary small mb-0">
                  This will remove the parent-child link from your NeuroSync account.
                </p>

                {unlinkError && (
                  <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mt-3 mb-0 small">
                    {unlinkError}
                  </div>
                )}
              </div>

              <div className="modal-footer border-secondary border-opacity-25 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary text-white rounded-pill flex-grow-1"
                  onClick={() => setShowUnlinkModal(false)}
                  disabled={isUnlinking}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill flex-grow-1"
                  onClick={handleConfirmUnlink}
                  disabled={isUnlinking}
                >
                  {isUnlinking ? "Unlinking..." : "Unlink Child"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}

export default ParentProfile;
