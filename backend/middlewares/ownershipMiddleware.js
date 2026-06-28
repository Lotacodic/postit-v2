const Post = require("../models/Post");
const Comment = require("../models/Comment");

const verifyPostOwnership = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only modify your own posts." });
    }

    req.post = post;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const verifyCommentOwnership = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only modify your own comments." });
    }

    req.comment = comment;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

module.exports = { verifyPostOwnership, verifyCommentOwnership };