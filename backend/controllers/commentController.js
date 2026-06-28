const Comment = require("../models/Comment");

// CREATE COMMENT
// CREATE COMMENT
const createComment = async (req, res, next) => {
  try {
    const Post = require("../models/Post");

    const post = await Post.findOne({ _id: req.params.postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const newComment = new Comment({
      postId: req.params.postId,
      userId: req.user.id,
      text: req.body.text,
    });

    const savedComment = await newComment.save();

    return res.status(201).json({
      message: "Comment created successfully.",
      comment: savedComment,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL COMMENTS FOR A POST
const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
      isDeleted: false,
    });

    return res.status(200).json({
      message: "Comments fetched successfully.",
      comments,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE COMMENT
const updateComment = async (req, res, next) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: { text: req.body.text } },
      { new: true }
    );

    return res.status(200).json({
      message: "Comment updated successfully.",
      comment: updatedComment,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE COMMENT (SOFT)
const deleteComment = async (req, res, next) => {
  try {
    await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    return res.status(200).json({
      message: "Comment deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};