import React, { useState } from "react";
import { FiSearch, FiBriefcase, FiHeart, FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

function AdminManageProfessionals({ users, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProf, setSelectedProf] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "report" | "burnout"

  // Filter Working Professional role users
  const professionals = users.filter((u) => u.role === "Working Professional" || u.role === "User");

  const filteredProfessionals = professionals.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.occupation?.toLowerCase().includes(query)
    );
  });

  const closeModal = () => {
    setActiveModal(null);
    setSelectedProf(null);
  };

  return (
    <div className="manage-professionals-section">
      {/* Header & Search */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiBriefcase className="text-success" /> Manage Working Professionals ({filteredProfessionals.length})
          </h4>
          <p className="text-secondary small mb-0">
            View professional accounts, workplace wellness reports, and burnout risk metrics
          </p>
        </div>

        {/* Search Bar */}
        <div className="input-group input-group-sm" style={{ width: "260px" }}>
          <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
            <FiSearch />
          </span>
          <input 
            type="text"
            className="form-control bg-dark text-white border-secondary border-opacity-25"
            placeholder="Search professional or occupation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Professional List Table */}
      <div className="p-4 rounded-4 text-white" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="text-secondary border-bottom border-secondary border-opacity-25 small">
                <th>PROFESSIONAL NAME</th>
                <th>EMAIL</th>
                <th>OCCUPATION</th>
                <th>BURNOUT RISK</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessionals.length > 0 ? (
                filteredProfessionals.map((p) => {
                  return (
                    <tr key={p._id} className="border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-success bg-opacity-20 text-success fw-bold d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                            {p.fullName?.charAt(0) || "P"}
                          </div>
                          <div>
                            <span className="fw-semibold text-white d-block">{p.fullName}</span>
                            <span className="text-secondary extra-small">Working Professional</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary small">{p.email}</td>
                      <td className="text-secondary small">{p.occupation || "Software Engineer / Professional"}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 px-2.5 py-1 rounded-pill small">
                          🟢 Low Risk (22%)
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-end gap-1.5">
                          {/* View Wellness Report */}
                          <button
                            onClick={() => { setSelectedProf(p); setActiveModal("report"); }}
                            className="btn btn-outline-primary btn-sm px-2.5 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                          >
                            <FiHeart size={13} /> Wellness Report
                          </button>

                          {/* View Burnout Risk */}
                          <button
                            onClick={() => { setSelectedProf(p); setActiveModal("burnout"); }}
                            className="btn btn-outline-warning btn-sm px-2.5 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                          >
                            <FiAlertTriangle size={13} /> Burnout Risk
                          </button>

                          {/* Delete Professional */}
                          <button
                            onClick={() => onDeleteUser(p._id, p.email)}
                            className="btn btn-outline-danger btn-sm px-2 py-1 rounded-3 extra-small"
                            title="Delete Account"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-secondary">
                    No working professional accounts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && selectedProf && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-slate-900 text-white rounded-4 border border-secondary border-opacity-25 shadow-lg" style={{ background: "#0F172A" }}>
              
              <div className="modal-header border-bottom border-secondary border-opacity-25 p-4">
                <h5 className="modal-title fw-bold">
                  {activeModal === "report" && <>💼 Professional Wellness Report</>}
                  {activeModal === "burnout" && <>⚠️ Workplace Burnout Risk Score</>}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4 text-center">
                {activeModal === "report" && (
                  <div>
                    <div className="display-4 fw-bold text-success mb-2">88%</div>
                    <span className="badge bg-success px-3 py-1.5 rounded-pill mb-3">Optimal Work-Life Balance</span>
                    <p className="text-secondary small mb-0">
                      Workplace focus hours are steady, deep work blocks are maintained, and stress recovery index is high.
                    </p>
                  </div>
                )}

                {activeModal === "burnout" && (
                  <div>
                    <div className="display-4 fw-bold text-warning mb-2">22%</div>
                    <span className="badge bg-warning bg-opacity-20 text-warning px-3 py-1.5 rounded-pill mb-3">Low Burnout Risk</span>
                    <p className="text-secondary small mb-0">
                      Weekly workload distribution is well-paced with sufficient break intervals.
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top border-secondary border-opacity-25 p-3">
                <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={closeModal}>Close</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManageProfessionals;
