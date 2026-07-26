const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    deviceInfo: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    token: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Login = mongoose.model("Login", loginSchema);

module.exports = Login;
