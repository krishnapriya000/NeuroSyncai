import React, { useState, useEffect, useRef } from "react";
import { FiClock, FiCheck, FiX, FiBell, FiAlertCircle } from "react-icons/fi";

// Parse time string e.g. "08:00 AM", "14:30", "8:30 PM", "9:00am"
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const clean = timeStr.trim().toLowerCase();
  
  let isPM = clean.includes("pm");
  let isAM = clean.includes("am");
  let numPart = clean.replace(/am|pm/g, "").trim();
  
  const parts = numPart.split(":");
  if (parts.length < 2) return null;
  
  let hours = parseInt(parts[0], 10);
  let minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

const getTodayDateStr = () => {
  return new Date().toISOString().split("T")[0];
};

function SeniorMedicationReminderManager() {
  const [activeReminder, setActiveReminder] = useState(null); // { med, triggeredAt }
  const [permissionState, setPermissionState] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied"
  );
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  const activeReminderRef = useRef(null);
  activeReminderRef.current = activeReminder;

  // Track checked / snoozed / logged state
  const snoozedRef = useRef({}); // { [medId]: expireTimestamp }

  useEffect(() => {
    // Check user role
    const userStr = localStorage.getItem("neurosync_current_user");
    if (!userStr) return;
    try {
      const u = JSON.parse(userStr);
      const role = (u.role || "").trim().toLowerCase();
      if (!role.includes("senior")) return; // Only run for Senior Citizen
    } catch (e) {
      return;
    }

    // Check if permission banner should be shown
    if ("Notification" in window && Notification.permission === "default") {
      const dismissed = localStorage.getItem("neurosync_notif_banner_dismissed");
      if (!dismissed) {
        setShowPermissionBanner(true);
      }
    }

    // Initial check and start background interval
    checkMedications();
    const interval = setInterval(checkMedications, 20000); // Check every 20 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const checkMedications = async () => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/senior/medications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success || !Array.isArray(json.data)) return;

      const medications = json.data.filter((m) => m.status === "active");
      const todayStr = getTodayDateStr();

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Read local storage triggered reminders for today to prevent duplicates
      const triggeredKey = `neurosync_triggered_meds_${todayStr}`;
      let triggeredMap = {};
      try {
        triggeredMap = JSON.parse(localStorage.getItem(triggeredKey) || "{}");
      } catch (e) {}

      for (const med of medications) {
        // Check if already taken today
        const todayLog = (med.logs || []).find((l) => l.date === todayStr);
        if (todayLog && todayLog.status === "taken") {
          continue;
        }

        const scheduledMin = parseTimeToMinutes(med.time);
        if (scheduledMin === null) continue;

        const itemKey = `${med._id}_${med.time}`;

        // Check if snoozed
        const snoozeExpire = snoozedRef.current[med._id];
        const isSnoozeExpired = snoozeExpire && Date.now() >= snoozeExpire;

        // Check if time is matched (within 15 minutes of scheduled time or snooze expired)
        const isTimeDue = (currentMinutes >= scheduledMin && currentMinutes <= scheduledMin + 60) || isSnoozeExpired;
        const alreadyTriggeredToday = triggeredMap[itemKey];

        if (isTimeDue && (!alreadyTriggeredToday || isSnoozeExpired)) {
          // Trigger reminder!
          if (isSnoozeExpired) {
            delete snoozedRef.current[med._id];
          }

          // Mark triggered in localStorage
          triggeredMap[itemKey] = true;
          localStorage.setItem(triggeredKey, JSON.stringify(triggeredMap));

          // Trigger persistent DB notification
          triggerDBNotification(token, med);

          // Trigger Browser Notification if available
          triggerBrowserNotification(med);

          // Show In-App Banner/Modal Alert
          setActiveReminder(med);

          // Discontinue checking other meds in this cycle to avoid multiple popups at once
          break;
        }
      }
    } catch (err) {
      console.error("Senior Medication Check Error:", err);
    }
  };

  const triggerDBNotification = async (token, med) => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications/medication-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicationId: med._id,
          medicineName: med.medicineName,
          dosage: med.dosage,
          time: med.time,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // Dispatch sidebar badge update event
        window.dispatchEvent(new Event("neurosync_unread_notifications_updated"));
      }
    } catch (err) {
      console.error("Error creating DB medication notification:", err);
    }
  };

  const triggerBrowserNotification = (med) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notif = new Notification("💊 Medication Reminder", {
          body: `It's time to take your ${med.medicineName} (${med.dosage || "1 Tablet"}).`,
          icon: "/favicon.ico",
          tag: `med_${med._id}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          window.location.href = "/senior/medications";
        };
      } catch (err) {
        console.error("Browser notification error:", err);
      }
    }
  };

  const handleRequestPermission = async () => {
    if ("Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        setShowPermissionBanner(false);
      } catch (e) {
        console.error("Error requesting notification permission:", e);
      }
    }
  };

  const handleMarkAsTaken = async () => {
    if (!activeReminder) return;
    const token = localStorage.getItem("neurosync_token");
    const medId = activeReminder._id;

    try {
      const res = await fetch(`http://localhost:5000/api/senior/medications/${medId}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "taken" }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Clear snooze
        delete snoozedRef.current[medId];

        // Close banner
        setActiveReminder(null);

        // Dispatch status changed event for SeniorMedications page
        window.dispatchEvent(new Event("neurosync_medication_status_changed"));
      } else {
        alert(json.message || "Failed to mark medication as taken.");
      }
    } catch (err) {
      console.error("Error marking medication as taken:", err);
    }
  };

  const handleSnooze = (minutes = 5) => {
    if (!activeReminder) return;
    const medId = activeReminder._id;

    // Set snooze expiration
    snoozedRef.current[medId] = Date.now() + minutes * 60 * 1000;

    // Close current popup
    setActiveReminder(null);
  };

  const handleDismiss = () => {
    setActiveReminder(null);
  };

  return (
    <>
      {/* BROWSER NOTIFICATION PERMISSION PROMPT BANNER */}
      {showPermissionBanner && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x p-3 shadow-lg rounded-bottom-4 text-white d-flex align-items-center justify-content-between gap-3"
          style={{
            zIndex: 1085,
            maxWidth: "600px",
            width: "90%",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div className="d-flex align-items-center gap-2.5" style={{ fontSize: "0.92rem" }}>
            <span className="fs-4">🔔</span>
            <div>
              <strong className="text-white">Enable Browser Reminders?</strong>
              <div className="text-white-50 extra-small">Get instant medication notifications even when working in other tabs.</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-white rounded-pill px-3"
              onClick={() => {
                setShowPermissionBanner(false);
                localStorage.setItem("neurosync_notif_banner_dismissed", "true");
              }}
              style={{ fontSize: "0.82rem" }}
            >
              Later
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm"
              onClick={handleRequestPermission}
              style={{ fontSize: "0.82rem" }}
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE MEDICATION REMINDER IN-APP TOAST ALERT */}
      {activeReminder && (
        <div
          className="position-fixed bottom-4 end-4 p-4 rounded-4 text-white shadow-lg border border-warning border-opacity-40 animate-bounce-in"
          style={{
            zIndex: 1090,
            maxWidth: "440px",
            width: "calc(100% - 32px)",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-warning bg-opacity-25 text-warning d-flex align-items-center justify-content-center p-3 fs-3"
                style={{ width: "54px", height: "54px" }}
              >
                💊
              </div>
              <div>
                <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-30 rounded-pill px-2.5 py-0.5 mb-1" style={{ fontSize: "0.75rem" }}>
                  ⏰ Time for Medicine
                </span>
                <h5 className="fw-extrabold text-white fs-5 mb-0">{activeReminder.medicineName}</h5>
                <span className="text-muted small">
                  Dosage: <strong className="text-white">{activeReminder.dosage || "1 Tablet"}</strong> • Scheduled: {activeReminder.time}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleDismiss}
              aria-label="Close"
            />
          </div>

          <div
            className="p-3 rounded-3 mb-3 border border-secondary border-opacity-25 text-light"
            style={{ background: "rgba(15, 23, 42, 0.6)", fontSize: "0.92rem", lineHeight: "1.5" }}
          >
            "💊 <strong>Medication Reminder:</strong> It's time to take your {activeReminder.medicineName}."
          </div>

          {/* ACTIONS */}
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-success rounded-pill px-3.5 py-2.5 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 shadow"
              onClick={handleMarkAsTaken}
              style={{ fontSize: "0.95rem" }}
            >
              <FiCheck /> Mark as Taken
            </button>
            <button
              type="button"
              className="btn btn-outline-warning rounded-pill px-3 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-1"
              onClick={() => handleSnooze(5)}
              style={{ fontSize: "0.88rem" }}
              title="Postpone reminder by 5 minutes"
            >
              <FiClock /> Snooze 5m
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-3 py-2.5 text-white-50"
              onClick={handleDismiss}
              style={{ fontSize: "0.88rem" }}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SeniorMedicationReminderManager;
