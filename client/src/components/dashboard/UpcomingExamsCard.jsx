import React from "react";
import { FiBook, FiCalendar, FiClock } from "react-icons/fi";

const exams = [
  { id: 1, subject: "Operating Systems", date: "15 Aug", daysLeft: "17 Days Left", priority: "High" },
  { id: 2, subject: "Cloud Computing", date: "18 Aug", daysLeft: "20 Days Left", priority: "Medium" },
  { id: 3, subject: "Java Lab", date: "22 Aug", daysLeft: "24 Days Left", priority: "Practical" },
];

function UpcomingExamsCard() {
  return (
    <div className="ns-card h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <FiBook className="text-secondary fs-5" />
          <h5 className="mb-0 text-white fw-bold fs-6">Upcoming Exams</h5>
        </div>
        <span className="text-muted" style={{ fontSize: "0.78rem" }}>August 2026</span>
      </div>

      <div className="d-flex flex-column gap-2">
        {exams.map((exam) => (
          <div key={exam.id} className="ns-exam-item">
            <div>
              <div className="fw-semibold text-white mb-1" style={{ fontSize: "0.92rem" }}>
                {exam.subject}
              </div>
              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.76rem" }}>
                <span className="d-flex align-items-center gap-1">
                  <FiClock size={12} /> {exam.daysLeft}
                </span>
                <span>•</span>
                <span className={`badge ${exam.priority === "High" ? "bg-danger" : exam.priority === "Medium" ? "bg-warning text-dark" : "bg-info text-dark"} bg-opacity-25 border border-opacity-25 px-2`}>
                  {exam.priority}
                </span>
              </div>
            </div>

            <div className="ns-exam-date-pill d-flex align-items-center gap-1">
              <FiCalendar size={13} />
              <span>{exam.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingExamsCard;
