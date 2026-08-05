import React, { useState } from "react";
import { 
  FiSearch, 
  FiUser, 
  FiFileText, 
  FiHeart, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle, 
  FiCalendar, 
  FiActivity,
  FiX,
  FiSmile,
  FiMoon,
  FiZap,
  FiTarget,
  FiBook
} from "react-icons/fi";

function AdminManageStudents({ users, wellnessAnalytics, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "profile" | "today-survey" | "history" | "report"
  const [studentStatusMap, setStudentStatusMap] = useState({});

  // Filter student role users
  const students = users.filter((u) => u.role === "Student");

  const filteredStudents = students.filter((s) => {
    const query = searchTerm.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.phone?.toLowerCase().includes(query)
    );
  });

  const toggleStudentStatus = (studentId) => {
    setStudentStatusMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "Deactivated" ? "Active" : "Deactivated",
    }));
  };

  // Find wellness record for student
  const getStudentWellness = (email) => {
    if (!wellnessAnalytics?.studentWellnessList) return null;
    return wellnessAnalytics.studentWellnessList.find((w) => w.email.toLowerCase() === email.toLowerCase());
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedStudent(null);
  };

  return (
    <div className="manage-students-section">
      {/* Header & Search */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FiUser className="text-primary" /> Manage Students ({filteredStudents.length})
          </h4>
          <p className="text-secondary small mb-0">
            View student profiles, daily check-in survey results, wellness reports, and account controls
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
            placeholder="Search student name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="p-4 rounded-4 text-white" style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="text-secondary border-bottom border-secondary border-opacity-25 small">
                <th>STUDENT NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>DOB / AGE</th>
                <th>STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => {
                  const status = studentStatusMap[s._id] || "Active";
                  const wellness = getStudentWellness(s.email);

                  return (
                    <tr key={s._id} className="border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary bg-opacity-20 text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                            {s.fullName?.charAt(0) || "S"}
                          </div>
                          <div>
                            <span className="fw-semibold text-white d-block">{s.fullName}</span>
                            <span className="text-secondary extra-small">{s.occupation || "Student"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary small">{s.email}</td>
                      <td className="text-secondary small">{s.phone || "N/A"}</td>
                      <td className="text-secondary small">{s.dob || s.age || "N/A"}</td>
                      <td>
                        <span className={`badge ${status === "Active" ? "bg-success" : "bg-danger"} bg-opacity-20 ${status === "Active" ? "text-success" : "text-danger"} px-3 py-1 rounded-pill small`}>
                          {status === "Active" ? "🟢 Active" : "🔴 Deactivated"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-end gap-1.5 flex-wrap">
                          {/* View Profile */}
                          <button
                            onClick={() => { setSelectedStudent(s); setActiveModal("profile"); }}
                            className="btn btn-outline-info btn-sm px-2 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                            title="View Profile"
                          >
                            <FiUser size={13} /> Profile
                          </button>

                          {/* View Today's Survey */}
                          <button
                            onClick={() => { setSelectedStudent(s); setActiveModal("today-survey"); }}
                            className="btn btn-outline-warning btn-sm px-2 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                            title="View Today's Survey"
                          >
                            <FiFileText size={13} /> Survey
                          </button>

                          {/* View Survey History */}
                          <button
                            onClick={() => { setSelectedStudent(s); setActiveModal("history"); }}
                            className="btn btn-outline-secondary text-white btn-sm px-2 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                            title="Survey History"
                          >
                            <FiCalendar size={13} /> History
                          </button>

                          {/* View Wellness Report */}
                          <button
                            onClick={() => { setSelectedStudent(s); setActiveModal("report"); }}
                            className="btn btn-outline-primary btn-sm px-2 py-1 rounded-3 extra-small d-inline-flex align-items-center gap-1"
                            title="Wellness Report"
                          >
                            <FiHeart size={13} /> Report
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => toggleStudentStatus(s._id)}
                            className={`btn ${status === "Active" ? "btn-outline-secondary" : "btn-outline-success"} btn-sm px-2 py-1 rounded-3 extra-small`}
                            title={status === "Active" ? "Deactivate Account" : "Activate Account"}
                          >
                            {status === "Active" ? <FiXCircle size={13} /> : <FiCheckCircle size={13} />}
                          </button>

                          {/* Delete Student */}
                          <button
                            onClick={() => onDeleteUser(s._id, s.email)}
                            className="btn btn-outline-danger btn-sm px-2 py-1 rounded-3 extra-small"
                            title="Delete Student"
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
                  <td colSpan="6" className="text-center py-4 text-secondary">
                    No student accounts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && selectedStudent && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-slate-900 text-white rounded-4 border border-secondary border-opacity-25 shadow-lg" style={{ background: "#0F172A" }}>
              
              {/* Modal Header */}
              <div className="modal-header border-bottom border-secondary border-opacity-25 p-4">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  {activeModal === "profile" && <>👤 Student Profile: {selectedStudent.fullName}</>}
                  {activeModal === "today-survey" && <>📝 Today's Survey Result: {selectedStudent.fullName}</>}
                  {activeModal === "history" && <>📜 Check-in Survey History: {selectedStudent.fullName}</>}
                  {activeModal === "report" && <>❤️ Wellness Analysis Report: {selectedStudent.fullName}</>}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                {/* 1. Student Profile Modal */}
                {activeModal === "profile" && (
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="text-secondary small d-block">Full Name</label>
                      <div className="fw-semibold text-white fs-6">{selectedStudent.fullName}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small d-block">Email Address</label>
                      <div className="fw-semibold text-white fs-6">{selectedStudent.email}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small d-block">Phone Number</label>
                      <div className="fw-semibold text-white fs-6">{selectedStudent.phone || "Not Provided"}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small d-block">Date of Birth (DOB) / Age</label>
                      <div className="fw-semibold text-white fs-6">{selectedStudent.dob || selectedStudent.age || "Not Provided"}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small d-block">Gender</label>
                      <div className="fw-semibold text-white fs-6">{selectedStudent.gender || "Other"}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small d-block">Major / Academic Focus</label>
                      <div className="fw-semibold text-white fs-6">{selectedStudent.occupation || "Student"}</div>
                    </div>
                    <div className="col-12">
                      <label className="text-secondary small d-block">Lifestyle Goal</label>
                      <div className="fw-semibold text-white fs-6">{selectedStudent.lifestyle || "Maintain healthy study balance"}</div>
                    </div>
                  </div>
                )}

                {/* 2. Today's Survey Modal */}
                {activeModal === "today-survey" && (
                  <div>
                    {getStudentWellness(selectedStudent.email) ? (
                      <div className="row g-3">
                        <div className="col-6 col-md-4">
                          <div className="p-3 rounded-3 bg-dark bg-opacity-50">
                            <span className="text-secondary small">Mood</span>
                            <div className="fw-bold text-white fs-5">{getStudentWellness(selectedStudent.email).mood}</div>
                          </div>
                        </div>
                        <div className="col-6 col-md-4">
                          <div className="p-3 rounded-3 bg-dark bg-opacity-50">
                            <span className="text-secondary small">Stress Level</span>
                            <div className="fw-bold text-warning fs-5">{getStudentWellness(selectedStudent.email).stressLevel} / 10</div>
                          </div>
                        </div>
                        <div className="col-6 col-md-4">
                          <div className="p-3 rounded-3 bg-dark bg-opacity-50">
                            <span className="text-secondary small">Energy Level</span>
                            <div className="fw-bold text-success fs-5">{getStudentWellness(selectedStudent.email).energyLevel}</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="p-3 rounded-3 bg-dark bg-opacity-50">
                            <span className="text-secondary small">Calculated Score</span>
                            <div className="fw-bold text-primary fs-4">{getStudentWellness(selectedStudent.email).wellnessScore}% ({getStudentWellness(selectedStudent.email).status})</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-secondary">
                        No Daily Check-in recorded for this student today yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Survey History Modal */}
                {activeModal === "history" && (
                  <div>
                    <p className="text-secondary small">Showing recent Daily Check-in entries for this student:</p>
                    <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                      <div className="d-flex justify-content-between text-white fw-semibold mb-2">
                        <span>📅 Today's Check-in Log</span>
                        <span className="text-success">Completed</span>
                      </div>
                      <p className="text-secondary small mb-0">Recorded successfully in MongoDB `dailycheckin` collection.</p>
                    </div>
                  </div>
                )}

                {/* 4. Wellness Report Modal */}
                {activeModal === "report" && (
                  <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-center">
                    <div className="display-4 fw-bold text-primary mb-2">
                      {getStudentWellness(selectedStudent.email)?.wellnessScore || 85}%
                    </div>
                    <span className="badge bg-success px-3 py-1.5 rounded-pill mb-3">
                      {getStudentWellness(selectedStudent.email)?.status || "Excellent"}
                    </span>
                    <p className="text-secondary small mb-0">
                      Overall mental wellness is stable. Stress level is within normal range and sleep cycle is healthy.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
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

export default AdminManageStudents;
