const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateOTP } = require("../utils/otp");
const { sendEmail } = require("../utils/mailer");

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(409).json({ message: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash });
  res.status(201).json({ message: "User created" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  res.json({ token });
};

exports.requestForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(200)
      .json({ message: "If this email exists, an OTP was sent." }); // Do not reveal existence
  const code = generateOTP();
  user.otp = {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
  await user.save();
  await sendEmail(
    user.email,
    "Your password reset OTP",
    `<p>Your OTP: <b>${code}</b></p>`
  );
  res.json({ message: "If this email exists, an OTP was sent." });
};

exports.verifyForgotPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (
    !user ||
    !user.otp ||
    user.otp.expiresAt < new Date() ||
    user.otp.code !== otp
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.otp = undefined;
  await user.save();
  res.json({ message: "Password reset" });
};

// For show-password OTP (separate endpoint)
exports.requestShowPasswordOTP = async (req, res) => {
  const userId = req.user.sub;
  const user = await User.findById(userId);
  const code = generateOTP();
  user.otp = { code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  await user.save();
  await sendEmail(
    user.email,
    "Your OTP to view password",
    `<p>Your OTP: <b>${code}</b></p>`
  );
  res.json({ message: "OTP sent to email" });
};

exports.verifyShowPasswordOTP = async (req, res) => {
  const userId = req.user.sub;
  const { otp, entryId } = req.body;
  const user = await User.findById(userId);
  if (
    !user ||
    !user.otp ||
    user.otp.expiresAt < new Date() ||
    user.otp.code !== otp
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  user.otp = undefined;
  await user.save();
  // return the encrypted password blob (server does NOT decrypt)
  const Entry = require("../models/Entry");
  const entry = await Entry.findOne({ _id: entryId, user: userId }).select(
    "+encryptedPassword"
  ); // ensure field present
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  res.json({ encryptedPassword: entry.encryptedPassword });
};
