const mongoose = require("mongoose");
const dns = require("dns");

// Set reliable public DNS servers to resolve MongoDB Atlas cluster hosts on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Could not override DNS servers:", e.message);
}

if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch (e) {}
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = "mongodb://127.0.0.1:27017/neurosync";

  const options = {
    serverSelectionTimeoutMS: 6000,
  };

  try {
    if (primaryUri) {
      console.log("🔄 Connecting to MongoDB Atlas Cloud Database...");
      await mongoose.connect(primaryUri, options);
      console.log("✅ MongoDB Atlas Cloud Connected Successfully!");
      return;
    }
  } catch (primaryErr) {
    console.warn("⚠️ MongoDB Atlas connection failed:", primaryErr.message);
    console.log("🔄 Attempting automatic fallback to Local MongoDB (mongodb://127.0.0.1:27017/neurosync)...");
  }

  // Fallback to local MongoDB instance
  try {
    await mongoose.connect(fallbackUri, options);
    console.log("✅ Successfully connected to Local MongoDB Database!");
  } catch (localErr) {
    console.error("❌ Fatal MongoDB Connection Error: Could not connect to Atlas Cloud or Local MongoDB.");
    console.error("Please check your internet connection or start local MongoDB service.");
  }
};

module.exports = connectDB;