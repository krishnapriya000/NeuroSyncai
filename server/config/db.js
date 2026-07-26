const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    // Set reliable public DNS servers to resolve MongoDB Atlas SRV records on Windows networks
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};

module.exports = connectDB;