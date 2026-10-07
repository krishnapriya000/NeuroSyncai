import { useState } from "react";
import { FiSearch, FiSun, FiHeart, FiTrash2, FiPieChart, FiBarChart2 } from "react-icons/fi";

function AdminManageSeniors({ users, onDeleteUser, theme = "light" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const isLight = theme === "light";

  const cardStyle = {
    background: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.75)",
    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: isLight ? "0 2px 12px rgba(0, 0, 0, 0.03)" : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
    borderRadius: "16px"
  };

  const titleColor = isLight ? "#111827" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

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

  // Mock Senior Care Analytics
  const healthDistribution = [
    { label: "Active & Independent", percentage: 62, count: Math.ceil(seniors.length * 0.62) || 12, color: "#10B981" },
    { label: "Caregiver Assisted", percentage: 26, count: Math.floor(seniors.length * 0.26) || 5, color: "#F59E0B" },
    { label: "High Priority Alert", percentage: 12, count: Math.floor(seniors.length * 0.12) || 2, color: "#EF4444" },
  ];

  const weeklyActivities = [
    { day: "Mon", memoryGames: 88, breathing: 75, walking: 64 },
    { day: "Tue", memoryGames: 92, breathing: 80, walking: 70 },
    { day: "Wed", memoryGames: 85, breathing: 78, walking: 68 },
    { day: "Thu", memoryGames: 95, breathing: 85, walking: 75 },
    { day: "Fri", memoryGames: 90, breathing: 82, walking: 72 },
    { day: "Sat", memoryGames: 82, breathing: 70, walking: 60 },
    { day: "Sun", memoryGames: 86, breathing: 74, walking: 65 },
  ];

  return (
    <div className="manage-seniors-section" style={{ maxWidth: "1500px", margin: "0 auto" }}>

      {/* VISUAL CHARTS ROW: DONUT CHART + BAR CHART */}
      <div className="row g-4 mb-4">
        {/* 1. HEALTH & MOBILITY PIE/DONUT CHART */}
        <div className="col-12 col-lg-5">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "0.95rem" }}>
                <FiPieChart style={{ color: "#F59E0B" }} /> Cognitive & Health Status
              </h6>
              <span className="extra-small fw-semibold" style={{ color: subtextColor }}>Distribution</span>
            </div>

            <div className="d-flex flex-column align-items-center justify-content-center py-2">
              <div className="position-relative d-flex align-items-center justify-content-center mb-3">
                <svg width="150" height="150" viewBox="0 0 42 42" className="donut-svg">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)"} strokeWidth="4.5" />
                  {/* Segment 1: Active 62% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray="62 38"
                    strokeDashoffset="25"
                  />
                  {/* Segment 2: Assisted 26% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    strokeDasharray="26 74"
                    strokeDashoffset="-37"
                  />
                  {/* Segment 3: High Priority 12% */}
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="4.5"
                    strokeDasharray="12 88"
                    strokeDashoffset="-63"
                  />
                </svg>
                <div className="position-absolute text-center">
                  <span className="fw-bold d-block lh-1" style={{ color: titleColor, fontSize: "1.25rem" }}>62%</span>
                  <span className="extra-small" style={{ color: subtextColor, fontSize: "0.68rem" }}>Active</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="w-100 d-flex flex-column gap-2 mt-1">
                {healthDistribution.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.05)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: item.color }} />
                      <span className="small fw-semibold" style={{ color: titleColor, fontSize: "0.82rem" }}>{item.label}</span>
                    </div>
                    <span className="extra-small fw-bold" style={{ color: titleColor }}>{item.percentage}% ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. WEEKLY SENIOR ACTIVITY ENGAGEMENT BAR CHART */}
        <div className="col-12 col-lg-7">
          <div className="p-4 rounded-4 h-100" style={cardStyle}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)" }}>
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "0.95rem" }}>
                <FiBarChart2 style={{ color: "#7C5CFC" }} /> 7-Day Cognitive & Wellness Activity
              </h6>
              <div className="d-flex align-items-center gap-3 extra-small fw-semibold">
                <span className="d-flex align-items-center gap-1" style={{ color: "#7C5CFC" }}><span className="rounded-circle d-inline-block" style={{ width: "8px", height: "8px", background: "#7C5CFC" }} /> Memory Games</span>
                <span className="d-flex align-items-center gap-1" style={{ color: "#06B6D4" }}><span className="rounded-circle d-inline-block" style={{ width: "8px", height: "8px", background: "#06B6D4" }} /> Breathing</span>
                <span className="d-flex align-items-center gap-1" style={{ color: "#F59E0B" }}><span className="rounded-circle d-inline-block" style={{ width: "8px", height: "8px", background: "#F59E0B" }} /> Gentle Walk</span>
              </div>
            </div>

            <div className="d-flex align-items-end justify-content-between gap-2 pt-4" style={{ height: "190px" }}>
              {weeklyActivities.map((item, idx) => (
                <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                  <div className="d-flex align-items-end justify-content-center gap-1 w-100" style={{ height: "140px" }}>
                    <div 
                      className="rounded-top transition-all" 
                      style={{ 
                        width: "28%", 
                        height: `${item.memoryGames * 1.3}px`, 
                        background: "linear-gradient(180deg, #7C5CFC 0%, #4F8CFF 100%)",
                        borderRadius: "4px 4px 0 0" 
                      }} 
                      title={`Memory Games: ${item.memoryGames}%`}
                    />
                    <div 
                      className="rounded-top transition-all" 
                      style={{ 
                        width: "28%", 
                        height: `${item.breathing * 1.3}px`, 
                        background: "linear-gradient(180deg, #06B6D4 0%, #0891B2 100%)",
                        borderRadius: "4px 4px 0 0" 
                      }} 
                      title={`Breathing: ${item.breathing}%`}
                    />
                    <div 
                      className="rounded-top transition-all" 
                      style={{ 
                        width: "28%", 
                        height: `${item.walking * 1.3}px`, 
                        background: "linear-gradient(180deg, #F59E0B 0%, #D97706 100%)",
                        borderRadius: "4px 4px 0 0" 
                      }} 
                      title={`Gentle Walk: ${item.walking}%`}
                    />
                  </div>
                  <span className="extra-small fw-semibold mt-2" style={{ color: subtextColor, fontSize: "0.75rem" }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SENIOR LIST TABLE CARD */}
      <div className="p-4 rounded-4" style={cardStyle}>
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3 border-bottom pb-3" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.05rem" }}>
            <FiSun style={{ color: "#F59E0B" }} /> Senior Directory
          </h6>

          <div className="d-flex align-items-center gap-3">
            <span className="extra-small fw-semibold d-none d-md-inline" style={{ color: subtextColor }}>
              Showing {filteredSeniors.length} Seniors
            </span>
            <div className="input-group input-group-sm shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: "260px", borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.15)" }}>
              <span className="input-group-text border-0 ps-3" style={{ background: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)", color: subtextColor }}>
                <FiSearch size={14} />
              </span>
              <input 
                type="text"
                className="form-control border-0 pe-3"
                placeholder="Search senior citizen or email..."
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
                <th className="fw-bold py-2.5">SENIOR NAME</th>
                <th className="fw-bold py-2.5">EMAIL</th>
                <th className="fw-bold py-2.5">PHONE</th>
                <th className="fw-bold py-2.5">WELLNESS STATUS</th>
                <th className="fw-bold py-2.5 text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeniors.length > 0 ? (
                filteredSeniors.map((s) => {
                  return (
                    <tr key={s._id} className="border-bottom" style={{ borderColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)" }}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0 shadow-sm"
                            style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
                          >
                            {s.fullName?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <span className="fw-semibold d-block" style={{ color: titleColor, fontSize: "0.88rem" }}>{s.fullName}</span>
                            <span className="extra-small d-block" style={{ color: subtextColor, fontSize: "0.75rem" }}>Senior Citizen</span>
                          </div>
                        </div>
                      </td>
                      <td className="small py-3" style={{ color: subtextColor, fontSize: "0.84rem" }}>{s.email}</td>
                      <td className="small py-3" style={{ color: subtextColor, fontSize: "0.84rem" }}>{s.phone || "N/A"}</td>
                      <td className="py-3">
                        <span 
                          className="px-2.5 py-1 rounded-pill extra-small fw-bold d-inline-flex align-items-center gap-1"
                          style={{ background: "rgba(24, 185, 129, 0.12)", color: "#059669", border: "1px solid rgba(24, 185, 129, 0.3)", fontSize: "0.74rem" }}
                        >
                          🟢 Active & Healthy (92%)
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-inline-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                          <button
                            type="button"
                            onClick={() => { setSelectedSenior(s); setShowReportModal(true); }}
                            className="btn btn-sm px-2.5 py-1 rounded-pill extra-small fw-semibold transition-all border-0"
                            style={{ background: "rgba(108, 76, 241, 0.12)", color: "#6C4CF1", fontSize: "0.75rem" }}
                            title="View Wellness Report"
                          >
                            <FiHeart size={13} /> Wellness Report
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteUser(s._id, s.email)}
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
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ background: isLight ? "#FFFFFF" : "#1E293B", color: titleColor }}>
              
              <div className="modal-header border-bottom p-4" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ color: titleColor, fontSize: "1.1rem" }}>
                  👴 Senior Citizen Wellness Report: {selectedSenior.fullName}
                </h5>
                <button type="button" className={`btn-close ${!isLight ? "btn-close-white" : ""}`} onClick={() => setShowReportModal(false)}></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div className="display-4 fw-bold text-success mb-2" style={{ color: "#18B981" }}>92%</div>
                <span className="px-3 py-1 rounded-pill extra-small fw-bold text-success bg-success bg-opacity-15 mb-3 d-inline-block">
                  Excellent Health Score
                </span>
                <p className="small mb-0" style={{ color: subtextColor }}>
                  Daily cognitive activities completed consistently. Sleep cycle and hydration habits are well maintained.
                </p>
              </div>

              <div className="modal-footer border-top p-3" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
                <button type="button" className="btn btn-secondary rounded-pill px-4 btn-sm" onClick={() => setShowReportModal(false)}>Close</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManageSeniors;
