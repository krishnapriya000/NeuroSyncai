const User = require("../models/User");
const ParentChild = require("../models/ParentChild");
const ParentCheckIn = require("../models/ParentCheckIn");
const DailyCheckIn = require("../models/DailyCheckIn");
const MoodTracker = require("../models/MoodTracker");
const ChildFaceAnalysis = require("../models/ChildFaceAnalysis");

// Helper to get today's date string YYYY-MM-DD (local server time)
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to calculate age from Date of Birth string (YYYY-MM-DD) or Date
const calculateAge = (dobStringOrDate) => {
  if (!dobStringOrDate) return null;
  const birthDate = new Date(dobStringOrDate);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

// @desc    Get authenticated parent profile
// @route   GET /api/parent/profile
// @access  Private (Parent)
exports.getParentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Parent profile not found." });
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
    console.error("Get Parent Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parent profile: " + error.message,
    });
  }
};

// @desc    Update authenticated parent profile
// @route   PUT /api/parent/profile
// @access  Private (Parent)
exports.updateParentProfile = async (req, res) => {
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
      message: "🎉 Parent profile updated successfully!",
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
    console.error("Update Parent Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update parent profile: " + error.message,
    });
  }
};

// @desc    Get linked children & dependents for authenticated parent
// @route   GET /api/parent/children
// @access  Private (Parent)
exports.getLinkedChildren = async (req, res) => {
  try {
    const parentId = req.user._id;

    const links = await ParentChild.find({ parentId })
      .populate("childId", "fullName email phone profileImage dob dateOfBirth gender role occupation lastCheckInDate age")
      .sort({ createdAt: -1 });

    const childrenList = links.map((link) => {
      if (link.childId) {
        const c = link.childId;
        const dobStr = c.dob || (c.dateOfBirth ? c.dateOfBirth.toISOString().split("T")[0] : "");
        const ageVal = c.age || calculateAge(dobStr) || "N/A";

        return {
          id: link._id,
          relationshipId: link._id,
          childId: c._id,
          name: c.fullName,
          email: c.email,
          avatar: c.profileImage || "",
          dob: dobStr || "N/A",
          gender: c.gender || "Not specified",
          age: ageVal,
          grade: link.grade || c.occupation || "N/A",
          relationship: link.relationship,
          status: link.status,
          isDependentOnly: false,
          notes: link.notes || "",
          lastCheckInDate: c.lastCheckInDate || "",
          activeStatus: "Active",
          createdAt: link.createdAt,
        };
      } else {
        const dep = link.dependentInfo || {};
        const dobStr = dep.dob || (dep.dateOfBirth ? dep.dateOfBirth.toISOString().split("T")[0] : "");
        const ageVal = calculateAge(dobStr) || "N/A";

        return {
          id: link._id,
          relationshipId: link._id,
          childId: null,
          name: dep.fullName || "Dependent Child",
          email: "Dependent Profile (No Account)",
          avatar: "",
          dob: dobStr || "N/A",
          gender: dep.gender || "Not specified",
          age: ageVal,
          grade: link.grade || dep.grade || "N/A",
          relationship: link.relationship,
          status: link.status,
          isDependentOnly: true,
          notes: link.notes || "",
          activeStatus: "Active",
          createdAt: link.createdAt,
        };
      }
    });

    return res.status(200).json({
      success: true,
      count: childrenList.length,
      children: childrenList,
    });
  } catch (error) {
    console.error("Get Linked Children Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch linked children: " + error.message,
    });
  }
};

// @desc    Link existing student NeuroSync account via email
// @route   POST /api/parent/children/link
// @access  Private (Parent)
exports.linkChildAccount = async (req, res) => {
  try {
    const { childEmail, relationship } = req.body;

    if (!childEmail || !childEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(childEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const targetEmail = childEmail.trim().toLowerCase();

    // Prevent parent from linking their own account
    if (targetEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "You cannot link your own account.",
      });
    }

    // Check if target account exists
    const childUser = await User.findOne({ email: targetEmail });
    if (!childUser) {
      return res.status(404).json({
        success: false,
        message: "NeuroSync account not found.",
      });
    }

    // Role check: Only allow linking student/child accounts
    const disallowedRoles = ["Admin", "Parent"];
    if (disallowedRoles.includes(childUser.role)) {
      return res.status(400).json({
        success: false,
        message: `Cannot link an account with role "${childUser.role}". Only student/child accounts can be linked.`,
      });
    }

    // Check for existing relationship
    const existingLink = await ParentChild.findOne({
      parentId: req.user._id,
      childId: childUser._id,
    });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        message: "This child is already linked to your account.",
      });
    }

    // Create link
    const newLink = await ParentChild.create({
      parentId: req.user._id,
      childId: childUser._id,
      relationship: relationship || "Guardian",
      status: "accepted",
      grade: childUser.occupation || "",
    });

    // Update parentId reference on student user if not set
    if (!childUser.parentId) {
      childUser.parentId = req.user._id;
      await childUser.save();
    }

    return res.status(201).json({
      success: true,
      message: "Link request sent successfully.",
      link: {
        id: newLink._id,
        childId: childUser._id,
        name: childUser.fullName,
        email: childUser.email,
        status: newLink.status,
      },
    });
  } catch (error) {
    console.error("Link Child Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to link child account: " + error.message,
    });
  }
};

