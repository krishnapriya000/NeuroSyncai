const User = require("../models/User");
const ProfessionalProfile = require("../models/ProfessionalProfile");
const EmergencyContact = require("../models/EmergencyContact");

// @desc    Get Working Professional Profile
// @route   GET /api/professional/profile
// @access  Private (Working Professional)
exports.getProfessionalProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    let profile = await ProfessionalProfile.findOne({ userId: req.user._id });

    // Also check EmergencyContact table if emergency info isn't set yet
    let emergencyInfo = {};
    if (!profile || !profile.contactName) {
      const emContact = await EmergencyContact.findOne({ userId: req.user._id });
      if (emContact) {
        emergencyInfo = {
          contactName: emContact.guardianName || "",
          relationship: emContact.relationship || "",
          emergencyPhone: emContact.guardianPhone || "",
          emergencyEmail: emContact.guardianEmail || "",
        };
      }
    }

    const responseData = {
      fullName: user.fullName || "",
      email: user.email || "",
      phone: profile?.phone || user.phone || "",
      dob: profile?.dob || user.dob || "",
      profileImage: profile?.profileImage || user.profileImage || "",
      
      jobTitle: profile?.jobTitle || user.occupation || "",
      company: profile?.company || "",
      industry: profile?.industry || "",
      workType: profile?.workType || "Office",
      yearsOfExperience: profile?.yearsOfExperience ?? 0,
      workingHours: profile?.workingHours || "9:00 AM - 5:00 PM",
      workingDays: profile?.workingDays || "Monday - Friday",

      avgSleepHours: profile?.avgSleepHours ?? 7.5,
      dailyFocusGoal: profile?.dailyFocusGoal || "5 Hours",
      preferredBreakDuration: profile?.preferredBreakDuration || "15 Minutes",
      wellnessGoal: profile?.wellnessGoal || "Maintain Work-Life Balance",

      contactName: profile?.contactName || emergencyInfo.contactName || "",
      relationship: profile?.relationship || emergencyInfo.relationship || "",
      emergencyPhone: profile?.emergencyPhone || emergencyInfo.emergencyPhone || "",
      emergencyEmail: profile?.emergencyEmail || emergencyInfo.emergencyEmail || "",
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get Professional Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load professional profile: " + error.message,
    });
  }
};

// @desc    Update Working Professional Profile
// @route   PUT /api/professional/profile
// @access  Private (Working Professional)
exports.updateProfessionalProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      dob,
      profileImage,
      jobTitle,
      company,
      industry,
      workType,
      yearsOfExperience,
      workingHours,
      workingDays,
      avgSleepHours,
      dailyFocusGoal,
      preferredBreakDuration,
      wellnessGoal,
      contactName,
      relationship,
      emergencyPhone,
      emergencyEmail,
    } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: "Full Name is required." });
    }

    if (!jobTitle || !jobTitle.trim()) {
      return res.status(400).json({ success: false, message: "Job Title / Profession is required." });
    }

    if (!workType || !["Office", "Remote", "Hybrid"].includes(workType)) {
      return res.status(400).json({ success: false, message: "Work Type must be Office, Remote, or Hybrid." });
    }

    const numericExp = Number(yearsOfExperience);
    if (isNaN(numericExp) || numericExp < 0) {
      return res.status(400).json({ success: false, message: "Years of Experience must be a valid non-negative number." });
    }

    const numericSleep = Number(avgSleepHours);
    if (isNaN(numericSleep) || numericSleep < 1 || numericSleep > 24) {
      return res.status(400).json({ success: false, message: "Average Sleep Hours must be a valid number between 1 and 24." });
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ success: false, message: "Please enter a valid phone number format." });
      }
    }

    if (emergencyEmail && emergencyEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emergencyEmail.trim())) {
        return res.status(400).json({ success: false, message: "Please enter a valid emergency contact email address." });
      }
    }

    // 1. Update Core User Model
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : "",
        dob: dob ? dob.trim() : "",
        profileImage: profileImage ? profileImage.trim() : "",
        occupation: jobTitle.trim(),
      },
      { new: true }
    ).select("-password");

    // 2. Upsert ProfessionalProfile Model
    const profileFields = {
      userId: req.user._id,
      phone: phone ? phone.trim() : "",
      dob: dob ? dob.trim() : "",
      profileImage: profileImage ? profileImage.trim() : "",
      jobTitle: jobTitle.trim(),
      company: company ? company.trim() : "",
      industry: industry ? industry.trim() : "",
      workType,
      yearsOfExperience: numericExp,
      workingHours: workingHours ? workingHours.trim() : "9:00 AM - 5:00 PM",
      workingDays: workingDays ? workingDays.trim() : "Monday - Friday",
      avgSleepHours: numericSleep,
      dailyFocusGoal: dailyFocusGoal ? dailyFocusGoal.trim() : "5 Hours",
      preferredBreakDuration: preferredBreakDuration ? preferredBreakDuration.trim() : "15 Minutes",
      wellnessGoal: wellnessGoal || "Maintain Work-Life Balance",
      contactName: contactName ? contactName.trim() : "",
      relationship: relationship ? relationship.trim() : "",
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : "",
      emergencyEmail: emergencyEmail ? emergencyEmail.trim() : "",
    };

    const updatedProfile = await ProfessionalProfile.findOneAndUpdate(
      { userId: req.user._id },
      profileFields,
      { upsert: true, new: true, runValidators: true }
    );

    // 3. Keep EmergencyContact model synced if contact info provided
    if (contactName && contactName.trim()) {
      await EmergencyContact.findOneAndUpdate(
        { userId: req.user._id },
        {
          userId: req.user._id,
          guardianName: contactName.trim(),
          relationship: relationship ? relationship.trim() : "Support Contact",
          guardianEmail: emergencyEmail ? emergencyEmail.trim() : req.user.email,
          guardianPhone: emergencyPhone ? emergencyPhone.trim() : "",
        },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        ...updatedProfile.toObject(),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Update Professional Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile: " + error.message,
    });
  }
};
