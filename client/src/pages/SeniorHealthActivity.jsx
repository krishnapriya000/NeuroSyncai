import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { FiActivity, FiMoon, FiZap, FiCpu, FiPlus, FiCalendar } from "react-icons/fi";
import "../styles/studentDashboard.css";

function SeniorHealthActivity() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorName, setSeniorName] = useState("Senior User");

  const [steps, setSteps] = useState("3500");
  const [sleepHours, setSleepHours] = useState("7.5");
  const [waterGlasses, setWaterGlasses] = useState("6");
  const [energyLevel, setEnergyLevel] = useState("Good");

  // Optional manual vitals
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("neurosync_current_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName || u.name) setStudentName(u.fullName || u.name);
      } catch (e) {}
    }

    fetchActivityHistory();
  }, []);

  const fetchActivityHistory = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoadingHistory(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/senior/health-activity?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setHistory(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching health activity history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("neurosync_token");

    const payload = {
      steps: Number(steps) || 0,
      sleepHours: Number(sleepHours) || 0,
      waterGlasses: Number(waterGlasses) || 0,
      energyLevel,
      vitals: {
        bpSystolic: bpSystolic ? Number(bpSystolic) : null,
        bpDiastolic: bpDiastolic ? Number(bpDiastolic) : null,
        heartRate: heartRate ? Number(heartRate) : null,
        bloodSugar: bloodSugar ? Number(bloodSugar) : null,
      },
      notes,
    };

    try {
      const res = await fetch("http://localhost:5000/api/senior/health-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        fetchActivityHistory();
        alert("Health and activity logged successfully!");
      } else {
        alert(json.message || "Failed to log health activity.");
      }
    } catch (err) {
      console.error("Error saving health activity:", err);
      alert("Cannot connect to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="health-activity"
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
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60A5FA",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                👴 Senior Citizen Wellness
              </span>
            </div>
            <h1 className="text-white fw-extrabold fs-2 mb-1">📊 Health & Activity</h1>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Record your daily physical activity, sleep duration, hydration, and wellness metrics.
            </p>
          </div>
        </div>

        {/* WEARABLE / IOT PREPAREDNESS BANNER */}
        <div
          className="p-3 mb-4 rounded-4 text-white d-flex align-items-center justify-content-between flex-wrap gap-3 shadow-sm"
          style={{
            background: "linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(30, 41, 59, 0.8) 100%)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="p-2.5 rounded-circle bg-purple-500 bg-opacity-20 text-purple-300">
              <FiCpu size={24} style={{ color: "#c084fc" }} />
            </div>
            <div>
              <h5 className="text-white fw-bold mb-0" style={{ fontSize: "1rem" }}>
                ⌚ Wearable & IoT Ready
              </h5>
              <p className="text-white-50 mb-0" style={{ fontSize: "0.88rem" }}>
                This module is architected to receive automatic data sync from Smartwatches, Fitness Bands & IoT health sensors in future updates.
              </p>
            </div>
          </div>
          <span className="badge bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30 px-3 py-1.5" style={{ fontSize: "0.8rem" }}>
            Integration Ready
          </span>
        </div>

        {/* MAIN ENTRY FORM */}
        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="ns-card p-4 p-md-5">
              <h4 className="text-white fw-bold fs-4 mb-4 d-flex align-items-center gap-2">
                <FiActivity className="text-primary" /> Daily Activity & Wellness Metrics
              </h4>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-4">
                  {/* Steps */}
                  <div className="col-12 col-sm-6">
                    <label className="text-white fw-semibold mb-2" style={{ fontSize: "0.95rem" }}>
                      🏃 Daily Steps / Activity
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg bg-dark text-white border-secondary border-opacity-25"
                      placeholder="e.g. 3500"
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                    />
                  </div>

                  {/* Sleep Hours */}
                  <div className="col-12 col-sm-6">
                    <label className="text-white fw-semibold mb-2" style={{ fontSize: "0.95rem" }}>
                      😴 Sleep Duration (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control form-control-lg bg-dark text-white border-secondary border-opacity-25"
                      placeholder="e.g. 7.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                    />
                  </div>

                  {/* Water Glasses */}
                  <div className="col-12 col-sm-6">
                    <label className="text-white fw-semibold mb-2" style={{ fontSize: "0.95rem" }}>
                      💧 Water Intake (Glasses)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg bg-dark text-white border-secondary border-opacity-25"
                      placeholder="e.g. 6"
                      value={waterGlasses}
                      onChange={(e) => setWaterGlasses(e.target.value)}
                    />
                  </div>

                  {/* Energy Level */}
                  <div className="col-12 col-sm-6">
                    <label className="text-white fw-semibold mb-2" style={{ fontSize: "0.95rem" }}>
                      ⚡ Energy Level
                    </label>
                    <select
                      className="form-select form-select-lg bg-dark text-white border-secondary border-opacity-25"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(e.target.value)}
                    >
                      <option value="Good">Good ⚡</option>
                      <option value="Moderate">Moderate 👍</option>
                      <option value="Low">Low 🔋</option>
                    </select>
                  </div>
                </div>

                {/* MANUAL VITALS SECTION */}
                <div className="p-4 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-25 mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="text-white fw-bold mb-0" style={{ fontSize: "1rem" }}>
                      🩺 Optional Basic Vitals
                    </h5>
                    <span className="badge bg-secondary bg-opacity-30 text-white-50" style={{ fontSize: "0.75rem" }}>
                      Manually Entered Data Only
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-6 col-sm-3">
                      <label className="text-muted small mb-1">BP Systolic</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        placeholder="120"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-3">
                      <label className="text-muted small mb-1">BP Diastolic</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        placeholder="80"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-3">
                      <label className="text-muted small mb-1">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        placeholder="72"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-sm-3">
                      <label className="text-muted small mb-1">Blood Sugar (mg/dL)</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary border-opacity-25"
                        placeholder="95"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold w-100 shadow"
                  style={{ fontSize: "1.05rem" }}
                >
                  {saving ? "Saving Activity..." : "Save Health & Activity Log"}
                </button>
              </form>
            </div>
          </div>

          {/* RECENT HISTORY */}
          <div className="col-lg-5">
            <div className="ns-card p-4 h-100">
              <h4 className="text-white fw-bold fs-5 mb-3 d-flex align-items-center gap-2">
                <FiCalendar className="text-primary" /> Past Activity Logs
              </h4>

              {loadingHistory ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                  <p className="text-muted small">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <p className="text-muted small py-3">No activity logs recorded yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2.5">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-white fw-bold" style={{ fontSize: "0.9rem" }}>
                          🏃 {item.steps} Steps • 😴 {item.sleepHours}h Sleep
                        </span>
                        <span className="text-muted small">
                          {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="text-muted small">
                        💧 Water: {item.waterGlasses} glasses • Energy: {item.energyLevel}
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

export default SeniorHealthActivity;
