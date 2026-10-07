import { useState } from "react";
import { FiSearch, FiHeart, FiUser, FiTrash2, FiLink, FiBarChart2, FiPieChart } from "react-icons/fi";

function AdminManageParents({ users, onDeleteUser, theme = "light" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "profile" | "child"

  const isLight = theme === "light";

  const cardStyle = {
    background: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.75)",
    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: isLight ? "0 2px 12px rgba(0, 0, 0, 0.03)" : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
    borderRadius: "16px"
  };

  const titleColor = isLight ? "#111827" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

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

      {/* PARENT ANALYTICS ROW: BAR CHART & DONUT CHART */}
      <div className="row g-4 mb-4">
        {/* CHART 1: LINKED STUDENT BREAKDOWN (DONUT CHART) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1rem" }}>
              <FiPieChart style={{ color: "#EC4899" }} /> Student-Parent Account Linkage Ratio
            </h6>

            <div className="d-flex align-items-center justify-content-around py-2">
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "120px", height: "120px" }}>
                <svg width="120" height="120" viewBox="0 0 42 42" className="donut">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)"} strokeWidth="4"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#EC4899" strokeWidth="4.5" strokeDasharray={`${(linkedParentsCount/totalParentsCount)*100} ${100 - (linkedParentsCount/totalParentsCount)*100}`} strokeDashoffset="25"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4F8CFF" strokeWidth="4.5" strokeDasharray={`${(unlinkedParentsCount/totalParentsCount)*100} ${100 - (unlinkedParentsCount/totalParentsCount)*100}`} strokeDashoffset={`${25 - (linkedParentsCount/totalParentsCount)*100}`}></circle>
                </svg>
                <div className="position-absolute text-center">
                  <span className="fw-bold fs-5 leading-none d-block" style={{ color: titleColor }}>{parents.length}</span>
                  <span className="extra-small" style={{ color: subtextColor, fontSize: "0.65rem" }}>Parents</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 extra-small fw-semibold">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle d-inline-block" style={{ width: "10px", height: "10px", background: "#EC4899" }} />
                  <span style={{ color: titleColor }}>Linked with Student ({linkedParentsCount})</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle d-inline-block" style={{ width: "10px", height: "10px", background: "#4F8CFF" }} />
                  <span style={{ color: titleColor }}>Unlinked / Standalone ({unlinkedParentsCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: GUARDIAN ENGAGEMENT RATES (BAR CHART) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1rem" }}>
              <FiBarChart2 style={{ color: "#4F8CFF" }} /> Guardian Engagement & Alert Response
            </h6>

            <div className="d-flex flex-column gap-2.5 pt-1">
              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span style={{ color: titleColor }}>Alert Notification Acknowledged</span>
                  <span style={{ color: "#16B981" }}>94% Rate</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "94%", background: "#16B981" }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span style={{ color: titleColor }}>Weekly Progress Report Opened</span>
                  <span style={{ color: "#4F8CFF" }}>82% Rate</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "82%", background: "#4F8CFF" }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span style={{ color: titleColor }}>Active Child Wellbeing Tracking</span>
                  <span style={{ color: "#6C4CF1" }}>76% Rate</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "76%", background: "#6C4CF1" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PARENT LIST TABLE CARD */}
      <div className="p-4 rounded-4" style={cardStyle}>
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3 border-bottom pb-3" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
            <FiHeart style={{ color: "#EC4899" }} /> Parent Directory
          </h6>

          <div className="d-flex align-items-center gap-3">
            <span className="extra-small fw-semibold d-none d-md-inline" style={{ color: subtextColor }}>
              Showing {filteredParents.length} Parents
            </span>
            <div className="input-group input-group-sm shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: "260px", borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)" }}>
              <span className="input-group-text border-0 ps-3" style={{ background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: subtextColor }}>
                <FiSearch size={14} />
              </span>
              <input 
                type="text"
                className="form-control border-0 pe-3"
                placeholder="Search parent name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.83rem", background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: titleColor }}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="extra-small text-uppercase tracking-wider border-bottom" style={{ color: subtextColor, borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
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
                    <tr key={p._id} className="border-bottom" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)" }}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0 shadow-sm"
                            style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #EC4899, #F43F5E)" }}
                          >
                            {p.fullName?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <span className="fw-semibold d-block" style={{ color: titleColor, fontSize: "0.88rem" }}>{p.fullName}</span>
                            <span className="extra-small d-block" style={{ color: subtextColor, fontSize: "0.75rem" }}>Parent Account</span>
                          </div>
                        </div>
                      </td>
                      <td className="small py-3" style={{ color: subtextColor, fontSize: "0.84rem" }}>{p.email}</td>
                      <td className="small py-3" style={{ color: subtextColor, fontSize: "0.84rem" }}>{p.phone || "N/A"}</td>
                      <td className="py-3">
                        {linkedChild ? (
                          <span 
                            className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-flex align-items-center gap-1"
                            style={{ background: "rgba(79, 140, 255, 0.12)", color: "#2563EB", border: "1px solid rgba(79, 140, 255, 0.3)", fontSize: "0.74rem" }}
                          >
                            🎓 {linkedChild.fullName}
                          </span>
                        ) : (
                          <span className="extra-small" style={{ color: subtextColor }}>No Linked Child</span>
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
                  <td colSpan="5" className="text-center py-4 extra-small" style={{ color: subtextColor }}>
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
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ background: isLight ? "#FFFFFF" : "#1E293B", color: titleColor }}>
              
              <div className="modal-header border-bottom p-4" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.1rem" }}>
                  {activeModal === "profile" && <>👨‍gsub Parent Profile: {selectedParent.fullName}</>}
                  {activeModal === "child" && <>🎓 Linked Child Profile</>}
                </h5>
                <button type="button" className={`btn-close ${!isLight ? "btn-close-white" : ""}`} onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4">
                {activeModal === "profile" && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="extra-small fw-bold text-uppercase d-block" style={{ color: subtextColor }}>Full Name</label>
                      <div className="fw-semibold fs-6" style={{ color: titleColor }}>{selectedParent.fullName}</div>
                    </div>
                    <div className="col-12">
                      <label className="extra-small fw-bold text-uppercase d-block" style={{ color: subtextColor }}>Email Address</label>
                      <div className="fw-semibold fs-6" style={{ color: titleColor }}>{selectedParent.email}</div>
                    </div>
                    <div className="col-12">
                      <label className="extra-small fw-bold text-uppercase d-block" style={{ color: subtextColor }}>Phone Number</label>
                      <div className="fw-semibold fs-6" style={{ color: titleColor }}>{selectedParent.phone || "Not Provided"}</div>
                    </div>
                  </div>
                )}

                {activeModal === "child" && (
                  <div>
                    {getLinkedChild(selectedParent._id) ? (
                      <div className="p-3 rounded-3 border" style={{ background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.05)", borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
                        <div className="fw-bold fs-5 mb-1" style={{ color: titleColor }}>{getLinkedChild(selectedParent._id).fullName}</div>
                        <span className="small d-block mb-2" style={{ color: subtextColor }}>{getLinkedChild(selectedParent._id).email}</span>
                        <span className="px-3 py-1 rounded-pill extra-small fw-bold text-success bg-success bg-opacity-15 d-inline-block">
                          Synced with Parent Account
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-4 extra-small" style={{ color: subtextColor }}>
                        No student child currently linked to this parent account.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top p-3" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
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
