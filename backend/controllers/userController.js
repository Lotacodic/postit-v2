const User = require("../models/User");
const bcrypt = require("bcrypt");
const { getAvatarUrl, getAvatarImgTag } = require("../utils/avatarHelper");

// GET A USER
const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const avatarUrl = getAvatarUrl(user.username);
    const imgTag = getAvatarImgTag(avatarUrl);

    return res.status(200).json({
      message: "User fetched successfully",
      fetchedUser: {
        imgTag,
        avatar: avatarUrl,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL USERS
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false }).select(
      "-password -updatedAt -createdAt"
    );
    return res.status(200).json({
      message: "Users fetched successfully.",
      users,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE USER
const updateUser = async (req, res, next) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Account updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE USER (SOFT)
const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    return res.status(200).json({
      message: "Account deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// FOLLOW A USER
const followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(403).json({ message: "You cannot follow yourself." });
    }

    const userToFollow = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found." });
    }

    if (userToFollow.followers.includes(req.user.id)) {
      return res.status(400).json({ message: "You already follow this user." });
    }

    await userToFollow.updateOne({ $push: { followers: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, {
      $push: { followings: req.params.id },
    });

    return res.status(200).json({ message: "User followed successfully." });
  } catch (err) {
    next(err);
  }
};

// UNFOLLOW A USER
const unfollowUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(403).json({ message: "You cannot unfollow yourself." });
    }

    const userToUnfollow = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!userToUnfollow.followers.includes(req.user.id)) {
      return res.status(400).json({ message: "You do not follow this user." });
    }

    await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { followings: req.params.id },
    });

    return res.status(200).json({ message: "User unfollowed successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
};