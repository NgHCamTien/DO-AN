const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  googleLogin,
  facebookLogin,
} = require("../controllers/authController");

const { protect, admin } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin); // 🌸 Route đăng nhập Google
router.post("/facebook-login", facebookLogin);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get("/verify-token", protect, (req, res) => {
  res.json({
    message: "Token hợp lệ",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.get("/admin", protect, admin, (req, res) => {
  res.json({
    message: "Bạn là admin",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
