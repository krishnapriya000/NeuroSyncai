import React, { useState } from "react";
import { FiSearch, FiHeart, FiUser, FiTrash2, FiLink, FiX } from "react-icons/fi";

function AdminManageParents({ users, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "profile" | "child"

  // Filter parent role users
  const parents = users.filter((u) => u.role === "Parent");

  const filteredParents = parents.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.phone?.toLowerCase().includes(query)
    );
  });

  // Find linked child student if available
  const getLinkedChild = (parentId) => {
    return users.find((u) => u.role === "Student" && (u.parentId === parentId || u.parentId?._id === parentId));
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedParent(null);
  };

  return (
    <div className="manage-parents-section">
      {/* Header & Search */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiHeart className="text-pink-400" style={{ color: "#ec4899" }} /> Manage Parents ({filteredParents.length})
          </h4>
          <p className="text-secondary small mb-0">
            View parent accounts, linked student child profiles, and manage access
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
            placeholder="Search parent name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Parent List Table */}
      <div className="p-4 rounded-4 text-white" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="text-secondary border-bottom border-secondary border-opacity-25 small">
                <th>PARENT NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>LINKED CHILD</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length > 0 ? (
                filteredParents.map((p) => {
                  const linkedChild = getLinkedChild(p._id);

                  return (
                    <tr key={p._id} className="border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-pink-500 bg-opacity-20 text-pink-400 fw-bold d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", color: "#ec4899" }}>
                            {p.fullName?.charAt(0) || "P"}
                          </div>
                          <div>
                            <span className="fw-semibold text-white d-block">{p.fullName}</span>
                            <span className="text-secondary extra-small">Parent Account</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary small">{p.email}</td>
                      <td className="text-secondary small">{p.phone || "N/A"}</td>
                      <td>
                        {linkedChild ? (
                          <span className="badge bg-info bg-opacity-20 text-info border border-info border-opacity-30 px-2.5 py-1 rounded-pill small">
                            🎓 {linkedChild.fullName}
                          </span>
                        ) : (
                          <span className="text-secondary small">No Linked Child</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => { setSelectedParent(p); setActiveModal("profile"); }}
                            className="btn btn-outline-info btn-sm px-2.5 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                          >
                            <FiUser size={13} /> Profile
                          </button>

                          {/* View Linked Child */}
                          <button
                            onClick={() => { setSelectedParent(p); setActiveModal("child"); }}
                            className="btn btn-outline-primary btn-sm px-2.5 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                          >
                            <FiLink size={13} /> Linked Child
                          </button>

                          {/* Delete Parent */}
                          <button
                            onClick={() => onDeleteUser(p._id, p.email)}
                            className="btn btn-outline-danger btn-sm px-2 py-1 rounded-3 extra-small"
                            title="Delete Parent"
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
                    No parent accounts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && selectedParent && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-slate-900 text-white rounded-4 border border-secondary border-opacity-25 shadow-lg" style={{ background: "#0F172A" }}>
              
              <div className="modal-header border-bottom border-secondary border-opacity-25 p-4">
                <h5 className="modal-title fw-bold">
                  {activeModal === "profile" && <>👨‍👩‍👧 Parent Profile: {selectedParent.fullName}</>}
                  {activeModal === "child" && <>🎓 Linked Child Profile</>}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4">
                {activeModal === "profile" && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="text-secondary small d-block">Full Name</label>
                      <div className="fw-semibold text-white fs-6">{selectedParent.fullName}</div>
                    </div>
                    <div className="col-12">
                      <label className="text-secondary small d-block">Email Address</label>
                      <div className="fw-semibold text-white fs-6">{selectedParent.email}</div>
                    </div>
                    <div className="col-12">
                      <label className="text-secondary small d-block">Phone Number</label>
                      <div className="fw-semibold text-white fs-6">{selectedParent.phone || "Not Provided"}</div>
                    </div>
                  </div>
                )}

                {activeModal === "child" && (
                  <div>
                    {getLinkedChild(selectedParent._id) ? (
                      <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                        <div className="fw-bold text-white fs-5 mb-1">{getLinkedChild(selectedParent._id).fullName}</div>
                        <span className="text-secondary small d-block mb-2">{getLinkedChild(selectedParent._id).email}</span>
                        <span className="badge bg-success bg-opacity-20 text-success px-3 py-1 rounded-pill">
                          Synced with Parent Account
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-secondary">
                        No student child currently linked to this parent account.
                      </div>
                    )}
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

export default AdminManageParents;
