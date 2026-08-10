const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

// Connect Database
connectDB();

const app = express();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const moodTrackerRoutes = require("./routes/moodTrackerRoutes");
const journalRoutes = require("./routes/journalRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const { protect } = require("./middleware/authMiddleware");
const { getLatestCheckIn } = require("./controllers/studentController");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/student/emergency", emergencyRoutes);
app.use("/api/professional", professionalRoutes);
app.use("/api/moodtracker", moodTrackerRoutes);
app.use("/api/journal", journalRoutes);
app.get("/api/dailycheckin/latest", protect, getLatestCheckIn);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 NeuroSync Backend is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});