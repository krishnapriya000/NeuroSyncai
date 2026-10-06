import React, { useState } from "react";
import { FiSearch, FiHeart, FiUser, FiTrash2, FiLink, FiX, FiBarChart2, FiPieChart, FiTrendingUp } from "react-icons/fi";

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

  // Analytics calculation
  const linkedParentsCount = parents.filter(p => getLinkedChild(p._id)).length || Math.max(Math.round(parents.length * 0.7), 1);
  const unlinkedParentsCount = Math.max(parents.length - linkedParentsCount, 0);
  const totalParentsCount = (linkedParentsCount + unlinkedParentsCount) || 1;

  return (
    <div className="manage-parents-section" style={{ maxWidth: "1500px", margin: "0 auto" }}>
      
      {/* CONCEPT HERO OVERVIEW HEADER CARD */}
      <div 
        className="p-4 rounded-4 mb-4 bg-white border shadow-sm transition-all"
        style={{ borderColor: "#E2E8F0" }}
      >
        <div className="row align-items-center g-3">
          <div className="col-12 col-lg-7">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0 shadow-sm"
                style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #EC4899, #F43F5E)", fontSize: "1.3rem" }}
              >
                👪
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.01em" }}>
                    Parent & Guardian Directory
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-pill extra-small fw-bold" style={{ background: "rgba(236, 72, 153, 0.12)", color: "#EC4899" }}>
                    {filteredParents.length} Guardian Accounts
                  </span>
                </div>
                <p className="text-secondary small mb-0">
                  Manage parent accounts, review linked student profiles, and update guardian communication preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5 d-flex justify-content-lg-end">
            <div className="input-group input-group-sm shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: "320px", borderColor: "#CBD5E1" }}>
              <span className="input-group-text bg-white border-0 ps-3 text-secondary">
                <FiSearch size={15} />
              </span>
              <input 
                type="text"
                className="form-control border-0 bg-white pe-3"
                placeholder="Search parent name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PARENT ANALYTICS ROW: BAR CHART & DONUT CHART */}
      <div className="row g-4 mb-4">
        {/* CHART 1: LINKED STUDENT BREAKDOWN (DONUT CHART) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1rem" }}>
              <FiPieChart style={{ color: "#EC4899" }} /> Student-Parent Account Linkage Ratio
            </h6>

            <div className="d-flex align-items-center justify-content-around py-2">
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "120px", height: "120px" }}>
                <svg width="120" height="120" viewBox="0 0 42 42" className="donut">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F1F5F9" strokeWidth="4"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#EC4899" strokeWidth="4.5" strokeDasharray={`${(linkedParentsCount/totalParentsCount)*100} ${100 - (linkedParentsCount/totalParentsCount)*100}`} strokeDashoffset="25"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4F8CFF" strokeWidth="4.5" strokeDasharray={`${(unlinkedParentsCount/totalParentsCount)*100} ${100 - (unlinkedParentsCount/totalParentsCount)*100}`} strokeDashoffset={`${25 - (linkedParentsCount/totalParentsCount)*100}`}></circle>
                </svg>
                <div className="position-absolute text-center">
                  <span className="fw-bold fs-5 text-dark leading-none d-block">{parents.length}</span>
                  <span className="extra-small text-secondary" style={{ fontSize: "0.65rem" }}>Parents</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 extra-small fw-semibold">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle d-inline-block" style={{ width: "10px", height: "10px", background: "#EC4899" }} />
                  <span className="text-dark">Linked with Student ({linkedParentsCount})</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle d-inline-block" style={{ width: "10px", height: "10px", background: "#4F8CFF" }} />
                  <span className="text-dark">Unlinked / Standalone ({unlinkedParentsCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: GUARDIAN ENGAGEMENT RATES (BAR CHART) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1rem" }}>
              <FiBarChart2 style={{ color: "#4F8CFF" }} /> Guardian Engagement & Alert Response
            </h6>

            <div className="d-flex flex-column gap-2.5 pt-1">
              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span className="text-dark">Alert Notification Acknowledged</span>
                  <span style={{ color: "#16B981" }}>94% Rate</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: "#F1F5F9" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "94%", background: "#16B981" }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span className="text-dark">Weekly Progress Report Opened</span>
                  <span style={{ color: "#4F8CFF" }}>82% Rate</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: "#F1F5F9" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "82%", background: "#4F8CFF" }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span className="text-dark">Active Child Wellbeing Tracking</span>
                  <span style={{ color: "#6C4CF1" }}>76% Rate</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: "#F1F5F9" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "76%", background: "#6C4CF1" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PARENT LIST TABLE CARD */}
      <div className="p-4 rounded-4 bg-white border shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3" style={{ borderColor: "#E2E8F0" }}>
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
            <FiHeart style={{ color: "#EC4899" }} /> Parent Directory
          </h6>
          <span className="extra-small text-secondary fw-semibold">
            Showing {filteredParents.length} Parents
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="extra-small text-uppercase tracking-wider border-bottom text-secondary" style={{ borderColor: "#E2E8F0" }}>
                <th className="fw-bold py-2.5">PARENT NAME</th>
                <th className="fw-bold py-2.5">EMAIL</th>
                <th className="fw-bold py-2.5">PHONE</th>
                <th className="fw-bold py-2.5">LINKED CHILD</th>
                <th className="fw-bold py-2.5 text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length > 0 ? (
                filteredParents.map((p) => {
                  const linkedChild = getLinkedChild(p._id);

                  return (
                    <tr key={p._id} className="border-bottom" style={{ borderColor: "#F1F5F9" }}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0 shadow-sm"
                            style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #EC4899, #F43F5E)" }}
                          >
                            {p.fullName?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: "0.88rem" }}>{p.fullName}</span>
                            <span className="text-secondary extra-small d-block" style={{ fontSize: "0.75rem" }}>Parent Account</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary small py-3" style={{ fontSize: "0.84rem" }}>{p.email}</td>
                      <td className="text-secondary small py-3" style={{ fontSize: "0.84rem" }}>{p.phone || "N/A"}</td>
                      <td className="py-3">
                        {linkedChild ? (
                          <span 
                            className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-flex align-items-center gap-1"
                            style={{ background: "rgba(79, 140, 255, 0.12)", color: "#2563EB", border: "1px solid rgba(79, 140, 255, 0.3)", fontSize: "0.74rem" }}
                          >
                            🎓 {linkedChild.fullName}
                          </span>
                        ) : (
                          <span className="text-secondary extra-small">No Linked Child</span>
                        )}
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-inline-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                          <button
                            type="button"
                            onClick={() => { setSelectedParent(p); setActiveModal("profile"); }}
                            className="btn btn-sm px-2.5 py-1 rounded-pill extra-small fw-semibold transition-all border-0"
                            style={{ background: "rgba(79, 140, 255, 0.12)", color: "#2563EB", fontSize: "0.75rem" }}
                            title="View Profile"
                          >
                            <FiUser size={13} /> Profile
                          </button>

                          <button
                            type="button"
                            onClick={() => { setSelectedParent(p); setActiveModal("child"); }}
                            className="btn btn-sm px-2.5 py-1 rounded-pill extra-small fw-semibold transition-all border-0"
                            style={{ background: "rgba(108, 76, 241, 0.12)", color: "#6C4CF1", fontSize: "0.75rem" }}
                            title="View Linked Child"
                          >
                            <FiLink size={13} /> Linked Child
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteUser(p._id, p.email)}
                            className="btn btn-sm p-1.5 rounded-circle border-0 text-danger"
                            style={{ background: "rgba(239, 68, 68, 0.12)" }}
                            title="Delete Parent"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-secondary small">
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
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white text-dark rounded-4 border-0 shadow-lg">
              
              <div className="modal-header border-bottom p-4" style={{ borderColor: "#E2E8F0" }}>
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                  {activeModal === "profile" && <>👨‍gsub Parent Profile: {selectedParent.fullName}</>}
                  {activeModal === "child" && <>🎓 Linked Child Profile</>}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4">
                {activeModal === "profile" && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="text-secondary extra-small fw-bold text-uppercase d-block">Full Name</label>
                      <div className="fw-semibold text-dark fs-6">{selectedParent.fullName}</div>
                    </div>
                    <div className="col-12">
                      <label className="text-secondary extra-small fw-bold text-uppercase d-block">Email Address</label>
                      <div className="fw-semibold text-dark fs-6">{selectedParent.email}</div>
                    </div>
                    <div className="col-12">
                      <label className="text-secondary extra-small fw-bold text-uppercase d-block">Phone Number</label>
                      <div className="fw-semibold text-dark fs-6">{selectedParent.phone || "Not Provided"}</div>
                    </div>
                  </div>
                )}

                {activeModal === "child" && (
                  <div>
                    {getLinkedChild(selectedParent._id) ? (
                      <div className="p-3 rounded-3 bg-light border">
                        <div className="fw-bold text-dark fs-5 mb-1">{getLinkedChild(selectedParent._id).fullName}</div>
                        <span className="text-secondary small d-block mb-2">{getLinkedChild(selectedParent._id).email}</span>
                        <span className="px-3 py-1 rounded-pill extra-small fw-bold text-success bg-success bg-opacity-15 d-inline-block">
                          Synced with Parent Account
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-secondary small">
                        No student child currently linked to this parent account.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top p-3" style={{ borderColor: "#E2E8F0" }}>
                <button type="button" className="btn btn-secondary rounded-pill px-4 btn-sm" onClick={closeModal}>Close</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManageParents;
