const User = require("../models/User");
const Login = require("../models/Login");

// @desc    Get Admin Dashboard statistics & metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "Admin" });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalLogins = await Login.countDocuments();
    const recentLogins = await Login.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // Breakdown by roles
    const roleStatsRaw = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const roleBreakdown = {};
    roleStatsRaw.forEach((item) => {
      if (item._id) {
        roleBreakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        verifiedUsers,
        totalLogins,
        recentLogins24h: recentLogins,
        roleBreakdown,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats: " + error.message,
    });
  }
};

// @desc    Get all users with search, role filter, pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users: " + error.message,
    });
  }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const allowedRoles = ["Admin", "Parent", "User", "Student", "Working Professional", "Senior Citizen"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.email} role updated to ${role}.`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin Update Role Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update role: " + error.message,
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: `User ${user.email} deleted successfully.`,
    });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user: " + error.message,
    });
  }
};

// @desc    Get login history logs
// @route   GET /api/admin/logins
// @access  Private/Admin
exports.getLoginLogs = async (req, res) => {
  try {
    const logs = await Login.find()
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Admin Login Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch login logs: " + error.message,
    });
  }
};
