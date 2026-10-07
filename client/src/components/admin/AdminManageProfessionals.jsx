import { useState } from "react";
import { FiSearch, FiBriefcase, FiHeart, FiAlertTriangle, FiTrash2, FiBarChart2, FiPieChart } from "react-icons/fi";

function AdminManageProfessionals({ users, onDeleteUser, theme = "light" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProf, setSelectedProf] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "report" | "burnout"

  const isLight = theme === "light";

  const cardStyle = {
    background: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.75)",
    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: isLight ? "0 2px 12px rgba(0, 0, 0, 0.03)" : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
    borderRadius: "16px"
  };

  const titleColor = isLight ? "#111827" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

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

  // Analytics calculation
  const totalProfs = professionals.length || 1;

  return (
    <div className="manage-professionals-section" style={{ maxWidth: "1500px", margin: "0 auto" }}>

      {/* PROFESSIONAL ANALYTICS ROW: BAR CHART & DONUT CHART */}
      <div className="row g-4 mb-4">
        {/* CHART 1: BURNOUT RISK BREAKDOWN (DONUT CHART) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1rem" }}>
              <FiPieChart style={{ color: "#18B981" }} /> Workplace Burnout Risk Breakdown
            </h6>

            <div className="d-flex align-items-center justify-content-around py-2">
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "120px", height: "120px" }}>
                <svg width="120" height="120" viewBox="0 0 42 42" className="donut">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)"} strokeWidth="4"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#18B981" strokeWidth="4.5" strokeDasharray="75 25" strokeDashoffset="25"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="18 82" strokeDashoffset="50"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#EF4444" strokeWidth="4.5" strokeDasharray="7 93" strokeDashoffset="32"></circle>
                </svg>
                <div className="position-absolute text-center">
                  <span className="fw-bold fs-5 leading-none d-block" style={{ color: titleColor }}>{totalProfs}</span>
                  <span className="extra-small" style={{ color: subtextColor, fontSize: "0.65rem" }}>Profs</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 extra-small fw-semibold">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle d-inline-block" style={{ width: "10px", height: "10px", background: "#18B981" }} />
                  <span style={{ color: titleColor }}>Low Risk (&lt;30%) — 75%</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle d-inline-block" style={{ width: "10px", height: "10px", background: "#F59E0B" }} />
                  <span style={{ color: titleColor }}>Moderate Risk — 18%</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle d-inline-block" style={{ width: "10px", height: "10px", background: "#EF4444" }} />
                  <span style={{ color: titleColor }}>High Risk (&gt;60%) — 7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: WORK-LIFE BALANCE SCORE (BAR CHART) */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1rem" }}>
              <FiBarChart2 style={{ color: "#4F8CFF" }} /> Work-Life & Recovery Metrics
            </h6>

            <div className="d-flex flex-column gap-2.5 pt-1">
              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span style={{ color: titleColor }}>Optimal Work-Life Balance (≥80%)</span>
                  <span style={{ color: "#18B981" }}>88% Avg</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "88%", background: "#18B981" }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span style={{ color: titleColor }}>Focus Hours & Deep Work Index</span>
                  <span style={{ color: "#4F8CFF" }}>82% Avg</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "82%", background: "#4F8CFF" }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between extra-small fw-semibold mb-1">
                  <span style={{ color: titleColor }}>Stress Recovery & Hydration Rate</span>
                  <span style={{ color: "#6C4CF1" }}>78% Avg</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px", background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
                  <div className="progress-bar rounded-pill" style={{ width: "78%", background: "#6C4CF1" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL LIST TABLE CARD */}
      <div className="p-4 rounded-4" style={cardStyle}>
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3 border-bottom pb-3" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
            <FiBriefcase style={{ color: "#18B981" }} /> Professional Directory
          </h6>

          <div className="d-flex align-items-center gap-3">
            <span className="extra-small fw-semibold d-none d-md-inline" style={{ color: subtextColor }}>
              Showing {filteredProfessionals.length} Professionals
            </span>
            <div className="input-group input-group-sm shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: "260px", borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)" }}>
              <span className="input-group-text border-0 ps-3" style={{ background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: subtextColor }}>
                <FiSearch size={14} />
              </span>
              <input 
                type="text"
                className="form-control border-0 pe-3"
                placeholder="Search professional or email..."
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
                <th className="fw-bold py-2.5">PROFESSIONAL NAME</th>
                <th className="fw-bold py-2.5">EMAIL</th>
                <th className="fw-bold py-2.5">OCCUPATION</th>
                <th className="fw-bold py-2.5">BURNOUT RISK</th>
                <th className="fw-bold py-2.5 text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessionals.length > 0 ? (
                filteredProfessionals.map((p) => {
                  return (
                    <tr key={p._id} className="border-bottom" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)" }}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0 shadow-sm"
                            style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #18B981, #059669)" }}
                          >
                            {p.fullName?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <span className="fw-semibold d-block" style={{ color: titleColor, fontSize: "0.88rem" }}>{p.fullName}</span>
                            <span className="extra-small d-block" style={{ color: subtextColor, fontSize: "0.75rem" }}>Working Professional</span>
                          </div>
                        </div>
                      </td>
                      <td className="small py-3" style={{ color: subtextColor, fontSize: "0.84rem" }}>{p.email}</td>
                      <td className="small py-3" style={{ color: subtextColor, fontSize: "0.84rem" }}>{p.occupation || "Software Engineer / Professional"}</td>
                      <td className="py-3">
                        <span 
                          className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-flex align-items-center gap-1"
                          style={{ background: "rgba(24, 185, 129, 0.12)", color: "#059669", border: "1px solid rgba(24, 185, 129, 0.3)", fontSize: "0.74rem" }}
                        >
                          🟢 Low Risk (22%)
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-inline-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                          <button
                            type="button"
                            onClick={() => { setSelectedProf(p); setActiveModal("report"); }}
                            className="btn btn-sm px-2.5 py-1 rounded-pill extra-small fw-semibold transition-all border-0"
                            style={{ background: "rgba(108, 76, 241, 0.12)", color: "#6C4CF1", fontSize: "0.75rem" }}
                            title="View Wellness Report"
                          >
                            <FiHeart size={13} /> Wellness Report
                          </button>

                          <button
                            type="button"
                            onClick={() => { setSelectedProf(p); setActiveModal("burnout"); }}
                            className="btn btn-sm px-2.5 py-1 rounded-pill extra-small fw-semibold transition-all border-0"
                            style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706", fontSize: "0.75rem" }}
                            title="View Burnout Risk"
                          >
                            <FiAlertTriangle size={13} /> Burnout Risk
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteUser(p._id, p.email)}
                            className="btn btn-sm p-1.5 rounded-circle border-0 text-danger"
                            style={{ background: "rgba(239, 68, 68, 0.12)" }}
                            title="Delete Account"
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
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ background: isLight ? "#FFFFFF" : "#1E293B", color: titleColor }}>
              
              <div className="modal-header border-bottom p-4" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.1rem" }}>
                  {activeModal === "report" && <>💼 Professional Wellness Report: {selectedProf.fullName}</>}
                  {activeModal === "burnout" && <>⚠️ Workplace Burnout Risk: {selectedProf.fullName}</>}
                </h5>
                <button type="button" className={`btn-close ${!isLight ? "btn-close-white" : ""}`} onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4 text-center">
                {activeModal === "report" && (
                  <div>
                    <div className="display-4 fw-bold text-success mb-2" style={{ color: "#18B981" }}>88%</div>
                    <span className="px-3 py-1 rounded-pill extra-small fw-bold text-success bg-success bg-opacity-15 mb-3 d-inline-block">
                      Optimal Work-Life Balance
                    </span>
                    <p className="small mb-0" style={{ color: subtextColor }}>
                      Workplace focus hours are steady, deep work blocks are maintained, and stress recovery index is high.
                    </p>
                  </div>
                )}

                {activeModal === "burnout" && (
                  <div>
                    <div className="display-4 fw-bold text-warning mb-2" style={{ color: "#F59E0B" }}>22%</div>
                    <span className="px-3 py-1 rounded-pill extra-small fw-bold text-warning bg-warning bg-opacity-15 mb-3 d-inline-block">
                      Low Burnout Risk
                    </span>
                    <p className="small mb-0" style={{ color: subtextColor }}>
                      Weekly workload distribution is well-paced with sufficient break intervals.
                    </p>
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

export default AdminManageProfessionals;
