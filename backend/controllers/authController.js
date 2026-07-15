const crypto = require("crypto");
const { Resend } = require("resend");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { getAvatarUrl } = require("../utils/avatarHelper");
const generateUniqueUsername = require("../utils/generateUsername");

const resend = new Resend(process.env.RESEND_API_KEY);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verification links expire after 24 hours.
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// Password reset links are shorter-lived than verification links, since
// a leaked reset link is a more immediate account-takeover risk.
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

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

async function sendPasswordResetEmail(email, rawToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your Postit password",
    html: `
      <p>We received a request to reset your Postit password.</p>
      <p>Click the link below to choose a new password. This link expires in 15 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
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

// GOOGLE LOGIN / SIGNUP
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(400).json({ message: "Google account email is not verified." });
    }

    let user = await User.findOne({ email: payload.email, isDeleted: false });

    // First time this Google account has signed in — create a local User.
    // The random password is unusable for login; it exists only to satisfy
    // the schema, since this account authenticates via Google going forward.
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      const username = await generateUniqueUsername(payload.name);

      user = new User({
        username,
        email: payload.email,
        password: hashedPassword,
        avatar: payload.picture || getAvatarUrl(username),
        isVerified: true,
      });
      await user.save();
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

// FORGOT PASSWORD
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isDeleted: false });

    // Always return the same response whether or not the user exists —
    // otherwise this endpoint becomes a way to check which emails are
    // registered on the platform.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordTokenExpires = Date.now() + RESET_TOKEN_TTL_MS;
      await user.save();

      try {
        await sendPasswordResetEmail(user.email, rawToken);
      } catch (emailErr) {
        console.error("Failed to send password reset email:", emailErr);
      }
    }

    return res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

// RESET PASSWORD
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, verifyEmail, googleLogin, forgotPassword, resetPassword };
