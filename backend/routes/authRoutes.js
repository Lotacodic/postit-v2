const router = require("express").Router();
const { signup, login, verifyEmail, googleLogin } = require("../controllers/authController");
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/google", googleLogin);
module.exports = router;
