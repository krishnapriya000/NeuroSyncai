const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect middleware - verifies JWT token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided.",
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "neurosync_secret_key";
    const decoded = jwt.verify(token, jwtSecret);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired.",
    });
  }
};

// Admin middleware - ensures user has Admin role
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
};
