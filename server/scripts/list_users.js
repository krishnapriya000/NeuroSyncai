const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");

async function checkUsers() {
  await connectDB();
  console.log("Connected to MongoDB.");

  const users = await User.find({}).select("fullName email role authProvider createdAt");
  console.log(`Total users found: ${users.length}`);
  users.forEach((u, i) => {
    console.log(`${i + 1}. Name: ${u.fullName} | Email: ${u.email} | Role: ${u.role} | Provider: ${u.authProvider || "local"}`);
  });

  process.exit(0);
}

checkUsers().catch((err) => {
  console.error("Error checking users:", err);
  process.exit(1);
});
