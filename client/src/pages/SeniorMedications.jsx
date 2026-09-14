import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiClock, FiPlus, FiCheck, FiX, FiTrash2, FiEdit2, FiAlertCircle } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorMedications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("1 Tablet");
  const [time, setTime] = useState("08:00 AM");
  const [frequency, setFrequency] = useState("Daily");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setSeniorName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchMedications();

    const handleStatusChanged = () => fetchMedications();
    window.addEventListener("neurosync_medication_status_changed", handleStatusChanged);

    return () => {
      window.removeEventListener("neurosync_medication_status_changed", handleStatusChanged);
    };
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/senior/medications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMedications(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching senior medications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMedId(null);
    setMedicineName("");
    setDosage("1 Tablet");
    setTime("08:00 AM");
    setFrequency("Daily");
    setShowModal(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedId(med._id);
    setMedicineName(med.medicineName);
    setDosage(med.dosage || "1 Tablet");
    setTime(med.time);
    setFrequency(med.frequency || "Daily");
    setShowModal(true);
  };

  const handleSaveMedication = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("neurosync_token");

    const payload = {
      medicineName,
      dosage,
      time,
      frequency,
    };

    try {
      const url = editingMedId
        ? `http://localhost:5000/api/senior/medications/${editingMedId}`
        : "http://localhost:5000/api/senior/medications";

      const method = editingMedId ? "PUT" : "POST";

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
        fetchMedications();
      } else {
        alert(json.message || "Failed to save medication.");
      }
    } catch (err) {
      console.error("Error saving medication:", err);
      alert("Cannot connect to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medication reminder?")) return;
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/senior/medications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchMedications();
      } else {
        alert(json.message || "Failed to delete medication.");
      }
    } catch (err) {
      console.error("Error deleting medication:", err);
    }
  };

  const handleLogStatus = async (id, status) => {
    const token = localStorage.getItem("neurosync_token");

    try {
      const res = await fetch(`http://localhost:5000/api/senior/medications/${id}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        fetchMedications();
      } else {
        alert(json.message || "Failed to update medication status.");
      }
    } catch (err) {
      console.error("Error logging medication status:", err);
    }
  };

  const getLogForToday = (logs) => {
    if (!logs || logs.length === 0) return null;
    const todayStr = new Date().toISOString().split("T")[0];
    return logs.find((l) => l.date === todayStr);
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="medications"
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
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#FBBF24",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                💊 Senior Health Reminders
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-2 mb-1">Medication & Reminders</h1>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Keep track of your daily medicines and mark them as taken.
            </p>
          </div>

          <button
            className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2 shadow"
            onClick={handleOpenAddModal}
          >
            <FiPlus size={18} /> Add New Reminder
          </button>
        </div>

        {/* DISCLAIMER NOTICE */}
        <div
          className="p-3 mb-4 rounded-4 border border-warning border-opacity-30 text-white-50 d-flex align-items-center gap-3"
          style={{ background: "rgba(245, 158, 11, 0.08)", fontSize: "0.88rem" }}
        >
          <FiAlertCircle className="text-warning fs-3 flex-shrink-0" />
          <div>
            <strong>Notice:</strong> This module is purely for medication reminders and tracking. NeuroSync does not generate medical dosage recommendations or advise changing prescriptions.
          </div>
        </div>

        {/* TODAY'S REMINDERS LIST */}
        <div className="ns-card p-4 p-md-5 mb-4">
          <h4 className="text-white fw-bold fs-4 mb-4 d-flex align-items-center gap-2">
            <FiClock className="text-primary" /> Today's Reminders
          </h4>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="text-muted small">Loading medication reminders...</p>
            </div>
          ) : medications.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 mb-2">💊</div>
              <h5 className="text-white fw-bold">No Medication Reminders Added</h5>
              <p className="text-muted small mb-3">Click the button below to add your first reminder.</p>
              <button className="btn btn-outline-primary rounded-pill px-4 py-2" onClick={handleOpenAddModal}>
                <FiPlus className="me-1" /> Add Medication Reminder
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {medications.map((med) => {
                const todayLog = getLogForToday(med.logs);
                const isTaken = todayLog && todayLog.status === "taken";
                const isMissed = todayLog && todayLog.status === "missed";

                return (
                  <div
                    key={med._id}
                    className="p-4 rounded-4 bg-dark border border-secondary border-opacity-25 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          background: isTaken
                            ? "rgba(16, 185, 129, 0.2)"
                            : isMissed
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(59, 130, 246, 0.2)",
                          color: isTaken ? "#34D399" : isMissed ? "#FCA5A5" : "#60A5FA",
                          width: "56px",
                          height: "56px",
                          fontSize: "1.5rem",
                        }}
                      >
                        💊
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h5 className="text-white fw-bold fs-5 mb-0">{med.medicineName}</h5>
                          <span className="badge bg-secondary bg-opacity-30 text-white-50" style={{ fontSize: "0.75rem" }}>
                            {med.dosage}
                          </span>
                        </div>
                        <div className="text-muted small">
                          ⏰ Scheduled: <strong className="text-white">{med.time}</strong> • Frequency: {med.frequency}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex align-items-center gap-2 align-self-end align-self-md-center">
                      <button
                        className={`btn px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1.5 ${
                          isTaken ? "btn-success" : "btn-outline-success text-white"
                        }`}
                        onClick={() => handleLogStatus(med._id, "taken")}
                      >
                        <FiCheck /> {isTaken ? "Taken ✅" : "Mark as Taken"}
                      </button>

                      <button
                        className={`btn px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1.5 ${
                          isMissed ? "btn-danger" : "btn-outline-danger text-white"
                        }`}
                        onClick={() => handleLogStatus(med._id, "missed")}
                      >
                        <FiX /> {isMissed ? "Missed ❌" : "Mark Missed"}
                      </button>

                      <button
                        className="btn btn-link text-white-50 p-2"
                        title="Edit Reminder"
                        onClick={() => handleOpenEditModal(med)}
                      >
                        <FiEdit2 size={18} />
                      </button>

                      <button
                        className="btn btn-link text-danger p-2"
                        title="Delete Reminder"
                        onClick={() => handleDeleteMedication(med._id)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MEDICATION MODAL */}
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
              {editingMedId ? "Edit Medication Reminder" : "Add Medication Reminder"}
            </h3>

            <form onSubmit={handleSaveMedication}>
              <div className="mb-3">
                <label className="text-white fw-semibold mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  className="form-control bg-dark text-white border-secondary border-opacity-25 p-3"
                  placeholder="e.g. Blood Pressure Medicine"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="text-white fw-semibold mb-1">Dosage / Instructions</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary border-opacity-25 p-3"
                  placeholder="e.g. 1 Tablet after breakfast"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="text-white fw-semibold mb-1">Reminder Time</label>
                  <input
                    type="text"
                    required
                    className="form-control bg-dark text-white border-secondary border-opacity-25 p-3"
                    placeholder="08:00 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="text-white fw-semibold mb-1">Frequency</label>
                  <select
                    className="form-select bg-dark text-white border-secondary border-opacity-25 p-3"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>
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
                  {saving ? "Saving..." : "Save Reminder"}
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

export default SeniorMedications;
