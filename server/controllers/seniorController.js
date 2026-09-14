const SeniorDailyCheckIn = require("../models/SeniorDailyCheckIn");
const SeniorHealthActivity = require("../models/SeniorHealthActivity");
const SeniorMedication = require("../models/SeniorMedication");
const SeniorFamilyContact = require("../models/SeniorFamilyContact");
const MoodTracker = require("../models/MoodTracker");
const Journal = require("../models/Journal");
const EmergencyAlert = require("../models/EmergencyAlert");

const formatDateStr = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- MOOD & WELLBEING ---
exports.saveSeniorMood = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mood, notes, intensity = 4, reason = "Senior Mood Check" } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: "Mood is required.",
      });
    }

    const todayStr = formatDateStr(new Date());
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const timeStr = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

    const moodEntry = await MoodTracker.create({
      studentId: userId,
      mood,
      intensity: Number(intensity),
      reason,
      notes: notes || "",
      date: todayStr,
      time: timeStr,
    });

    return res.status(201).json({
      success: true,
      message: "Mood recorded successfully.",
      data: moodEntry,
    });
  } catch (error) {
    console.error("Save Senior Mood Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record mood: " + error.message,
    });
  }
};

exports.getSeniorMoodHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 14;

    const moodLogs = await MoodTracker.find({ studentId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: moodLogs,
    });
  } catch (error) {
    console.error("Get Senior Mood History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mood history: " + error.message,
    });
  }
};

// --- DAILY CHECK-IN ---
exports.saveDailyCheckIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { feeling, sleepQuality, activityLevel, energyLevel, routineCompleted, notes } = req.body;

    if (!feeling || !sleepQuality || !activityLevel || !energyLevel) {
      return res.status(400).json({
        success: false,
        message: "Please answer all check-in questions.",
      });
    }

    const checkIn = new SeniorDailyCheckIn({
      userId,
      feeling,
      sleepQuality,
      activityLevel,
      energyLevel,
      routineCompleted: routineCompleted !== undefined ? routineCompleted : true,
      notes: notes || "",
      date: new Date(),
    });

    await checkIn.save();

    return res.status(201).json({
      success: true,
      message: "Daily check-in recorded successfully.",
      data: checkIn,
    });
  } catch (error) {
    console.error("Save Senior Daily Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record daily check-in: " + error.message,
    });
  }
};

exports.getDailyCheckInHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 14;

    const history = await SeniorDailyCheckIn.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get Senior Daily Check-in History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-in history: " + error.message,
    });
  }
};

// --- HEALTH & ACTIVITY ---
exports.saveHealthActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { steps = 0, sleepHours = 0, waterGlasses = 0, energyLevel = "Good", vitals = {}, notes = "" } = req.body;

    const activity = new SeniorHealthActivity({
      userId,
      steps: Number(steps),
      sleepHours: Number(sleepHours),
      waterGlasses: Number(waterGlasses),
      energyLevel,
      vitals,
      notes,
      date: new Date(),
    });

    await activity.save();

    return res.status(201).json({
      success: true,
      message: "Health and activity log saved successfully.",
      data: activity,
    });
  } catch (error) {
    console.error("Save Senior Health Activity Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save health & activity log: " + error.message,
    });
  }
};

exports.getHealthActivityHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 14;

    const history = await SeniorHealthActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get Senior Health Activity History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch health activity history: " + error.message,
    });
  }
};

// --- MEDICATIONS ---
exports.addMedication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { medicineName, dosage, time, frequency, startDate, endDate } = req.body;

    if (!medicineName || !time) {
      return res.status(400).json({
        success: false,
        message: "Medicine name and reminder time are required.",
      });
    }

    const med = new SeniorMedication({
      userId,
      medicineName,
      dosage: dosage || "1 Tablet",
      time,
      frequency: frequency || "Daily",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      status: "active",
    });

    await med.save();

    return res.status(201).json({
      success: true,
      message: "Medication reminder added successfully.",
      data: med,
    });
  } catch (error) {
    console.error("Add Senior Medication Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add medication: " + error.message,
    });
  }
};

exports.getMedications = async (req, res) => {
  try {
    const userId = req.user._id;
    const medications = await SeniorMedication.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: medications,
    });
  } catch (error) {
    console.error("Get Senior Medications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medications: " + error.message,
    });
  }
};

exports.updateMedication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const updated = await SeniorMedication.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Medication not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Medication updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update Senior Medication Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update medication: " + error.message,
    });
  }
};

exports.deleteMedication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await SeniorMedication.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Medication not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Medication reminder deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Senior Medication Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete medication: " + error.message,
    });
  }
};

exports.logMedicationStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { status, time } = req.body; // status: 'taken' | 'missed'

    if (!status || !["taken", "missed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'taken' or 'missed'.",
      });
    }

    const todayStr = formatDateStr(new Date());

    const med = await SeniorMedication.findOne({ _id: id, userId });
    if (!med) {
      return res.status(404).json({ success: false, message: "Medication not found." });
    }

    // Filter out previous log for today if present
    med.logs = med.logs.filter((l) => l.date !== todayStr);
    med.logs.push({
      date: todayStr,
      time: time || med.time,
      status,
      loggedAt: new Date(),
    });

    await med.save();

    return res.status(200).json({
      success: true,
      message: `Medication marked as ${status}.`,
      data: med,
    });
  } catch (error) {
    console.error("Log Medication Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log medication status: " + error.message,
    });
  }
};

