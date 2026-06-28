const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { getAvatarUrl } = require("../utils/avatarHelper");

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

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message: "Account created successfully.",
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

module.exports = { signup, login };