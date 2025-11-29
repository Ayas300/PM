const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {// bcrypt hash of login password
    type: String,
    required: true,
  }, 
  otp: { // used for forgot-password & show-password verification
    code: String,
    expiresAt: Date,
    }, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
