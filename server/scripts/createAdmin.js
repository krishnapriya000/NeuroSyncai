require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const adminData = {
  fullName: "Admin",
  email: "krishnaak0404@gmail.com".toLowerCase(),
  password: "Krishna#4",
  role: "Admin",
};

async function createOrUpdateAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("Error: MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    let user = await User.findOne({ email: adminData.email });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    if (user) {
      user.fullName = adminData.fullName;
      user.password = hashedPassword;
      user.role = adminData.role;
      user.isVerified = true;
      await user.save();
      console.log(`Successfully updated user ${adminData.email} to Admin role!`);
    } else {
      user = await User.create({
        fullName: adminData.fullName,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        authProvider: "local",
        isVerified: true,
      });
      console.log(`Successfully created new Admin user: ${adminData.email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error setting admin user:", error);
    process.exit(1);
  }
}

createOrUpdateAdmin();
