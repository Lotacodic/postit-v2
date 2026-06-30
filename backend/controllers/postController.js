const Post = require("../models/Post");
const User = require("../models/User");

// CREATE POST
const createPost = async (req, res, next) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      postit: req.body.postit,
      img: req.body.img,
      file: req.body.file,
    });

    const savedPost = await newPost.save();

    return res.status(201).json({
      message: "Post created successfully.",
      post: savedPost,
    });
  } catch (err) {
    next(err);
  }
};

// GET A SINGLE POST
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json({
      message: "Post fetched successfully.",
      post,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL POSTS
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.aggregate([
      { $match: { isDeleted: false } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          commentCount: {
            $size: {
              $filter: {
                input: "$comments",
                as: "comment",
                cond: { $eq: ["$$comment.isDeleted", false] },
              },
            },
          },
        },
      },
      { $project: { comments: 0 } }, // drop the raw array; we only needed the count
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
      {
        $project: {
          "userId.username": 1,
          "userId.avatar": 1,
          "userId._id": 1,
          postit: 1,
          img: 1,
          file: 1,
          likes: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          commentCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Posts fetched successfully.",
      posts,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE POST
const updatePost = async (req, res, next) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          postit: req.body.postit,
          img: req.body.img,
          file: req.body.file,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Post updated successfully.",
      post: updatedPost,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE POST (SOFT)
const deletePost = async (req, res, next) => {
  try {
    await Post.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    return res.status(200).json({
      message: "Post deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// GET TIMELINE POSTS
const getTimelinePosts = async (req, res, next) => {
  try {
    const currentUser = await User.findOne({
      _id: req.user.id,
      isDeleted: false,
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const userPosts = await Post.find({
      userId: currentUser._id,
      isDeleted: false,
    });

    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) =>
        Post.find({ userId: friendId, isDeleted: false })
      )
    );

    const timeline = userPosts.concat(...friendPosts);

    return res.status(200).json({
      message: "Timeline fetched successfully.",
      posts: timeline,
    });
  } catch (err) {
    next(err);
  }
};

// GET PROFILE POSTS
const getProfilePosts = async (req, res, next) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const posts = await Post.find({ userId: user._id, isDeleted: false });

    return res.status(200).json({
      message: "Profile posts fetched successfully.",
      posts,
    });
  } catch (err) {
    next(err);
  }
};

// LIKE / UNLIKE A POST
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (!post.likes.includes(req.user.id)) {
      await post.updateOne({ $push: { likes: req.user.id } });
      return res.status(200).json({ message: "Post liked successfully." });
    } else {
      await post.updateOne({ $pull: { likes: req.user.id } });
      return res.status(200).json({ message: "Post unliked successfully." });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getPost,
  getAllPosts,
  updatePost,
  deletePost,
  getTimelinePosts,
  getProfilePosts,
  likePost,
};