// @desc    Add dependent child without existing NeuroSync account
// @route   POST /api/parent/children/dependent
// @access  Private (Parent)
exports.addDependentChild = async (req, res) => {
  try {
    const { childName, dob, gender, grade, relationship } = req.body;

    if (!childName || !childName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Child Name is required.",
      });
    }

    const newLink = await ParentChild.create({
      parentId: req.user._id,
      isDependentOnly: true,
      dependentInfo: {
        fullName: childName.trim(),
        dob: dob ? dob.trim() : "",
        dateOfBirth: dob ? new Date(dob) : undefined,
        gender: gender || "Other",
        grade: grade ? grade.trim() : "",
      },
      relationship: relationship || "Guardian",
      status: "accepted",
      grade: grade ? grade.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Dependent profile created successfully!",
      link: newLink,
    });
  } catch (error) {
    console.error("Add Dependent Child Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add dependent child: " + error.message,
    });
  }
};

// @desc    Unlink a child from parent account
// @route   DELETE /api/parent/children/:id
// @access  Private (Parent)
exports.unlinkChild = async (req, res) => {
  try {
    const targetId = req.params.id;
    const parentId = req.user._id;

    // Find link by relationship _id or childId
    const link = await ParentChild.findOne({
      parentId,
      $or: [{ _id: targetId }, { childId: targetId }],
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Relationship record not found or you are not authorized to unlink this child.",
      });
    }

    await ParentChild.findByIdAndDelete(link._id);

    // If child user was linked, update childUser parentId if matching
    if (link.childId) {
      const childUser = await User.findById(link.childId);
      if (childUser && childUser.parentId && childUser.parentId.toString() === parentId.toString()) {
        childUser.parentId = null;
        await childUser.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Child account unlinked successfully.",
    });
  } catch (error) {
    console.error("Unlink Child Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unlink child: " + error.message,
    });
  }
};

// @desc    Get details for a specific linked child
// @route   GET /api/parent/children/:childId
// @access  Private (Parent)
exports.getChildDetails = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;

    const link = await ParentChild.findOne({
      parentId,
      $or: [{ _id: childId }, { childId: childId }],
    }).populate("childId", "fullName email phone profileImage dob dateOfBirth gender role occupation lastCheckInDate age");

    if (!link) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access details for this child.",
      });
    }

    let childData = {};
    if (link.childId) {
      const c = link.childId;
      const dobStr = c.dob || (c.dateOfBirth ? c.dateOfBirth.toISOString().split("T")[0] : "");
      childData = {
        relationshipId: link._id,
        childId: c._id,
        name: c.fullName,
        email: c.email,
        avatar: c.profileImage || "",
        dob: dobStr || "N/A",
        gender: c.gender || "Other",
        age: c.age || calculateAge(dobStr) || "N/A",
        grade: link.grade || c.occupation || "N/A",
        relationship: link.relationship,
        status: link.status,
        notes: link.notes || "",
        isDependentOnly: false,
      };
    } else {
      const dep = link.dependentInfo || {};
      const dobStr = dep.dob || (dep.dateOfBirth ? dep.dateOfBirth.toISOString().split("T")[0] : "");
      childData = {
        relationshipId: link._id,
        childId: null,
        name: dep.fullName,
        email: "Dependent Profile (No Account)",
        avatar: "",
        dob: dobStr || "N/A",
        gender: dep.gender || "Other",
        age: calculateAge(dobStr) || "N/A",
        grade: link.grade || dep.grade || "N/A",
        relationship: link.relationship,
        status: link.status,
        notes: link.notes || "",
        isDependentOnly: true,
      };
    }

    return res.status(200).json({
      success: true,
      child: childData,
    });
  } catch (error) {
    console.error("Get Child Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch child details: " + error.message,
    });
  }
};

// @desc    Update parent-managed child details (relationship, grade, notes)
// @route   PUT /api/parent/children/:id
// @access  Private (Parent)
exports.updateChildDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user._id;
    const { relationship, grade, notes } = req.body;

    const link = await ParentChild.findOne({
      parentId,
      $or: [{ _id: id }, { childId: id }],
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Child relationship not found or access denied.",
      });
    }

    if (relationship) link.relationship = relationship;
    if (grade !== undefined) {
      link.grade = grade.trim();
      if (link.isDependentOnly && link.dependentInfo) {
        link.dependentInfo.grade = grade.trim();
      }
    }
    if (notes !== undefined) link.notes = notes.trim();

    await link.save();

    return res.status(200).json({
      success: true,
      message: "Child details updated successfully!",
      link,
    });
  } catch (error) {
    console.error("Update Child Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update child details: " + error.message,
    });
  }
};

