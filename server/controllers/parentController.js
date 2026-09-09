const User = require("../models/User");
const ParentChild = require("../models/ParentChild");
const DailyCheckIn = require("../models/DailyCheckIn");
const MoodTracker = require("../models/MoodTracker");

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
