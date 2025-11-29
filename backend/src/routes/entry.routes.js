const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");
const authMiddleware = require("../middlewares/auth.middleware");

// create entry
router.post("/", authMiddleware, async (req, res) => {
  const userId = req.user.sub;
  const { siteName, siteUrl, login, encryptedPassword, notes } = req.body;
  if (!siteName || !encryptedPassword)
    return res
      .status(400)
      .json({ message: "siteName and encryptedPassword required" });
  const entry = await Entry.create({
    user: userId,
    siteName,
    siteUrl,
    login,
    encryptedPassword,
    notes,
  });
  res.status(201).json({ id: entry._id, message: "Saved" });
});

// list entries (without encrypted password)
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.sub;
  const entries = await Entry.find({ user: userId }).select(
    "siteName siteUrl login createdAt"
  );
  res.json(entries);
});

module.exports = router;