// @desc    Fetch mood tracker records for linked child (Architecture for Parent Mood Tracker)
// @route   GET /api/parent/children/:childId/moods
// @access  Private (Parent)
exports.getChildMoods = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;

    // Verify authenticated parent has active relationship with this child
    const link = await ParentChild.findOne({
      parentId,
      childId,
      status: "accepted",
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access mood records for this child.",
      });
    }

    // Fetch recent check-ins / mood records
    const checkIns = await DailyCheckIn.find({ studentId: childId }).sort({ createdAt: -1 }).limit(30);
    const moodTrackers = await MoodTracker.find({ userId: childId }).sort({ createdAt: -1 }).limit(30);

    return res.status(200).json({
      success: true,
      childId,
      checkIns,
      moodTrackers,
    });
  } catch (error) {
    console.error("Get Child Moods Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch child mood records: " + error.message,
    });
  }
};

// @desc    Get today's check-in status for all linked children
// @route   GET /api/parent/check-ins
// @access  Private (Parent)
exports.getParentCheckInStatus = async (req, res) => {
  try {
    const parentId = req.user._id;
    const todayStr = getTodayDateString();

    // Fetch linked children for this parent
    const links = await ParentChild.find({ parentId })
      .populate("childId", "fullName email phone profileImage dob dateOfBirth gender role occupation age")
      .sort({ createdAt: -1 });

    // Fetch today's check-in records for this parent
    const todayCheckIns = await ParentCheckIn.find({
      parentId,
      date: todayStr,
    });

    const checkInMap = {};
    todayCheckIns.forEach((ci) => {
      checkInMap[ci.parentChildId.toString()] = ci;
    });

    // Fetch latest face analysis for each linked child
    const parentChildIds = links.map((link) => link._id);
    const faceAnalysisRecords = await ChildFaceAnalysis.find({
      parentId,
      parentChildId: { $in: parentChildIds },
    }).sort({ analyzedAt: -1 });

    const latestFaceAnalysisMap = {};
    faceAnalysisRecords.forEach((record) => {
      const key = record.parentChildId.toString();
      if (!latestFaceAnalysisMap[key]) {
        latestFaceAnalysisMap[key] = record;
      }
    });

    let completedCount = 0;

    const childrenData = links.map((link) => {
      let childName = "";
      let email = "";
      let avatar = "";
      let dobStr = "";
      let ageVal = "N/A";
      let gender = "Other";
      let grade = link.grade || "N/A";

      if (link.childId) {
        const c = link.childId;
        childName = c.fullName;
        email = c.email;
        avatar = c.profileImage || "";
        dobStr = c.dob || (c.dateOfBirth ? c.dateOfBirth.toISOString().split("T")[0] : "");
        ageVal = c.age || calculateAge(dobStr) || "N/A";
        gender = c.gender || "Other";
        if (grade === "N/A" && c.occupation) grade = c.occupation;
      } else {
        const dep = link.dependentInfo || {};
        childName = dep.fullName || "Dependent Child";
        email = "Dependent Profile (No Account)";
        avatar = "";
        dobStr = dep.dob || (dep.dateOfBirth ? dep.dateOfBirth.toISOString().split("T")[0] : "");
        ageVal = calculateAge(dobStr) || "N/A";
        gender = dep.gender || "Other";
        if (grade === "N/A" && dep.grade) grade = dep.grade;
      }

      const existingCheckIn = checkInMap[link._id.toString()];
      const isCompleted = !!existingCheckIn;
      if (isCompleted) completedCount++;

      const latestAnalysis = latestFaceAnalysisMap[link._id.toString()] || null;

      return {
        parentChildId: link._id,
        childId: link.childId ? link.childId._id : null,
        name: childName,
        email,
        avatar,
        age: ageVal,
        dob: dobStr,
        gender,
        grade,
        relationship: link.relationship,
        status: isCompleted ? "completed" : "pending",
        checkInRecord: existingCheckIn || null,
        faceAnalysisRecord: latestAnalysis,
        faceAnalysisStatus: latestAnalysis ? "completed" : "pending",
        isDependentOnly: link.isDependentOnly,
      };
    });

    return res.status(200).json({
      success: true,
      todayDate: todayStr,
      totalChildren: childrenData.length,
      completedCount,
      children: childrenData,
    });
  } catch (error) {
    console.error("Get Parent Check-In Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parent check-in status: " + error.message,
    });
  }
};

