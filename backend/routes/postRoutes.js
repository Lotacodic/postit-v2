const router = require("express").Router();
const {
  createPost,
  getPost,
  getAllPosts,
  updatePost,
  deletePost,
  getTimelinePosts,
  getProfilePosts,
  likePost,
} = require("../controllers/postController");
const verifyToken = require("../middlewares/authMiddleware");
const { verifyPostOwnership } = require("../middlewares/ownershipMiddleware");

router.post("/", verifyToken, createPost);
router.get("/", getAllPosts);
router.get("/timeline", verifyToken, getTimelinePosts);
router.get("/profile/:username", getProfilePosts);
router.get("/:id", getPost);
router.put("/:id", verifyToken, verifyPostOwnership, updatePost);
router.delete("/:id", verifyToken, verifyPostOwnership, deletePost);
router.put("/:id/like", verifyToken, likePost);

module.exports = router;