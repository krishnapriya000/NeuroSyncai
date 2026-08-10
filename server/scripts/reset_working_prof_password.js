const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function run() {
  await connectDB();

  const emailToReset = "krishnapriyarajesh2027@mca.ajce.in";
  const newPassword = "Password123";

  const user = await User.findOne({ email: emailToReset.toLowerCase().trim() });
  if (!user) {
    console.log(`User ${emailToReset} not found!`);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.role = "Working Professional";
  await user.save();

  console.log(`✅ Successfully updated password for Working Professional (${user.email}) to: '${newPassword}'`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
