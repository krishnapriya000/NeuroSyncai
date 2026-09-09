import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiMail,
  FiInfo
} from "react-icons/fi";
import "../styles/studentDashboard.css";

function ParentChildren() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("children");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parentName, setParentName] = useState("Parent User");

  // Linked Children State
  const [childrenList, setChildrenList] = useState([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [childrenErrorMsg, setChildrenErrorMsg] = useState("");

  // Add Child Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState("link");
  const [linkForm, setLinkForm] = useState({ childEmail: "", relationship: "Mother" });
  const [dependentForm, setDependentForm] = useState({ childName: "", dob: "", gender: "Female", grade: "", relationship: "Mother" });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState("");
  const [addModalSuccess, setAddModalSuccess] = useState("");

  // View Child Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChildForView, setSelectedChildForView] = useState(null);

  // Unlink Modal State
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [childToUnlink, setChildToUnlink] = useState(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setParentName(u.fullName || u.name);
      } catch (e) {}
    }
    fetchLinkedChildren();
  }, []);

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
        setChildrenErrorMsg(data.message || "Failed to fetch linked children.");
      }
    } catch (err) {
      console.error("Fetch children error:", err);
      setChildrenErrorMsg("Server error while loading children.");
    } finally {
      setIsLoadingChildren(false);
    }
  };

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
        setAddModalError(data.message || "Failed to link account.");
        setIsSubmittingAdd(false);
        return;
      }

      setAddModalSuccess("Link request sent successfully.");
      setLinkForm({ childEmail: "", relationship: "Mother" });
      fetchLinkedChildren();
      setTimeout(() => {
        setAddModalSuccess("");
        setShowAddModal(false);
      }, 1800);
    } catch (err) {
      console.error("Link error:", err);
      setAddModalError("Server error while trying to link account.");
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
        setAddModalError(data.message || "Failed to add dependent.");
        setIsSubmittingAdd(false);
        return;
      }

      setAddModalSuccess("Dependent profile created successfully!");
      setDependentForm({ childName: "", dob: "", gender: "Female", grade: "", relationship: "Mother" });
      fetchLinkedChildren();
      setTimeout(() => {
        setAddModalSuccess("");
        setShowAddModal(false);
      }, 1800);
    } catch (err) {
      console.error("Add dependent error:", err);
      setAddModalError("Server error creating dependent profile.");
    } finally {
      setIsSubmittingAdd(false);
    }
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
      console.error("Unlink error:", err);
      setUnlinkError("Server error while unlinking child.");
    } finally {
      setIsUnlinking(false);
    }
  };

  const getInitial = (name) => {
    if (!name) return "C";
    return name.trim().charAt(0).toUpperCase();
  };

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
              👨‍👩‍👧 Family Portal
            </span>
            <h1 className="fw-bold text-white fs-3 mb-1">Children & Dependents</h1>
            <p className="text-secondary small mb-0">Manage and monitor children connected to your NeuroSync account.</p>
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

        {/* Children Grid */}
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
          <div className="p-5 text-center rounded-4 border border-dashed border-secondary border-opacity-25 my-3 bg-dark bg-opacity-30">
            <div className="fs-1 mb-3 text-secondary">👧👦</div>
            <h5 className="fw-bold text-white mb-2">No children linked yet.</h5>
            <p className="text-secondary small mb-4" style={{ maxWidth: "450px", margin: "0 auto" }}>
              Link an existing NeuroSync student account or add a dependent profile to start monitoring wellbeing and insights.
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
          <div className="row g-4 mb-4">
            {childrenList.map((child) => (
              <div key={child.id} className="col-12 col-md-6 col-xl-4">
                <div
                  className="p-4 rounded-4 text-white h-100 d-flex flex-column justify-content-between shadow-sm position-relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, #1E293B 0%, #0F172A 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <div>
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
                            : "bg-warning bg-opacity-20 text-warning border border-warning border-opacity-40"
                        }`}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {child.status === "accepted" ? "Linked" : "Request Pending"}
                      </span>
                    </div>

                    <div className="p-3 rounded-3 mb-3" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="row g-2 text-secondary" style={{ fontSize: "0.82rem" }}>
                        <div className="col-6">Class/Grade: <strong className="d-block text-white mt-0.5">{child.grade}</strong></div>
                        <div className="col-6">Gender: <strong className="d-block text-white mt-0.5">{child.gender}</strong></div>
                        <div className="col-6">DOB: <strong className="d-block text-white mt-0.5">{child.dob}</strong></div>
                        <div className="col-6">Status: <strong className="d-block text-success mt-0.5">🟢 Active</strong></div>
                        <div className="col-12 mt-1">Account: <strong className="d-block text-info text-truncate mt-0.5">{child.email}</strong></div>
                      </div>
                    </div>
                  </div>

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
                      className="btn btn-sm btn-outline-danger rounded-pill px-2.5 d-inline-flex align-items-center justify-content-center"
                      onClick={() => {
                        setChildToUnlink(child);
                        setUnlinkError("");
                        setShowUnlinkModal(true);
                      }}
                      title="Unlink Child"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <FiTrash2 size={14} /> Unlink
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white rounded-4 shadow-lg" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FiPlus className="text-primary" /> Add Child to NeuroSync
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="d-flex rounded-pill bg-dark p-1 mb-4 border border-secondary border-opacity-25">
                  <button className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold ${addMode === "link" ? "btn-primary text-white" : "btn-dark text-secondary"}`} onClick={() => setAddMode("link")}>
                    Option A — Link Account
                  </button>
                  <button className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold ${addMode === "dependent" ? "btn-primary text-white" : "btn-dark text-secondary"}`} onClick={() => setAddMode("dependent")}>
                    Option B — Add Dependent
                  </button>
                </div>

                {addModalError && <div className="alert alert-danger border-0 bg-danger bg-opacity-20 text-danger-light rounded-3 mb-3 small">{addModalError}</div>}
                {addModalSuccess && <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success-light rounded-3 mb-3 small">{addModalSuccess}</div>}

                {addMode === "link" ? (
                  <form onSubmit={handleLinkSubmit}>
                    <p className="text-secondary small mb-3">Enter your child's registered NeuroSync student email.</p>
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-semibold">Child Email</label>
                      <input type="email" className="form-control bg-dark text-white border-secondary border-opacity-25" placeholder="child@example.com" value={linkForm.childEmail} onChange={(e) => setLinkForm({ ...linkForm, childEmail: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="form-label text-secondary small fw-semibold">Relationship</label>
                      <select className="form-select bg-dark text-white border-secondary border-opacity-25" value={linkForm.relationship} onChange={(e) => setLinkForm({ ...linkForm, relationship: e.target.value })}>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-outline-secondary text-white rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isSubmittingAdd}>{isSubmittingAdd ? "Sending..." : "Send Request"}</button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleDependentSubmit}>
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-semibold">Child Name</label>
                      <input type="text" className="form-control bg-dark text-white border-secondary border-opacity-25" placeholder="Child Name" value={dependentForm.childName} onChange={(e) => setDependentForm({ ...dependentForm, childName: e.target.value })} required />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label text-secondary small fw-semibold">DOB</label>
                        <input type="date" className="form-control bg-dark text-white border-secondary border-opacity-25" style={{ colorScheme: "dark" }} value={dependentForm.dob} onChange={(e) => setDependentForm({ ...dependentForm, dob: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-secondary small fw-semibold">Gender</label>
                        <select className="form-select bg-dark text-white border-secondary border-opacity-25" value={dependentForm.gender} onChange={(e) => setDependentForm({ ...dependentForm, gender: e.target.value })}>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-outline-secondary text-white rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isSubmittingAdd}>{isSubmittingAdd ? "Saving..." : "Add Dependent"}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedChildForView && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white rounded-4 shadow-lg" style={{ background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white">Child Profile</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)} />
              </div>
              <div className="modal-body p-4 text-center">
                <h4 className="fw-bold text-white">{selectedChildForView.name}</h4>
                <p className="text-secondary small">{selectedChildForView.email}</p>
                <div className="p-3 rounded-3 bg-dark bg-opacity-50 text-start small text-secondary">
                  <div>Relationship: <strong className="text-white">{selectedChildForView.relationship}</strong></div>
                  <div>Grade/Class: <strong className="text-white">{selectedChildForView.grade}</strong></div>
                  <div>Age: <strong className="text-white">{selectedChildForView.age}</strong></div>
                </div>
              </div>
              <div className="modal-footer border-secondary border-opacity-25">
                <button className="btn btn-primary rounded-pill px-4 w-100" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlink Modal */}
      {showUnlinkModal && childToUnlink && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white rounded-4 p-2" style={{ background: "#0F172A", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
              <div className="modal-body p-4 text-center">
                <p className="fs-5 fw-bold text-white">Unlink {childToUnlink.name}?</p>
                <p className="text-secondary small">Are you sure you want to remove this child link?</p>
                {unlinkError && <div className="alert alert-danger border-0 small">{unlinkError}</div>}
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-outline-secondary text-white rounded-pill flex-grow-1" onClick={() => setShowUnlinkModal(false)}>Cancel</button>
                  <button className="btn btn-danger rounded-pill flex-grow-1" onClick={handleConfirmUnlink} disabled={isUnlinking}>{isUnlinking ? "Unlinking..." : "Unlink Child"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}

export default ParentChildren;
