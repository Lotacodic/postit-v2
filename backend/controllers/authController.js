const crypto = require("crypto");
const { Resend } = require("resend");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { getAvatarUrl } = require("../utils/avatarHelper");

const resend = new Resend(process.env.RESEND_API_KEY);

// Verification links expire after 24 hours.
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

async function sendVerificationEmail(email, rawToken) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your Postit account",
    html: `
      <p>Welcome to Postit!</p>
      <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    `,
  });
}

// REGISTER
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarUrl = getAvatarUrl(username);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + VERIFICATION_TOKEN_TTL_MS,
    });
    const savedUser = await newUser.save();

    // Email delivery failing shouldn't fail the signup itself — the account
    // still exists and the user can request a resend later. We log it
    // server-side so delivery issues are visible without blocking the response.
    try {
      await sendVerificationEmail(savedUser.email, rawToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    return res.status(201).json({
      message: "Account created successfully. Please check your email to verify your account.",
      userId: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      avatar: savedUser.avatar,
    });
  } catch (err) {
    next(err);
  }
};

// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }
    const token = generateToken(user._id);
    return res.status(200).json({
      message: "Login successful.",
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (err) {
    next(err);
  }
};

// VERIFY EMAIL
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, verifyEmail };
