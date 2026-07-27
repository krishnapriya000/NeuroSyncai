const User = require("../models/User");
const Login = require("../models/Login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../config/mailer");

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

// @desc    Google Sign In / Sign Up
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { credential, email, fullName, googleId, profileImage } = req.body;

    let userEmail = email;
    let userName = fullName;
    let userGoogleId = googleId;
    let userPicture = profileImage || "";

    // If ID Token (credential) is passed from Google OAuth frontend button
    if (credential) {
      const { OAuth2Client } = require("google-auth-library");
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        userEmail = payload.email;
        userName = payload.name;
        userGoogleId = payload.sub;
        userPicture = payload.picture;
      } catch (verifyErr) {
        // Fallback for development token decoding if client ID verification is pending env setup
        const jwt = require("jsonwebtoken");
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          userEmail = decoded.email;
          userName = decoded.name || userName;
          userGoogleId = decoded.sub || userGoogleId;
          userPicture = decoded.picture || userPicture;
        }
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "Google authentication failed: Email not provided." });
    }

    // Find existing user by email
    let user = await User.findOne({ email: userEmail.toLowerCase() });

    if (user) {
      // Update googleId and profile image if not set
      if (!user.googleId) user.googleId = userGoogleId;
      if (!user.profileImage && userPicture) user.profileImage = userPicture;
      user.isVerified = true;
      await user.save();
    } else {
      // Create new user in MongoDB Atlas
      user = await User.create({
        fullName: userName || "Google User",
        email: userEmail.toLowerCase(),
        googleId: userGoogleId || "",
        profileImage: userPicture || "",
        authProvider: "google",
        isVerified: true,
        role: "User",
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "neurosync_secret_key";
    const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: "7d" });

    // Record login session in MongoDB Atlas logins collection
    await Login.create({
      userId: user._id,
      email: user.email,
      status: "Success",
      token,
      ipAddress: req.ip || "",
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "🟢 Successfully authenticated with Google!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        authProvider: user.authProvider,
      },
      token,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Server error during Google auth: " + error.message });
  }
};

// @desc    Forgot password - Send reset link email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your registered email address." });
    }

    const targetEmail = email.trim().toLowerCase();
    console.log(`\n🔑 [FORGOT PASSWORD] Password reset requested for: "${targetEmail}"`);

    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`❌ [FORGOT PASSWORD] Account not found for email: "${targetEmail}"`);
      return res.status(404).json({
        success: false,
        message: `No account registered with "${targetEmail}". Please check your email or register a new account.`,
      });
    }

    // Generate random 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token to store in database securely
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token & 1 hour expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Reset Link URL
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    try {
      console.log(`📧 [FORGOT PASSWORD] Dispatching email to user's address: ${user.email}`);
      await sendPasswordResetEmail(user.email, resetUrl, user.fullName);

      res.status(200).json({
        success: true,
        message: `📩 Password reset link successfully sent to ${user.email}! Please check your inbox or spam folder.`,
      });
    } catch (mailError) {
      console.error("❌ Email sending failed:", mailError);

      // Reset fields if email failed to send
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email: " + mailError.message,
      });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error during forgot password: " + error.message });
  }
};

// @desc    Reset password - Validate token and update password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Hash the received token to match against DB hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token and valid expiry date
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "🎉 Password has been reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error during password reset: " + error.message });
  }
};

