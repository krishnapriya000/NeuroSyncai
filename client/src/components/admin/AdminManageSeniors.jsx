import React, { useState } from "react";
import { FiSearch, FiSun, FiHeart, FiTrash2, FiX, FiActivity, FiPieChart, FiBarChart2, FiCheckCircle } from "react-icons/fi";

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
                style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #F59E0B, #D97706)", fontSize: "1.3rem" }}
              >
                👴
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.01em" }}>
                    Senior Citizens Care Hub
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-pill extra-small fw-bold" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}>
                    {filteredSeniors.length} Senior Accounts
                  </span>
                </div>
                <p className="text-secondary small mb-0">
                  Monitor senior citizen health check-ins, cognitive exercise completion, and caretaker status.
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
                placeholder="Search senior citizen or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS ROW: DONUT CHART + BAR CHART */}
      <div className="row g-4 mb-4">
        {/* 1. HEALTH & MOBILITY PIE/DONUT CHART */}
        <div className="col-12 col-lg-5">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: "#F1F5F9" }}>
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                <FiPieChart style={{ color: "#F59E0B" }} /> Cognitive & Health Status
              </h6>
              <span className="extra-small text-secondary fw-semibold">Distribution</span>
            </div>

            <div className="d-flex flex-column align-items-center justify-content-center py-2">
              <div className="position-relative d-flex align-items-center justify-content-center mb-3">
                <svg width="150" height="150" viewBox="0 0 42 42" className="donut-svg">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F1F5F9" strokeWidth="4.5" />
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
                  <span className="fw-bold d-block text-dark lh-1" style={{ fontSize: "1.25rem" }}>62%</span>
                  <span className="extra-small text-secondary" style={{ fontSize: "0.68rem" }}>Active</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="w-100 d-flex flex-column gap-2 mt-1">
                {healthDistribution.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ background: "#F8FAFC" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: item.color }} />
                      <span className="small fw-semibold text-dark" style={{ fontSize: "0.82rem" }}>{item.label}</span>
                    </div>
                    <span className="extra-small fw-bold text-dark">{item.percentage}% ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. WEEKLY SENIOR ACTIVITY ENGAGEMENT BAR CHART */}
        <div className="col-12 col-lg-7">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: "#F1F5F9" }}>
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
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
                  <span className="extra-small fw-semibold text-secondary mt-2" style={{ fontSize: "0.75rem" }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SENIOR LIST TABLE CARD */}
      <div className="p-4 rounded-4 bg-white border shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3" style={{ borderColor: "#E2E8F0" }}>
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
            <FiSun style={{ color: "#F59E0B" }} /> Senior Directory
          </h6>
          <span className="extra-small text-secondary fw-semibold">
            Showing {filteredSeniors.length} Seniors
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="extra-small text-uppercase tracking-wider border-bottom text-secondary" style={{ borderColor: "#E2E8F0" }}>
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
                    <tr key={s._id} className="border-bottom" style={{ borderColor: "#F1F5F9" }}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0 shadow-sm"
                            style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
                          >
                            {s.fullName?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: "0.88rem" }}>{s.fullName}</span>
                            <span className="text-secondary extra-small d-block" style={{ fontSize: "0.75rem" }}>Senior Citizen</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary small py-3" style={{ fontSize: "0.84rem" }}>{s.email}</td>
                      <td className="text-secondary small py-3" style={{ fontSize: "0.84rem" }}>{s.phone || "N/A"}</td>
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
                  <td colSpan="5" className="text-center py-4 text-secondary small">
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
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white text-dark rounded-4 border-0 shadow-lg">
              
              <div className="modal-header border-bottom p-4" style={{ borderColor: "#E2E8F0" }}>
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                  👴 Senior Citizen Wellness Report: {selectedSenior.fullName}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReportModal(false)}></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div className="display-4 fw-bold text-success mb-2" style={{ color: "#18B981" }}>92%</div>
                <span className="px-3 py-1 rounded-pill extra-small fw-bold text-success bg-success bg-opacity-15 mb-3 d-inline-block">
                  Excellent Health Score
                </span>
                <p className="text-secondary small mb-0">
                  Daily cognitive activities completed consistently. Sleep cycle and hydration habits are well maintained.
                </p>
              </div>

              <div className="modal-footer border-top p-3" style={{ borderColor: "#E2E8F0" }}>
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
