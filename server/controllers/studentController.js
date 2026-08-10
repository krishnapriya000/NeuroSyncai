const User = require("../models/User");
const DailyCheckIn = require("../models/DailyCheckIn");
const { evaluateAndProcessStudentRisk } = require("../services/riskAssessmentService");

// Helper to get today's date in YYYY-MM-DD format (local server time)
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// @desc    Check if logged-in student completed today's check-in
// @route   GET /api/student/checkin-status
// @access  Private (Student)
exports.getCheckInStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const todayStr = getTodayDateString();
    const completedToday = user.lastCheckInDate === todayStr;

    return res.status(200).json({
      success: true,
      completedToday,
      lastCheckInDate: user.lastCheckInDate || "",
      todayDate: todayStr,
    });
  } catch (error) {
    console.error("Get Check-in Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-in status: " + error.message,
    });
  }
};

// @desc    Submit daily check-in survey
// @route   POST /api/student/checkin
// @access  Private (Student)
exports.submitCheckIn = async (req, res) => {
  try {
    const {
      feeling,
      sleepHours,
      stressLevel,
      motivationLevel,
      biggestChallenge,
      energyLevel,
      mainGoal,
      talkToAI,
    } = req.body;

    // Basic validation
    if (
      !feeling ||
      !sleepHours ||
      stressLevel === undefined ||
      motivationLevel === undefined ||
      !biggestChallenge ||
      !energyLevel ||
      !mainGoal ||
      !talkToAI
    ) {
      return res.status(400).json({
        success: false,
        message: "Please answer all survey questions before submitting.",
      });
    }

    const todayStr = getTodayDateString();
    const studentId = req.user._id;

    // Save or update response in DailyCheckIn collection
    await DailyCheckIn.findOneAndUpdate(
      { studentId, date: todayStr },
      {
        feeling,
        sleepHours,
        stressLevel: Number(stressLevel),
        motivationLevel: Number(motivationLevel),
        biggestChallenge,
        energyLevel,
        mainGoal,
        talkToAI,
      },
      { upsert: true, new: true }
    );

    // Update user's lastCheckInDate in User collection
    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      { lastCheckInDate: todayStr },
      { new: true }
    ).select("-password");

    // Trigger risk assessment evaluation
    const riskEval = await evaluateAndProcessStudentRisk(studentId).catch((err) => {
      console.error("Check-in Risk Evaluation Error:", err);
      return null;
    });

    return res.status(200).json({
      success: true,
      message: "Daily check-in submitted successfully!",
      lastCheckInDate: todayStr,
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        lastCheckInDate: updatedUser.lastCheckInDate,
      },
      wellbeingAssessment: riskEval
        ? {
            riskLevel: riskEval.riskLevel,
            alertSent: riskEval.alertSent,
            message: riskEval.message,
          }
        : null,
    });
  } catch (error) {
    console.error("Submit Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save check-in survey: " + error.message,
    });
  }
};

// @desc    Get latest daily check-in record for logged-in user
// @route   GET /api/dailycheckin/latest or GET /api/student/dailycheckin/latest
// @access  Private (Logged-in Student)
exports.getLatestCheckIn = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find the most recent check-in for this logged-in student
    const latestCheckIn = await DailyCheckIn.findOne({ studentId }).sort({ createdAt: -1 });

    if (!latestCheckIn) {
      return res.status(200).json({
        success: true,
        hasData: false,
        message: "No check-in found for today.",
        checkIn: null,
      });
    }

    return res.status(200).json({
      success: true,
      hasData: true,
      mood: latestCheckIn.feeling,
      sleepHours: latestCheckIn.sleepHours,
      energyLevel: latestCheckIn.energyLevel,
      goal: latestCheckIn.mainGoal,
      stressLevel: latestCheckIn.stressLevel,
      motivationLevel: latestCheckIn.motivationLevel,
      biggestChallenge: latestCheckIn.biggestChallenge,
      talkToAI: latestCheckIn.talkToAI,
      date: latestCheckIn.date,
      createdAt: latestCheckIn.createdAt,
      checkIn: latestCheckIn,
    });
  } catch (error) {
    console.error("Get Latest Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest check-in data: " + error.message,
    });
  }
};

// @desc    Get logged-in student's profile details from MongoDB
// @route   GET /api/student/profile
// @access  Private (Student)
exports.getStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        dob: user.dob || (user.dateOfBirth ? user.dateOfBirth.toISOString().split("T")[0] : "") || "",
        gender: user.gender || "Other",
        occupation: user.occupation || "",
        lifestyle: user.lifestyle || "",
        profileImage: user.profileImage || "",
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student profile from database: " + error.message,
    });
  }
};

// @desc    Update logged-in student's profile details in MongoDB
// @route   PUT /api/student/profile
// @access  Private (Student)
exports.updateStudentProfile = async (req, res) => {
  try {
    const { fullName, phone, dob, gender, occupation, lifestyle, profileImage } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: "Full Name is required." });
    }

    const updateFields = {
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : "",
      dob: dob ? dob.trim() : "",
      dateOfBirth: dob ? new Date(dob) : undefined,
      gender: gender || "Other",
      occupation: occupation ? occupation.trim() : "",
      lifestyle: lifestyle ? lifestyle.trim() : "",
      profileImage: profileImage ? profileImage.trim() : "",
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "🎉 Profile updated and saved to database successfully!",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        dob: updatedUser.dob || (updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().split("T")[0] : ""),
        gender: updatedUser.gender,
        occupation: updatedUser.occupation,
        lifestyle: updatedUser.lifestyle,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile in database: " + error.message,
    });
  }
};


