const express = require("express");
const {
  register,
  login,
  getMe,
  updateMyRole,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/me/role", protect, updateMyRole);

module.exports = router;