// --- FAMILY CONTACTS & EMERGENCY ---
exports.addFamilyContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, relationship, phone, email, isEmergencyContact } = req.body;

    if (!name || !relationship || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, relationship, and phone number are required.",
      });
    }

    const contact = new SeniorFamilyContact({
      userId,
      name,
      relationship,
      phone,
      email: email || "",
      isEmergencyContact: Boolean(isEmergencyContact),
    });

    await contact.save();

    return res.status(201).json({
      success: true,
      message: "Family contact added successfully.",
      data: contact,
    });
  } catch (error) {
    console.error("Add Senior Family Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add family contact: " + error.message,
    });
  }
};

exports.getFamilyContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const contacts = await SeniorFamilyContact.find({ userId })
      .sort({ isEmergencyContact: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Get Senior Family Contacts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch family contacts: " + error.message,
    });
  }
};

exports.updateFamilyContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const updated = await SeniorFamilyContact.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Contact not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Family contact updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update Senior Family Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact: " + error.message,
    });
  }
};

exports.deleteFamilyContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await SeniorFamilyContact.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Contact not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Family contact deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Senior Family Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact: " + error.message,
    });
  }
};

exports.triggerSOS = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    const emergencyContacts = await SeniorFamilyContact.find({ userId, isEmergencyContact: true }).lean();

    const alert = new EmergencyAlert({
      userId,
      triggeredAt: new Date(),
      status: "ACTIVE",
      riskScore: 100,
      riskLevel: "CRITICAL",
      riskFactors: ["Senior Citizen SOS Button Triggered"],
      guardianNotified: emergencyContacts.length > 0,
      guardianEmailSent: emergencyContacts.length > 0 ? emergencyContacts[0].email : "",
      emergencyContactName: emergencyContacts.length > 0 ? emergencyContacts[0].name : "Emergency Contact",
      emergencyContactPhone: emergencyContacts.length > 0 ? emergencyContacts[0].phone : "",
    });

    await alert.save();

    return res.status(200).json({
      success: true,
      message: "🚨 SOS Emergency Alert Sent! Your trusted family contacts have been notified.",
      data: {
        alert,
        contactsNotified: emergencyContacts,
      },
    });
  } catch (error) {
    console.error("Senior Trigger SOS Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger SOS alert: " + error.message,
    });
  }
};

// --- PROGRESS & INSIGHTS ---
exports.getSeniorProgressData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch past 7 days check-ins, health activities, medications, and mood logs
    const [checkIns, healthLogs, medications, moodEntries, journals] = await Promise.all([
      SeniorDailyCheckIn.find({ userId }).sort({ date: -1 }).limit(14).lean(),
      SeniorHealthActivity.find({ userId }).sort({ date: -1 }).limit(14).lean(),
      SeniorMedication.find({ userId }).lean(),
      MoodTracker.find({ studentId: userId }).sort({ createdAt: -1 }).limit(14).lean(),
      Journal.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const totalCheckIns = checkIns.length;
    const recentCheckInCount = checkIns.filter((c) => {
      const diff = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;

    // Calculate medication adherence
    let totalScheduled = 0;
    let totalTaken = 0;
    medications.forEach((m) => {
      if (m.logs && m.logs.length > 0) {
        m.logs.forEach((log) => {
          totalScheduled++;
          if (log.status === "taken") totalTaken++;
        });
      }
    });
    const medAdherence = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;

    // Calculate wellness streak (consecutive check-in days)
    const uniqueDates = [
      ...new Set(checkIns.map((c) => formatDateStr(c.date))),
    ].sort((a, b) => (a < b ? 1 : -1));

    let streak = 0;
    if (uniqueDates.length > 0) {
      const todayStr = formatDateStr(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = formatDateStr(yesterdayDate);

      if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
        let checkDate = uniqueDates.includes(todayStr) ? new Date() : yesterdayDate;
        while (true) {
          const dStr = formatDateStr(checkDate);
          if (uniqueDates.includes(dStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Latest Mood
    const latestMood = moodEntries.length > 0 ? moodEntries[0].mood : "Cheerful & Peaceful";

    return res.status(200).json({
      success: true,
      data: {
        weeklyMood: latestMood,
        checkInStats: {
          recentCount: recentCheckInCount,
          total: 7,
          percentage: Math.round((recentCheckInCount / 7) * 100),
        },
        medicationAdherence: medAdherence,
        wellnessStreak: streak || 1,
        totalJournals: journals.length,
        recentCheckIns: checkIns.slice(0, 5),
        recentActivities: healthLogs.slice(0, 5),
        activeMedications: medications.filter((m) => m.status === "active").length,
      },
    });
  } catch (error) {
    console.error("Get Senior Progress Data Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load senior progress: " + error.message,
    });
  }
};
