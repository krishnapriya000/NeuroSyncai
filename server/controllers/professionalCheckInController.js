const ProfessionalCheckIn = require("../models/ProfessionalCheckIn");
const User = require("../models/User");

// Utility to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

// Map Work Pressure string to numeric score 1-5
const mapWorkPressureToScore = (pressureStr) => {
  switch (pressureStr) {
    case "No Pressure":
      return 1;
    case "Low":
      return 2;
    case "Moderate":
      return 3;
    case "High":
      return 4;
    case "Very High":
      return 5;
    default:
      return 3;
  }
};

// @desc    Get today's Working Professional Check-in
// @route   GET /api/professional/checkin/today
// @access  Private (Working Professional)
exports.getTodayCheckIn = async (req, res) => {
  try {
    const todayStr = getTodayDateString();

    const checkIn = await ProfessionalCheckIn.findOne({
      userId: req.user._id,
      date: todayStr,
    });

    return res.status(200).json({
      success: true,
      hasSubmitted: !!checkIn,
      data: checkIn || null,
    });
  } catch (error) {
    console.error("Get Today Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's check-in: " + error.message,
    });
  }
};

// @desc    Create or update today's Working Professional Check-in
// @route   POST /api/professional/checkin
// @access  Private (Working Professional)
exports.createOrUpdateCheckIn = async (req, res) => {
  try {
    const {
      date,
      mood,
      stressLevel,
      energyLevel,
      sleepHours,
      focusLevel,
      workingHours,
      breaksTaken,
      workLifeBalance,
      workPressure,
      journal,
    } = req.body;

    const targetDate = date || getTodayDateString();

    // Validation
    if (
      !mood ||
      !stressLevel ||
      !energyLevel ||
      !sleepHours ||
      !focusLevel ||
      workingHours === undefined ||
      !breaksTaken ||
      !workLifeBalance ||
      !workPressure
    ) {
      return res.status(400).json({
        success: false,
        message: "Please answer all required check-in questions.",
      });
    }

    const pressureScore = mapWorkPressureToScore(workPressure);

    const checkInFields = {
      userId: req.user._id,
      date: targetDate,
      mood,
      stressLevel: Number(stressLevel),
      energyLevel: Number(energyLevel),
      sleepHours,
      focusLevel: Number(focusLevel),
      workingHours: Number(workingHours),
      breaksTaken,
      workLifeBalance: Number(workLifeBalance),
      workPressure,
      workPressureScore: pressureScore,
      journal: journal ? journal.trim() : "",
    };

    const checkIn = await ProfessionalCheckIn.findOneAndUpdate(
      { userId: req.user._id, date: targetDate },
      checkInFields,
      { upsert: true, new: true, runValidators: true }
    );

    // Update last check-in date on User model
    await User.findByIdAndUpdate(req.user._id, {
      lastCheckInDate: targetDate,
    });

    return res.status(200).json({
      success: true,
      message: "Check-in recorded successfully!",
      data: checkIn,
    });
  } catch (error) {
    console.error("Create Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit check-in: " + error.message,
    });
  }
};

// @desc    Update an existing check-in entry by ID
// @route   PUT /api/professional/checkin/:id
// @access  Private (Working Professional)
exports.updateCheckInById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      mood,
      stressLevel,
      energyLevel,
      sleepHours,
      focusLevel,
      workingHours,
      breaksTaken,
      workLifeBalance,
      workPressure,
      journal,
    } = req.body;

    const checkIn = await ProfessionalCheckIn.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: "Check-in record not found.",
      });
    }

    if (mood) checkIn.mood = mood;
    if (stressLevel) checkIn.stressLevel = Number(stressLevel);
    if (energyLevel) checkIn.energyLevel = Number(energyLevel);
    if (sleepHours) checkIn.sleepHours = sleepHours;
    if (focusLevel) checkIn.focusLevel = Number(focusLevel);
    if (workingHours !== undefined) checkIn.workingHours = Number(workingHours);
    if (breaksTaken) checkIn.breaksTaken = breaksTaken;
    if (workLifeBalance) checkIn.workLifeBalance = Number(workLifeBalance);
    if (workPressure) {
      checkIn.workPressure = workPressure;
      checkIn.workPressureScore = mapWorkPressureToScore(workPressure);
    }
    if (journal !== undefined) checkIn.journal = journal.trim();

    await checkIn.save();

    return res.status(200).json({
      success: true,
      message: "Check-in updated successfully!",
      data: checkIn,
    });
  } catch (error) {
    console.error("Update Check-in By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update check-in: " + error.message,
    });
  }
};

// @desc    Get check-in history for authenticated Working Professional
// @route   GET /api/professional/checkin/history
// @access  Private (Working Professional)
exports.getCheckInHistory = async (req, res) => {
  try {
    const history = await ProfessionalCheckIn.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get Check-in History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-in history: " + error.message,
    });
  }
};
