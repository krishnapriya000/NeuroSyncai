const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function run() {
  await connectDB();

  const emailToTest = "krishnaak0404@gmail.com";
  console.log(`Searching for email: '${emailToTest}'`);

  const user = await User.findOne({ email: emailToTest.toLowerCase().trim() });
  console.log("Result:", user);

  if (user) {
    console.log("User details:", {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      hasPassword: !!user.password,
    });

    const isMatch = await bcrypt.compare("Krishna#4", user.password || "");
    console.log("Password 'Krishna#4' match result:", isMatch);
  }

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
