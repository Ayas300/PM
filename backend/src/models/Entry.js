const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  siteName: {
    type: String,
    required: true,
  },
  siteUrl: {
    type: String,
  },
  login: {
    type: String,
  }, // username or email for site
  encryptedPassword: {
    type: String,
    required: true,
  }, // ciphertext (opaque to server)
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,                                                          
  },
});

module.exports = mongoose.model("Entry", entrySchema);
