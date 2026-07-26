const User = require("../models/User");
const Login = require("../models/Login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, userType, phone, age, gender, occupation } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and password." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email address already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB Atlas
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userType || "User",
      occupation: occupation || userType || "",
      phone: phone || "",
      age: age || null,
      gender: gender || undefined,
    });

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || "neurosync_secret_key";
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, jwtSecret, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Account registered successfully!",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration: " + error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide both email and password." });
    }

    // Find user by email in MongoDB Atlas
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "No account found with this email address." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed login attempt
      await Login.create({
        userId: user._id,
        email: user.email,
        status: "Failed",
        ipAddress: req.ip || "",
      }).catch(() => {});

      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || "neurosync_secret_key";
    const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: "7d" });

    // Record successful login in MongoDB Atlas
    await Login.create({
      userId: user._id,
      email: user.email,
      status: "Success",
      token,
      ipAddress: req.ip || "",
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login: " + error.message });
  }
};
