const router = require("express").Router();
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const verifyToken = require("../middlewares/authMiddleware");
const { verifyCommentOwnership } = require("../middlewares/ownershipMiddleware");

router.post("/:postId", verifyToken, createComment);
router.get("/:postId", getPostComments);
router.put("/:id", verifyToken, verifyCommentOwnership, updateComment);
router.delete("/:id", verifyToken, verifyCommentOwnership, deleteComment);

module.exports = router;