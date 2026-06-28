const router = require("express").Router();
const {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.put("/:id/follow", verifyToken, followUser);
router.put("/:id/unfollow", verifyToken, unfollowUser);

module.exports = router;