import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiUsers, FiPhone, FiMail, FiPlus, FiAlertTriangle, FiTrash2, FiEdit2, FiCheck, FiShield } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorFamilyEmergency() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Daughter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);
  const [saving, setSaving] = useState(false);

  // SOS Alert State
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosSending, setSosSending] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/senior/family-contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setContacts(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching family contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setRelationship("Daughter");
    setPhone("");
    setEmail("");
    setIsEmergencyContact(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingId(c._id);
    setName(c.name);
    setRelationship(c.relationship);
    setPhone(c.phone);
    setEmail(c.email || "");
    setIsEmergencyContact(Boolean(c.isEmergencyContact));
    setShowModal(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("neurosync_token");

    const payload = {
      name,
      relationship,
      phone,
      email,
      isEmergencyContact,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/senior/family-contacts/${editingId}`
        : "http://localhost:5000/api/senior/family-contacts";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowModal(false);
        fetchContacts();
      } else {
        alert(json.message || "Failed to save contact.");
      }
    } catch (err) {
      console.error("Error saving contact:", err);
      alert("Cannot connect to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/senior/family-contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchContacts();
      } else {
        alert(json.message || "Failed to delete contact.");
      }
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  const handleTriggerSOS = async () => {
    if (!window.confirm("⚠️ Are you sure you want to trigger an SOS Emergency Alert to your family contacts?")) return;

    setSosSending(true);
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch("http://localhost:5000/api/senior/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSosTriggered(true);
      } else {
        alert(json.message || "Failed to trigger SOS alert.");
      }
    } catch (err) {
      console.error("Error triggering SOS alert:", err);
      alert("Could not connect to emergency server.");
    } finally {
      setSosSending(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="family-emergency"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={seniorName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#FCA5A5",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                👴 Senior Emergency Portal
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-2 mb-1">👨‍👩‍👧 Family & Emergency</h1>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Manage trusted family contacts and access quick emergency assistance.
            </p>
          </div>

          <button
            className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2 shadow"
            onClick={handleOpenAddModal}
          >
            <FiPlus size={18} /> Add Family Contact
          </button>
        </div>

        {/* PROMINENT SOS / EMERGENCY HELP BUTTON BANNER */}
        <div
          className="p-4 p-md-5 mb-4 rounded-4 text-white text-center position-relative overflow-hidden shadow-lg"
          style={{
            background: "linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
          }}
        >
          <div className="mx-auto" style={{ maxWidth: "600px" }}>
            <div className="fs-1 mb-2">🆘</div>
            <h2 className="fw-black mb-2">SOS / Emergency Help</h2>
            <p className="text-red-100 mb-4" style={{ fontSize: "1.05rem" }}>
              Press the SOS button below to send an urgent emergency alert notification to all your designated trusted family contacts.
            </p>

            <button
              disabled={sosSending}
              className="btn btn-light btn-lg rounded-pill px-5 py-3.5 fw-black text-danger shadow-lg hover-scale"
              style={{ fontSize: "1.2rem", letterSpacing: "1px" }}
              onClick={handleTriggerSOS}
            >
              <FiAlertTriangle className="me-2" /> {sosSending ? "SENDING SOS ALERT..." : "PRESS FOR SOS EMERGENCY ASSISTANCE"}
            </button>
          </div>
        </div>

        {/* SOS SUCCESS MODAL / BANNER */}
        {sosTriggered && (
          <div className="p-4 mb-4 rounded-4 bg-success bg-opacity-20 border border-success text-white d-flex align-items-center justify-content-between gap-3">
            <div>
              <h5 className="fw-bold mb-1">🚨 SOS Alert Activated & Sent!</h5>
              <p className="mb-0 small">Your trusted emergency contacts have been notified with your alert signal.</p>
            </div>
            <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={() => setSosTriggered(false)}>
              Dismiss
            </button>
          </div>
        )}

        {/* TRUSTED FAMILY CONTACTS LIST */}
        <div className="ns-card p-4 p-md-5">
          <h4 className="text-white fw-bold fs-4 mb-4 d-flex align-items-center gap-2">
            <FiUsers className="text-primary" /> Trusted Family Members & Contacts
          </h4>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="text-muted small">Loading family contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 mb-2">👨‍👩‍👧</div>
              <h5 className="text-white fw-bold">No Family Contacts Added</h5>
              <p className="text-muted small mb-3">Add family members or guardians who can be notified during emergency situations.</p>
              <button className="btn btn-outline-primary rounded-pill px-4 py-2" onClick={handleOpenAddModal}>
                <FiPlus className="me-1" /> Add Contact
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {contacts.map((c) => (
                <div key={c._id} className="col-12 col-md-6 col-xl-4">
                  <div
                    className="p-4 rounded-4 bg-dark border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between position-relative shadow-sm"
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 px-3 py-1 fw-bold">
                          {c.relationship}
                        </span>
                        {c.isEmergencyContact && (
                          <span className="badge bg-danger text-white rounded-pill px-3 py-1 fw-bold">
                            <FiShield className="me-1" /> Emergency Contact
                          </span>
                        )}
                      </div>

                      <h4 className="text-white fw-bold fs-5 mb-2">{c.name}</h4>

                      <div className="d-flex align-items-center gap-2 text-white-50 mb-2" style={{ fontSize: "0.95rem" }}>
                        <FiPhone className="text-primary" /> <strong className="text-white">{c.phone}</strong>
                      </div>

                      {c.email && (
                        <div className="d-flex align-items-center gap-2 text-white-50 mb-3" style={{ fontSize: "0.9rem" }}>
                          <FiMail className="text-muted" /> {c.email}
                        </div>
                      )}
                    </div>

                    <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top border-secondary border-opacity-25 mt-3">
                      <button
                        className="btn btn-link text-white-50 p-2"
                        title="Edit Contact"
                        onClick={() => handleOpenEditModal(c)}
                      >
                        <FiEdit2 size={18} />
                      </button>

                      <button
                        className="btn btn-link text-danger p-2"
                        title="Delete Contact"
                        onClick={() => handleDeleteContact(c._id)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT CONTACT MODAL */}
      {showModal && (
        <div
          className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(6px)",
            zIndex: 1050,
          }}
        >
          <div
            className="ns-card p-4 p-md-5 shadow-lg position-relative"
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "rgba(30, 41, 59, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
            }}
          >
            <h3 className="text-white fw-bold mb-3">
              {editingId ? "Edit Family Contact" : "Add Family Contact"}
            </h3>

            <form onSubmit={handleSaveContact}>
              <div className="mb-3">
                <label className="text-white fw-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control bg-dark text-white border-secondary border-opacity-25 p-3"
                  placeholder="e.g. Sarah Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="text-white fw-semibold mb-1">Relationship</label>
                <select
                  className="form-select bg-dark text-white border-secondary border-opacity-25 p-3"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Caregiver">Caregiver / Doctor</option>
                  <option value="Relative">Relative / Friend</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="text-white fw-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="form-control bg-dark text-white border-secondary border-opacity-25 p-3"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="text-white fw-semibold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-control bg-dark text-white border-secondary border-opacity-25 p-3"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emergencyToggle"
                  checked={isEmergencyContact}
                  onChange={(e) => setIsEmergencyContact(e.target.checked)}
                />
                <label className="form-check-label text-white fw-semibold ms-2" htmlFor="emergencyToggle">
                  Designate as Primary Emergency Contact (SOS Receiver)
                </label>
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 py-2.5 text-white flex-grow-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold flex-grow-1"
                >
                  {saving ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}

export default SeniorFamilyEmergency;
