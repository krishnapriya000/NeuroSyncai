const User = require("../models/User");
const MoodTracker = require("../models/MoodTracker");
const DailyCheckIn = require("../models/DailyCheckIn");
const Journal = require("../models/Journal");
const EmergencyContact = require("../models/EmergencyContact");
const EmergencyAlert = require("../models/EmergencyAlert");
const { sendEmergencyAlertEmail } = require("../config/mailer");

/**
 * Multi-Factor Risk Assessment Engine
 * Evaluates student wellbeing data across MoodTracker, DailyCheckIn, and Journal modules.
 * Determines risk level: LOW_RISK, MODERATE_RISK, or HIGH_RISK.
 * Automatically sends a guardian alert email for HIGH_RISK situations if enabled and not cooldowned.
 * 
 * @param {string|ObjectId} userId - Authenticated Student User ID
 * @returns {Promise<{ success: boolean, riskLevel: string, alertSent: boolean, message: string }>}
 */
const evaluateAndProcessStudentRisk = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, riskLevel: "LOW_RISK", alertSent: false, message: "User record not found." };
    }

    const studentName = user.fullName || "Student";
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Fetch recent MoodTracker entries (past 7 days)
    const recentMoods = await MoodTracker.find({
      studentId: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });

    // 2. Fetch recent DailyCheckIn entries (past 7 days)
    const recentCheckIns = await DailyCheckIn.find({
      studentId: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });

    // 3. Fetch recent Journal entries (past 7 days)
    const recentJournals = await Journal.find({
      userId: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });

    // Evaluate Risk Indicators
    let riskPoints = 0;
    const triggerReasons = [];

    // Indicator A: High-intensity negative mood pattern (intensity >= 8 for Sad, Angry, Stressed, Anxious)
    const highIntensityNegativeMoods = recentMoods.filter(
      (m) =>
        m.intensity >= 8 &&
        ["Sad", "Angry", "Stressed", "Anxious"].includes(m.mood)
    );

    if (highIntensityNegativeMoods.length >= 2) {
      riskPoints += 3;
      triggerReasons.push(`Repeated high-intensity negative mood logs (${highIntensityNegativeMoods.length} entries)`);
    } else if (highIntensityNegativeMoods.length === 1) {
      riskPoints += 1;
    }

    // Indicator B: High stress and low motivation in Daily Check-ins
    const severeCheckIns = recentCheckIns.filter(
      (c) =>
        (c.stressLevel >= 8 || c.motivationLevel <= 2) ||
        (c.energyLevel && ["Exhausted", "Very Low"].includes(c.energyLevel))
    );

    if (severeCheckIns.length >= 2) {
      riskPoints += 3;
      triggerReasons.push(`Consecutive high-stress daily check-in responses (${severeCheckIns.length} entries)`);
    } else if (severeCheckIns.length === 1) {
      riskPoints += 1;
    }

    // Indicator C: High-distress keywords in recent journal entries
    const distressKeywords = ["hopeless", "can't go on", "cant go on", "overwhelmed", "giving up", "deep distress", "extreme anxiety", "nobody cares"];
    let journalDistressCount = 0;

    recentJournals.forEach((j) => {
      const text = `${j.title} ${j.content}`.toLowerCase();
      if (distressKeywords.some((keyword) => text.includes(keyword))) {
        journalDistressCount++;
      }
    });

    if (journalDistressCount >= 2) {
      riskPoints += 3;
      triggerReasons.push(`Repeated distress patterns identified in student reflections (${journalDistressCount} entries)`);
    } else if (journalDistressCount === 1) {
      riskPoints += 1;
    }

    // Classify Risk Level
    let riskLevel = "LOW_RISK";
    if (riskPoints >= 4) {
      riskLevel = "HIGH_RISK";
    } else if (riskPoints >= 2) {
      riskLevel = "MODERATE_RISK";
    }

    // If NOT HIGH_RISK, no guardian email is sent
    if (riskLevel !== "HIGH_RISK") {
      const studentMessage =
        riskLevel === "MODERATE_RISK"
          ? "Your recent responses suggest that you may be going through a difficult period. Consider taking a break, talking to someone you trust, or using the NeuroSync AI Companion."
          : "Your wellbeing responses have been logged.";

      return {
        success: true,
        riskLevel,
        alertSent: false,
        message: studentMessage,
      };
    }

    // HIGH_RISK processing: Check Emergency Contact & Safeguards
    const contact = await EmergencyContact.findOne({ userId });

    if (!contact) {
      // Log risk evaluation event without email
      await EmergencyAlert.create({
        userId,
        guardianEmail: "NO_CONTACT_CONFIGURED",
        riskLevel: "HIGH_RISK",
        triggerReason: triggerReasons.join("; ") || "High-risk wellbeing indicators detected",
        status: "FAILED",
      }).catch(() => {});

      return {
        success: true,
        riskLevel: "HIGH_RISK",
        alertSent: false,
        message: "Your recent responses indicate a high-risk wellbeing state. No guardian contact is currently registered.",
      };
    }

    if (!contact.emergencyAlertsEnabled) {
      await EmergencyAlert.create({
        userId,
        guardianEmail: contact.guardianEmail,
        riskLevel: "HIGH_RISK",
        triggerReason: triggerReasons.join("; ") || "High-risk wellbeing indicators detected",
        status: "ALERTS_DISABLED",
      }).catch(() => {});

      return {
        success: true,
        riskLevel: "HIGH_RISK",
        alertSent: false,
        message: "Your recent responses indicate a high-risk wellbeing state. Emergency alerts are currently turned OFF in your profile.",
      };
    }

    // Safeguard: 24-hour Cooldown Deduplication
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingRecentAlert = await EmergencyAlert.findOne({
      userId,
      riskLevel: "HIGH_RISK",
      status: "SENT",
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (existingRecentAlert) {
      console.log(`[RISK ASSESSMENT] 24-hour cooldown active for user ${userId}. Skipping duplicate email.`);
      await EmergencyAlert.create({
        userId,
        guardianEmail: contact.guardianEmail,
        riskLevel: "HIGH_RISK",
        triggerReason: (triggerReasons.join("; ") || "High-risk wellbeing indicators detected") + " (Cooldown active)",
        status: "COOLDOWN_SKIPPED",
      }).catch(() => {});

      return {
        success: true,
        riskLevel: "HIGH_RISK",
        alertSent: false,
        cooldownActive: true,
        message: "Your recent wellbeing responses indicate that you may need additional support. Your registered emergency contact was notified recently.",
      };
    }

    // Trigger Email to Guardian
    const triggerReasonStr = triggerReasons.join("; ") || "Concerning wellbeing pattern detected across recent check-ins";
    let alertSent = false;
    let alertStatus = "SENT";

    try {
      await sendEmergencyAlertEmail(
        contact.guardianEmail,
        contact.guardianName,
        studentName
      );
      alertSent = true;
    } catch (emailErr) {
      console.error("[RISK ASSESSMENT] Failed to send guardian alert email:", emailErr);
      alertStatus = "FAILED";
    }

    // Save alert history log in MongoDB Atlas
    await EmergencyAlert.create({
      userId,
      guardianEmail: contact.guardianEmail,
      riskLevel: "HIGH_RISK",
      triggerReason: triggerReasonStr,
      status: alertStatus,
      sentAt: alertSent ? new Date() : null,
    });

    return {
      success: true,
      riskLevel: "HIGH_RISK",
      alertSent,
      message: alertSent
        ? "Your recent wellbeing responses indicate that you may need additional support. Your registered emergency contact has been notified."
        : "Your recent wellbeing responses indicate a high-risk state, but sending the alert email encountered an error.",
    };
  } catch (error) {
    console.error("[RISK ASSESSMENT ERROR]:", error);
    return {
      success: false,
      riskLevel: "LOW_RISK",
      alertSent: false,
      message: "Server error during risk evaluation.",
      error: error.message,
    };
  }
};

module.exports = {
  evaluateAndProcessStudentRisk,
};
