const EmergencyContact = require("../models/EmergencyContact");
const EmergencyAlert = require("../models/EmergencyAlert");
const { evaluateAndProcessStudentRisk } = require("../services/riskAssessmentService");

// @desc    Get currently logged-in student's emergency guardian contact
// @route   GET /api/student/emergency/contact
// @access  Private (Student)
exports.getEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({ userId: req.user._id });

    return res.status(200).json({
      success: true,
      hasContact: !!contact,
      contact: contact || null,
    });
  } catch (error) {
    console.error("Get Emergency Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching emergency contact.",
      error: error.message,
    });
  }
};

// @desc    Create or Update emergency guardian contact
// @route   POST /api/student/emergency/contact
// @access  Private (Student)
exports.saveEmergencyContact = async (req, res) => {
  try {
    const { guardianName, relationship, guardianEmail, guardianPhone, emergencyAlertsEnabled } = req.body;

    // Validation
    if (!guardianName || !guardianName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guardian name is required.",
      });
    }

    if (!relationship || !relationship.trim()) {
      return res.status(400).json({
        success: false,
        message: "Relationship is required.",
      });
    }

    if (!guardianEmail || !guardianEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guardian email is required.",
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid guardian email address.",
      });
    }

    const alertsEnabledBool = typeof emergencyAlertsEnabled === "boolean" ? emergencyAlertsEnabled : true;

    // Upsert (create or update) contact for logged-in user
    const updatedContact = await EmergencyContact.findOneAndUpdate(
      { userId: req.user._id },
      {
        guardianName: guardianName.trim(),
        relationship: relationship.trim(),
        guardianEmail: guardianEmail.trim().toLowerCase(),
        guardianPhone: guardianPhone ? guardianPhone.trim() : "",
        emergencyAlertsEnabled: alertsEnabledBool,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Emergency guardian contact saved successfully.",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Save Emergency Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving emergency contact.",
      error: error.message,
    });
  }
};

// @desc    Delete emergency guardian contact
// @route   DELETE /api/student/emergency/contact
// @access  Private (Student)
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const deleted = await EmergencyContact.findOneAndDelete({ userId: req.user._id });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "No emergency contact found to delete.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Emergency guardian contact deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Emergency Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting emergency contact.",
      error: error.message,
    });
  }
};

// @desc    Get emergency alert history for logged-in student
// @route   GET /api/student/emergency/alerts
// @access  Private (Student)
exports.getAlertHistory = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Get Alert History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching alert history.",
      error: error.message,
    });
  }
};

// @desc    Manually trigger/evaluate student risk assessment
// @route   POST /api/student/emergency/evaluate
// @access  Private (Student)
exports.evaluateStudentRiskStatus = async (req, res) => {
  try {
    const result = await evaluateAndProcessStudentRisk(req.user._id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Evaluate Student Risk Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during risk evaluation.",
      error: error.message,
    });
  }
};
