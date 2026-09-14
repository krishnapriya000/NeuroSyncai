import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiCheckSquare, FiSmile, FiMoon, FiActivity, FiZap, FiCheck, FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorDailyCheckIn() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [feeling, setFeeling] = useState("Good");
  const [sleepQuality, setSleepQuality] = useState("Good");
  const [activityLevel, setActivityLevel] = useState("Moderate");
  const [energyLevel, setEnergyLevel] = useState("Good");
  const [routineCompleted, setRoutineCompleted] = useState(true);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setSeniorName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchCheckInHistory();
  }, []);

  const fetchCheckInHistory = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoadingHistory(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/senior/daily-checkin?limit=7", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCheckInHistory(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching check-in history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("neurosync_token");

    const payload = {
      feeling,
      sleepQuality,
      activityLevel,
      energyLevel,
      routineCompleted,
      notes,
    };

    try {
      const res = await fetch("http://localhost:5000/api/senior/daily-checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitted(true);
        setSummaryData(json.data);
        fetchCheckInHistory();
      } else {
        alert(json.message || "Failed to save daily check-in.");
      }
    } catch (err) {
      console.error("Submit Senior Daily Check-in error:", err);
      alert("Could not connect to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="daily-checkin"
        setActiveTab={() => {}}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <TopNavbar
        studentName={seniorName}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="ns-main-content">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34D399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                👴 Senior Citizen Wellness
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-2 mb-1">📝 Daily Check-in</h1>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Record your daily wellbeing, sleep, and routine with simple choices.
            </p>
          </div>
        </div>

        {/* MAIN FORM CARD */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="ns-card p-4 p-md-5">
              {submitted && summaryData ? (
                /* SUCCESS SUMMARY VIEW */
                <div className="text-center py-4">
                  <div className="fs-1 text-success mb-3">🎉</div>
                  <h3 className="text-white fw-bold mb-2">Check-in Complete!</h3>
                  <p className="text-white-50 mb-4" style={{ fontSize: "1rem" }}>
                    Thank you for recording your daily wellness. Your check-in has been saved to your health history.
                  </p>

                  <div className="p-4 rounded-4 bg-dark border border-success border-opacity-30 text-start mx-auto mb-4" style={{ maxWidth: "450px" }}>
                    <h5 className="text-success fw-bold mb-3 d-flex align-items-center gap-2">
                      <FiCheckCircle /> Daily Wellness Summary
                    </h5>
                    <div className="d-flex flex-column gap-2 text-white" style={{ fontSize: "0.95rem" }}>
                      <div>😊 <strong>Feeling:</strong> {summaryData.feeling}</div>
                      <div>😴 <strong>Sleep Quality:</strong> {summaryData.sleepQuality}</div>
                      <div>🏃 <strong>Activity:</strong> {summaryData.activityLevel}</div>
                      <div>⚡ <strong>Energy Level:</strong> {summaryData.energyLevel}</div>
                      <div>✅ <strong>Routine Completed:</strong> {summaryData.routineCompleted ? "Yes" : "No"}</div>
                      {summaryData.notes && <div>📝 <strong>Notes:</strong> {summaryData.notes}</div>}
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-bold"
                    onClick={() => setSubmitted(false)}
                  >
                    Edit / Submit New Check-in
                  </button>
                </div>
              ) : (
                /* QUESTIONNAIRE FORM */
                <form onSubmit={handleSubmit}>
                  {/* Q1: Feeling */}
                  <div className="mb-4">
                    <label className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                      <FiSmile className="text-primary" /> 1. How are you feeling today?
                    </label>
                    <div className="row g-2">
                      {[
                        { label: "Great", emoji: "😊" },
                        { label: "Good", emoji: "🙂" },
                        { label: "Okay", emoji: "😐" },
                        { label: "Tired", emoji: "😴" },
                        { label: "Unwell", emoji: "🤒" },
                      ].map((opt) => (
                        <div key={opt.label} className="col-6 col-sm-4 col-md">
                          <button
                            type="button"
                            className={`btn p-3 w-100 rounded-3 text-white fw-bold d-flex flex-column align-items-center gap-1 border ${
                              feeling === opt.label ? "btn-primary border-primary shadow" : "btn-outline-secondary bg-dark border-secondary border-opacity-25"
                            }`}
                            style={{ minHeight: "80px", fontSize: "0.95rem" }}
                            onClick={() => setFeeling(opt.label)}
                          >
                            <span className="fs-3">{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q2: Sleep Quality */}
                  <div className="mb-4">
                    <label className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                      <FiMoon className="text-purple-400" style={{ color: "#c084fc" }} /> 2. How was your sleep last night?
                    </label>
                    <div className="row g-2">
                      {[
                        { label: "Excellent", emoji: "😴" },
                        { label: "Good", emoji: "👍" },
                        { label: "Fair", emoji: "😐" },
                        { label: "Poor", emoji: "🥱" },
                      ].map((opt) => (
                        <div key={opt.label} className="col-6 col-sm-3">
                          <button
                            type="button"
                            className={`btn p-3 w-100 rounded-3 text-white fw-bold d-flex flex-column align-items-center gap-1 border ${
                              sleepQuality === opt.label ? "btn-primary border-primary shadow" : "btn-outline-secondary bg-dark border-secondary border-opacity-25"
                            }`}
                            style={{ minHeight: "80px", fontSize: "0.95rem" }}
                            onClick={() => setSleepQuality(opt.label)}
                          >
                            <span className="fs-3">{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Activity Level */}
                  <div className="mb-4">
                    <label className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                      <FiActivity className="text-success" /> 3. How active were you today?
                    </label>
                    <div className="row g-2">
                      {[
                        { label: "Very Active", emoji: "🏃" },
                        { label: "Moderate", emoji: "🚶" },
                        { label: "Gentle Rest", emoji: "🧘" },
                      ].map((opt) => (
                        <div key={opt.label} className="col-12 col-sm-4">
                          <button
                            type="button"
                            className={`btn p-3 w-100 rounded-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 border ${
                              activityLevel === opt.label ? "btn-primary border-primary shadow" : "btn-outline-secondary bg-dark border-secondary border-opacity-25"
                            }`}
                            style={{ minHeight: "65px", fontSize: "1rem" }}
                            onClick={() => setActivityLevel(opt.label)}
                          >
                            <span className="fs-4">{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q4: Energy Level */}
                  <div className="mb-4">
                    <label className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                      <FiZap className="text-warning" /> 4. How is your energy level?
                    </label>
                    <div className="row g-2">
                      {[
                        { label: "High", emoji: "⚡" },
                        { label: "Good", emoji: "👍" },
                        { label: "Low", emoji: "🔋" },
                      ].map((opt) => (
                        <div key={opt.label} className="col-4">
                          <button
                            type="button"
                            className={`btn p-3 w-100 rounded-3 text-white fw-bold d-flex flex-column align-items-center gap-1 border ${
                              energyLevel === opt.label ? "btn-primary border-primary shadow" : "btn-outline-secondary bg-dark border-secondary border-opacity-25"
                            }`}
                            style={{ minHeight: "75px", fontSize: "0.95rem" }}
                            onClick={() => setEnergyLevel(opt.label)}
                          >
                            <span className="fs-3">{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q5: Daily Routine */}
                  <div className="mb-4">
                    <label className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                      <FiCheckSquare className="text-info" /> 5. Did you complete your daily routine?
                    </label>
                    <div className="d-flex gap-3">
                      <button
                        type="button"
                        className={`btn p-3 flex-grow-1 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                          routineCompleted ? "btn-success shadow" : "btn-outline-secondary text-white bg-dark border-secondary border-opacity-25"
                        }`}
                        style={{ fontSize: "1.05rem" }}
                        onClick={() => setRoutineCompleted(true)}
                      >
                        ✅ Yes, Completed
                      </button>
                      <button
                        type="button"
                        className={`btn p-3 flex-grow-1 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                          !routineCompleted ? "btn-warning text-dark shadow" : "btn-outline-secondary text-white bg-dark border-secondary border-opacity-25"
                        }`}
                        style={{ fontSize: "1.05rem" }}
                        onClick={() => setRoutineCompleted(false)}
                      >
                        ⏳ Partial / Not Yet
                      </button>
                    </div>
                  </div>

                  {/* Q6: Anything bothering you */}
                  <div className="mb-4">
                    <label className="text-white fw-bold fs-5 mb-2">
                      6. Is there anything bothering you today? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      className="form-control bg-dark text-white border-secondary border-opacity-25 p-3 rounded-3"
                      placeholder="Write any thoughts, mild discomforts, or comments..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ fontSize: "0.95rem" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-extrabold w-100 shadow mt-2"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {submitting ? "Saving Check-in..." : "Save Daily Check-in"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* SIDEBAR RECENT HISTORY */}
          <div className="col-lg-4">
            <div className="ns-card p-4 h-100">
              <h4 className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                <FiCalendar className="text-primary" /> Past Check-ins
              </h4>

              {loadingHistory ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                  <p className="text-muted small">Loading history...</p>
                </div>
              ) : checkInHistory.length === 0 ? (
                <p className="text-muted small py-3">No check-in entries logged yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2.5">
                  {checkInHistory.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-white fw-bold" style={{ fontSize: "0.9rem" }}>
                          Feeling: {item.feeling}
                        </span>
                        <span className="text-muted small">
                          {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="text-muted small">
                        Sleep: {item.sleepQuality} • Activity: {item.activityLevel}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export default SeniorDailyCheckIn;