// @desc    Get today's check-in record for a specific child
// @route   GET /api/parent/check-ins/:id/today
// @access  Private (Parent)
exports.getTodayCheckInForChild = async (req, res) => {
  try {
    const targetId = req.params.id;
    const parentId = req.user._id;
    const todayStr = getTodayDateString();

    const link = await ParentChild.findOne({
      parentId,
      $or: [{ _id: targetId }, { childId: targetId }],
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this child's information.",
      });
    }

    const checkIn = await ParentCheckIn.findOne({
      parentId,
      parentChildId: link._id,
      date: todayStr,
    });

    return res.status(200).json({
      success: true,
      completed: !!checkIn,
      checkIn: checkIn || null,
    });
  } catch (error) {
    console.error("Get Today Check-In For Child Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch child check-in: " + error.message,
    });
  }
};

// @desc    Submit today's parent check-in for a child
// @route   POST /api/parent/check-ins
// @access  Private (Parent)
exports.submitParentCheckIn = async (req, res) => {
  try {
    const parentId = req.user._id;
    const todayStr = getTodayDateString();
    const {
      parentChildId,
      mood,
      energy,
      socialInteraction,
      unusualBehavior,
      unusualBehaviorNote,
      wellbeingScore,
      additionalNotes,
    } = req.body;

    if (!parentChildId) {
      return res.status(400).json({
        success: false,
        message: "Child selection is required.",
      });
    }

    if (!mood || !energy || !socialInteraction || wellbeingScore === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please answer all required survey questions.",
      });
    }

    // Verify parent ownership over relationship link
    const link = await ParentChild.findOne({
      _id: parentChildId,
      parentId,
    }).populate("childId", "fullName");

    if (!link) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this child's information.",
      });
    }

    // Check for existing same-day check-in
    const existing = await ParentCheckIn.findOne({
      parentId,
      parentChildId: link._id,
      date: todayStr,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Today's check-in has already been completed.",
      });
    }

    let childName = "";
    if (link.childId && link.childId.fullName) {
      childName = link.childId.fullName;
    } else if (link.dependentInfo && link.dependentInfo.fullName) {
      childName = link.dependentInfo.fullName;
    } else {
      childName = "Child";
    }

    const newCheckIn = await ParentCheckIn.create({
      parentId,
      childId: link.childId ? link.childId._id : null,
      parentChildId: link._id,
      date: todayStr,
      childName,
      mood,
      energy,
      socialInteraction,
      unusualBehavior: !!unusualBehavior,
      unusualBehaviorNote: unusualBehavior ? (unusualBehaviorNote ? unusualBehaviorNote.trim() : "") : "",
      wellbeingScore: Number(wellbeingScore),
      additionalNotes: additionalNotes ? additionalNotes.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Check-in completed successfully.",
      checkIn: newCheckIn,
    });
  } catch (error) {
    console.error("Submit Parent Check-In Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit check-in: " + error.message,
    });
  }
};

// @desc    Save face analysis result for a child
// @route   POST /api/parent/children/:childId/face-analysis
// @access  Private (Parent)
exports.saveChildFaceAnalysis = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;
    const { expression, confidence } = req.body;

    if (!expression || confidence === undefined) {
      return res.status(400).json({
        success: false,
        message: "Expression and confidence are required.",
      });
    }

    // Find active child link for this parent
    const link = await ParentChild.findOne({
      parentId,
      $or: [{ _id: childId }, { childId: childId }],
    }).populate("childId", "fullName");

    if (!link) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform analysis for this child.",
      });
    }

    let childName = "";
    if (link.childId && link.childId.fullName) {
      childName = link.childId.fullName;
    } else if (link.dependentInfo && link.dependentInfo.fullName) {
      childName = link.dependentInfo.fullName;
    } else {
      childName = "Child";
    }

    // Format expression capitalized
    const formattedExpression =
      expression.charAt(0).toUpperCase() + expression.slice(1).toLowerCase();

    const newAnalysis = await ChildFaceAnalysis.create({
      parentId,
      parentChildId: link._id,
      childId: link.childId ? link.childId._id : null,
      childName,
      expression: formattedExpression,
      confidence: Math.round(Number(confidence)),
      analyzedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Face analysis saved successfully.",
      analysis: newAnalysis,
    });
  } catch (error) {
    console.error("Save Child Face Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save face analysis: " + error.message,
    });
  }
};

// @desc    Get latest face analysis result for a child
// @route   GET /api/parent/children/:childId/face-analysis/latest
// @access  Private (Parent)
exports.getLatestChildFaceAnalysis = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;

    const link = await ParentChild.findOne({
      parentId,
      $or: [{ _id: childId }, { childId: childId }],
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view analysis for this child.",
      });
    }

    const latestAnalysis = await ChildFaceAnalysis.findOne({
      parentId,
      parentChildId: link._id,
    }).sort({ analyzedAt: -1 });

    return res.status(200).json({
      success: true,
      analysis: latestAnalysis || null,
    });
  } catch (error) {
    console.error("Get Latest Child Face Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch face analysis: " + error.message,
    });
  }
};

