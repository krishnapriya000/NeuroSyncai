import React, { useState } from "react";
import { FiSearch, FiSun, FiHeart, FiTrash2 } from "react-icons/fi";

function AdminManageSeniors({ users, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Filter Senior Citizen role users
  const seniors = users.filter((u) => u.role === "Senior Citizen");

  const filteredSeniors = seniors.filter((s) => {
    const query = searchTerm.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="manage-seniors-section">
      {/* Header & Search */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiSun className="text-warning" /> Manage Senior Citizens ({filteredSeniors.length})
          </h4>
          <p className="text-secondary small mb-0">
            View senior citizen accounts, health wellness reports, and cognitive activity metrics
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
            placeholder="Search senior citizen name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Senior List Table */}
      <div className="p-4 rounded-4 text-white" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="text-secondary border-bottom border-secondary border-opacity-25 small">
                <th>SENIOR NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>WELLNESS STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeniors.length > 0 ? (
                filteredSeniors.map((s) => {
                  return (
                    <tr key={s._id} className="border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-warning bg-opacity-20 text-warning fw-bold d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                            {s.fullName?.charAt(0) || "S"}
                          </div>
                          <div>
                            <span className="fw-semibold text-white d-block">{s.fullName}</span>
                            <span className="text-secondary extra-small">Senior Citizen</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary small">{s.email}</td>
                      <td className="text-secondary small">{s.phone || "N/A"}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 px-2.5 py-1 rounded-pill small">
                          🟢 Active & Healthy (92%)
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-end gap-1.5">
                          {/* View Wellness Report */}
                          <button
                            onClick={() => { setSelectedSenior(s); setShowReportModal(true); }}
                            className="btn btn-outline-primary btn-sm px-2.5 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                          >
                            <FiHeart size={13} /> Wellness Report
                          </button>

                          {/* Delete Senior */}
                          <button
                            onClick={() => onDeleteUser(s._id, s.email)}
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
                    No senior citizen accounts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showReportModal && selectedSenior && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-slate-900 text-white rounded-4 border border-secondary border-opacity-25 shadow-lg" style={{ background: "#0F172A" }}>
              
              <div className="modal-header border-bottom border-secondary border-opacity-25 p-4">
                <h5 className="modal-title fw-bold">👴 Senior Citizen Wellness Report: {selectedSenior.fullName}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReportModal(false)}></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div className="display-4 fw-bold text-success mb-2">92%</div>
                <span className="badge bg-success px-3 py-1.5 rounded-pill mb-3">Excellent Health Score</span>
                <p className="text-secondary small mb-0">
                  Daily cognitive activities completed consistently. Sleep cycle and hydration habits are well maintained.
                </p>
              </div>

              <div className="modal-footer border-top border-secondary border-opacity-25 p-3">
                <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={() => setShowReportModal(false)}>Close</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManageSeniors;
