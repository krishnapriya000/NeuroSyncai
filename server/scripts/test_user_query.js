const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function run() {
  await connectDB();

  const user = await User.findOne({ email: "krishnapriyarajesh2027@mca.ajce.in" });
  if (user) {
    console.log("User found:", {
      id: user._id,
      fullName: user.fullName,
      email: `'${user.email}'`,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
  } else {
    console.log("User NOT found");
  }

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