// @desc    Get dynamic parent insights and analytics
// @route   GET /api/parent/insights
// @access  Private (Parent)
exports.getParentInsights = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { childId: selectedChildParam, range } = req.query;

    const rangeDays = range === "today" ? 1 : range === "30days" ? 30 : 7; // Default 7 days

    // Compute date ranges
    const now = new Date();
    const todayStr = getTodayDateString();

    const datesList = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      datesList.push(`${year}-${month}-${day}`);
    }

    const startDateStr = datesList[0];

    // Previous period dates for comparison
    const prevDatesList = [];
    for (let i = (rangeDays * 2) - 1; i >= rangeDays; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      prevDatesList.push(`${year}-${month}-${day}`);
    }
    const prevStartDateStr = prevDatesList[0];

    // Fetch active child links for this parent
    const links = await ParentChild.find({ parentId })
      .populate("childId", "fullName email profileImage dob dateOfBirth gender role occupation age")
      .sort({ createdAt: -1 });

    const childrenList = links.map((link) => {
      let name = "";
      if (link.childId) {
        name = link.childId.fullName;
      } else if (link.dependentInfo) {
        name = link.dependentInfo.fullName || "Dependent Child";
      } else {
        name = "Child";
      }
      return {
        id: link._id.toString(),
        relationshipId: link._id.toString(),
        childId: link.childId ? link.childId._id.toString() : null,
        name,
        isDependentOnly: link.isDependentOnly,
      };
    });

    // Filter target links based on selectedChildParam
    let filteredLinks = links;
    if (selectedChildParam && selectedChildParam !== "all") {
      filteredLinks = links.filter(
        (l) =>
          l._id.toString() === selectedChildParam ||
          (l.childId && l.childId._id.toString() === selectedChildParam)
      );
    }

    const targetParentChildIds = filteredLinks.map((l) => l._id);
    const targetStudentIds = filteredLinks.map((l) => (l.childId ? l.childId._id : null)).filter(Boolean);

    // 1. Fetch Parent Check-Ins for current and previous period
    const parentCheckInsCurrent = await ParentCheckIn.find({
      parentId,
      parentChildId: { $in: targetParentChildIds },
      date: { $in: datesList },
    }).sort({ date: -1 });

    const parentCheckInsPrev = await ParentCheckIn.find({
      parentId,
      parentChildId: { $in: targetParentChildIds },
      date: { $in: prevDatesList },
    });

    // 2. Fetch Student Daily Check-Ins for current and previous period
    let dailyCheckInsCurrent = [];
    let dailyCheckInsPrev = [];
    if (targetStudentIds.length > 0) {
      dailyCheckInsCurrent = await DailyCheckIn.find({
        studentId: { $in: targetStudentIds },
        date: { $in: datesList },
      }).sort({ date: -1 });

      dailyCheckInsPrev = await DailyCheckIn.find({
        studentId: { $in: targetStudentIds },
        date: { $in: prevDatesList },
      });
    }

    // 3. Fetch Mood Tracker entries for current period
    let moodTrackerCurrent = [];
    if (targetStudentIds.length > 0) {
      moodTrackerCurrent = await MoodTracker.find({
        studentId: { $in: targetStudentIds },
        date: { $in: datesList },
      }).sort({ createdAt: -1 });
    }

    // 4. Fetch Face Analysis entries for current period
    const faceStartDate = new Date(now);
    faceStartDate.setDate(faceStartDate.getDate() - (rangeDays - 1));
    faceStartDate.setHours(0, 0, 0, 0);

    const faceAnalysisRecords = await ChildFaceAnalysis.find({
      parentId,
      parentChildId: { $in: targetParentChildIds },
      analyzedAt: { $gte: faceStartDate },
    }).sort({ analyzedAt: -1 });

    // Helper function to convert feeling/mood to numeric score out of 10
    const getMoodScoreValue = (item) => {
      if (item.wellbeingScore !== undefined) {
        return item.wellbeingScore * 2;
      }
      if (item.feeling || item.mood) {
        const val = (item.feeling || item.mood || "").toLowerCase();
        if (val.includes("very happy") || val.includes("joy") || val.includes("excited")) return 10;
        if (val.includes("happy") || val.includes("positive")) return 8.5;
        if (val.includes("calm") || val.includes("focused")) return 8;
        if (val.includes("neutral") || val.includes("okay")) return 6;
        if (val.includes("tired") || val.includes("sleepy") || val.includes("irritated")) return 4.5;
        if (val.includes("sad") || val.includes("anxious") || val.includes("stressed") || val.includes("angry")) return 3;
      }
      if (item.stressLevel !== undefined) {
        return Math.max(1, 11 - item.stressLevel);
      }
      return 7;
    };

    // Calculate Mood Scores
    let currentScores = [];
    parentCheckInsCurrent.forEach((ci) => currentScores.push(getMoodScoreValue(ci)));
    dailyCheckInsCurrent.forEach((ci) => currentScores.push(getMoodScoreValue(ci)));

    let prevScores = [];
    parentCheckInsPrev.forEach((ci) => prevScores.push(getMoodScoreValue(ci)));
    dailyCheckInsPrev.forEach((ci) => prevScores.push(getMoodScoreValue(ci)));

    const avgCurrentMoodScore = currentScores.length > 0
      ? Number((currentScores.reduce((a, b) => a + b, 0) / currentScores.length).toFixed(1))
      : 7.5;

    const avgPrevMoodScore = prevScores.length > 0
      ? Number((prevScores.reduce((a, b) => a + b, 0) / prevScores.length).toFixed(1))
      : avgCurrentMoodScore;

    const moodScoreChange = Number((avgCurrentMoodScore - avgPrevMoodScore).toFixed(1));

    // Calculate Check-in Completion
    const totalExpectedCheckIns = Math.max(1, rangeDays * Math.max(1, targetParentChildIds.length));

    const checkInSet = new Set();
    parentCheckInsCurrent.forEach((ci) => checkInSet.add(`${ci.parentChildId}_${ci.date}`));
    dailyCheckInsCurrent.forEach((ci) => checkInSet.add(`${ci.studentId}_${ci.date}`));

    const completedCheckInsCount = checkInSet.size;
    const checkInCompletionRate = Math.min(100, Math.round((completedCheckInsCount / totalExpectedCheckIns) * 100));

    // Dominant Emotion
    const emotionCounts = {};
    const registerEmotion = (emo) => {
      if (!emo) return;
      let formatted = emo.trim().charAt(0).toUpperCase() + emo.trim().slice(1).toLowerCase();
      if (formatted.includes("Happy") || formatted.includes("Joy")) formatted = "Happy";
      else if (formatted.includes("Calm") || formatted.includes("Focus")) formatted = "Calm";
      else if (formatted.includes("Stressed") || formatted.includes("Anxious")) formatted = "Stressed";
      else if (formatted.includes("Tired") || formatted.includes("Sleepy")) formatted = "Tired";
      else if (formatted.includes("Neutral")) formatted = "Neutral";

      emotionCounts[formatted] = (emotionCounts[formatted] || 0) + 1;
    };

    faceAnalysisRecords.forEach((fa) => registerEmotion(fa.expression));
    parentCheckInsCurrent.forEach((ci) => registerEmotion(ci.mood));
    dailyCheckInsCurrent.forEach((ci) => registerEmotion(ci.feeling));
    moodTrackerCurrent.forEach((mt) => registerEmotion(mt.mood));

    let dominantEmotion = "Calm";
    let maxCount = -1;
    Object.keys(emotionCounts).forEach((emo) => {
      if (emotionCounts[emo] > maxCount) {
        maxCount = emotionCounts[emo];
        dominantEmotion = emo;
      }
    });
    if (Object.keys(emotionCounts).length === 0) {
      dominantEmotion = "No Data";
    }

    // Wellness Trend
    let wellnessTrend = "Stable";
    if (currentScores.length === 0) {
      wellnessTrend = "Stable";
    } else if (moodScoreChange >= 0.3) {
      wellnessTrend = "Improving";
    } else if (moodScoreChange <= -0.3 || avgCurrentMoodScore < 5.5) {
      wellnessTrend = "Needs Attention";
    } else {
      wellnessTrend = "Stable";
    }

    // Mood Trend Daily Series
    const dailyMoodTrend = datesList.map((dateStr) => {
      const dObj = new Date(dateStr + "T00:00:00");
      const dayName = dObj.toLocaleDateString("en-US", { weekday: "short" });
      const displayDate = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayParentCIs = parentCheckInsCurrent.filter((ci) => ci.date === dateStr);
      const dayDailyCIs = dailyCheckInsCurrent.filter((ci) => ci.date === dateStr);
      const dayMoodTrackers = moodTrackerCurrent.filter((mt) => mt.date === dateStr);

      const dayScores = [
        ...dayParentCIs.map((ci) => getMoodScoreValue(ci)),
        ...dayDailyCIs.map((ci) => getMoodScoreValue(ci)),
      ];

      const dayMoodScore = dayScores.length > 0
        ? Number((dayScores.reduce((a, b) => a + b, 0) / dayScores.length).toFixed(1))
        : null;

      let stress = null;
      const stressVals = dayDailyCIs.map((ci) => ci.stressLevel).filter((v) => v !== undefined);
      if (stressVals.length > 0) {
        stress = Math.round(stressVals.reduce((a, b) => a + b, 0) / stressVals.length);
      }

      let energy = "Normal";
      if (dayParentCIs.length > 0 && dayParentCIs[0].energy) {
        energy = dayParentCIs[0].energy;
      } else if (dayDailyCIs.length > 0 && dayDailyCIs[0].energyLevel) {
        energy = dayDailyCIs[0].energyLevel;
      }

      let sleepHours = "N/A";
      if (dayDailyCIs.length > 0 && dayDailyCIs[0].sleepHours) {
        sleepHours = dayDailyCIs[0].sleepHours;
      }

      let moodStr = "Neutral";
      if (dayParentCIs.length > 0) moodStr = dayParentCIs[0].mood;
      else if (dayDailyCIs.length > 0) moodStr = dayDailyCIs[0].feeling;
      else if (dayMoodTrackers.length > 0) moodStr = dayMoodTrackers[0].mood;

      return {
        date: dateStr,
        dayName,
        displayDate,
        moodScore: dayMoodScore,
        mood: moodStr,
        stress,
        energy,
        sleepHours,
        hasData: dayScores.length > 0,
      };
    });

    // Emotional Distribution
    const standardEmotions = ["Calm", "Happy", "Neutral", "Tired", "Stressed"];
    const totalRecordedEmotions = Object.values(emotionCounts).reduce((a, b) => a + b, 0);

    const emotionalDistribution = standardEmotions.map((emo) => {
      const cnt = emotionCounts[emo] || 0;
      const percentage = totalRecordedEmotions > 0
        ? Math.round((cnt / totalRecordedEmotions) * 100)
        : 0;
      return {
        emotion: emo,
        count: cnt,
        percentage,
      };
    });

    Object.keys(emotionCounts).forEach((emo) => {
      if (!standardEmotions.includes(emo)) {
        const cnt = emotionCounts[emo];
        const percentage = totalRecordedEmotions > 0 ? Math.round((cnt / totalRecordedEmotions) * 100) : 0;
        emotionalDistribution.push({ emotion: emo, count: cnt, percentage });
      }
    });

    // Weekly Check-in Activity Bar Chart
    const weeklyCheckInActivity = datesList.map((dateStr) => {
      const dObj = new Date(dateStr + "T00:00:00");
      const dayName = dObj.toLocaleDateString("en-US", { weekday: "short" });

      const dayParentCIs = parentCheckInsCurrent.filter((ci) => ci.date === dateStr);
      const dayDailyCIs = dailyCheckInsCurrent.filter((ci) => ci.date === dateStr);

      const count = dayParentCIs.length + dayDailyCIs.length;

      const details = [
        ...dayParentCIs.map((ci) => ({
          childName: ci.childName || "Child",
          type: "Parent Check-in",
          mood: ci.mood,
          wellbeingScore: ci.wellbeingScore,
          notes: ci.additionalNotes || ci.unusualBehaviorNote || "",
        })),
        ...dayDailyCIs.map((ci) => ({
          childName: "Student",
          type: "Daily Check-in",
          mood: ci.feeling,
          wellbeingScore: Math.round((11 - (ci.stressLevel || 5)) / 2),
          notes: ci.biggestChallenge || ci.mainGoal || "",
        })),
      ];

      return {
        date: dateStr,
        dayName,
        completedCount: count,
        details,
      };
    });

    // Face Emotion Trend Timeline
    const faceEmotionTrend = faceAnalysisRecords.map((fa) => {
      const analyzedDate = new Date(fa.analyzedAt);
      return {
        id: fa._id,
        date: fa.analyzedAt,
        dateStr: analyzedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        expression: fa.expression,
        confidence: fa.confidence,
        childName: fa.childName || "Child",
      };
    });

    // AI Parent Insight Generation
    let aiSummary = "";
    let aiPattern = "";
    let aiAction = "";

    if (currentScores.length === 0) {
      aiSummary = "No check-in records have been submitted during this selected timeframe.";
      aiPattern = "Observed pattern: Check-in completion is currently pending.";
      aiAction = "Suggested action: Encourage your child to complete a daily check-in or submit a quick parent check-in.";
    } else {
      aiSummary = `Your child's average mood score was ${avgCurrentMoodScore}/10 (${dominantEmotion.toLowerCase()} overall) across ${completedCheckInsCount} completed check-ins.`;

      if (wellnessTrend === "Improving") {
        aiPattern = "Observed pattern: Emotional positivity and engagement have shown a healthy upward trend.";
        aiAction = "Suggested action: Acknowledge your child's positive efforts and maintain open, encouraging family discussions.";
      } else if (wellnessTrend === "Needs Attention") {
        aiPattern = "Observed pattern: Slight fluctuations in mood or elevated stress levels were detected on certain days.";
        aiAction = "Suggested action: Consider having a short relaxed conversation and encourage a calming restorative activity.";
      } else {
        aiPattern = "Observed pattern: Emotional balance remained steady and consistent throughout the period.";
        aiAction = "Suggested action: Keep up the consistent daily routine and plan a fun family activity this weekend.";
      }
    }

    const aiParentInsight = {
      summary: aiSummary,
      observedPattern: aiPattern,
      suggestedAction: aiAction,
    };

    // Attention Patterns
    let attentionPatterns = {
      hasPattern: false,
      patternTitle: "No unusual pattern detected.",
      description: "Child wellness metrics and check-in consistency remain stable.",
      details: [],
    };

    const lowMoodDays = dailyMoodTrend.filter((d) => d.hasData && d.moodScore !== null && d.moodScore < 5.5);
    const highStressDays = dailyMoodTrend.filter((d) => d.hasData && d.stress !== null && d.stress >= 7);
    const unusualBehaviorCIs = parentCheckInsCurrent.filter((ci) => ci.unusualBehavior);

    if (unusualBehaviorCIs.length > 0) {
      attentionPatterns = {
        hasPattern: true,
        patternTitle: "Behavioral Note Flagged",
        description: `Unusual behavior was flagged in ${unusualBehaviorCIs.length} parent check-in(s).`,
        details: unusualBehaviorCIs.map((ci) => ({
          date: ci.date,
          childName: ci.childName,
          note: ci.unusualBehaviorNote || "Unusual behavior noted by parent.",
        })),
      };
    } else if (highStressDays.length >= 2) {
      attentionPatterns = {
        hasPattern: true,
        patternTitle: "Repeated High Stress Detected",
        description: `High stress levels were recorded on ${highStressDays.length} separate days in this period.`,
        details: highStressDays.map((d) => ({
          date: d.displayDate,
          note: `Stress level logged at ${d.stress}/10.`,
        })),
      };
    } else if (lowMoodDays.length >= 2) {
      attentionPatterns = {
        hasPattern: true,
        patternTitle: "Repeated Low Mood Score",
        description: `Mood scores dropped below average on ${lowMoodDays.length} days in this period.`,
        details: lowMoodDays.map((d) => ({
          date: d.displayDate,
          note: `Mood score recorded as ${d.moodScore}/10 (${d.mood}).`,
        })),
      };
    } else if (checkInCompletionRate < 40 && totalExpectedCheckIns >= 3) {
      attentionPatterns = {
        hasPattern: true,
        patternTitle: "Reduced Check-in Activity",
        description: `Check-in completion rate is currently at ${checkInCompletionRate}%.`,
        details: [
          {
            date: todayStr,
            note: `${completedCheckInsCount} out of ${totalExpectedCheckIns} expected check-ins completed.`,
          },
        ],
      };
    }

    // Recent Check-ins Table
    const recentCheckIns = [];

    parentCheckInsCurrent.forEach((ci) => {
      recentCheckIns.push({
        id: ci._id.toString(),
        date: ci.date,
        childName: ci.childName || "Child",
        mood: ci.mood,
        emotion: ci.mood,
        status: "Completed",
        type: "Parent Check-in",
        details: {
          wellbeingScore: ci.wellbeingScore,
          energy: ci.energy,
          socialInteraction: ci.socialInteraction,
          unusualBehavior: ci.unusualBehavior,
          unusualBehaviorNote: ci.unusualBehaviorNote,
          additionalNotes: ci.additionalNotes,
        },
        createdAt: ci.createdAt,
      });
    });

    dailyCheckInsCurrent.forEach((ci) => {
      recentCheckIns.push({
        id: ci._id.toString(),
        date: ci.date,
        childName: "Student",
        mood: ci.feeling,
        emotion: ci.feeling,
        status: "Completed",
        type: "Daily Check-in",
        details: {
          sleepHours: ci.sleepHours,
          stressLevel: ci.stressLevel,
          motivationLevel: ci.motivationLevel,
          biggestChallenge: ci.biggestChallenge,
          mainGoal: ci.mainGoal,
        },
        createdAt: ci.createdAt,
      });
    });

    recentCheckIns.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    const paginatedRecentCheckIns = recentCheckIns.slice(0, 15);

    return res.status(200).json({
      success: true,
      range,
      rangeDays,
      children: childrenList,
      selectedChildId: selectedChildParam || "all",
      overview: {
        moodScore: avgCurrentMoodScore,
        moodScoreChange,
        completedCheckIns: completedCheckInsCount,
        expectedCheckIns: totalExpectedCheckIns,
        checkInCompletionRate,
        dominantEmotion,
        wellnessTrend,
        totalCheckInsRecorded: currentScores.length,
      },
      dailyMoodTrend,
      emotionalDistribution,
      weeklyCheckInActivity,
      faceEmotionTrend,
      aiParentInsight,
      attentionPatterns,
      recentCheckIns: paginatedRecentCheckIns,
    });
  } catch (error) {
    console.error("Get Parent Insights Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parent insights: " + error.message,
    });
  }
};



