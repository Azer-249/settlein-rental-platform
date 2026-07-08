const express = require("express");
const {
  createOwnerProfile,
  getMyOwnerProfile,
  updateMyOwnerProfile,
} = require("../controllers/ownerProfileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOwnerProfile);
router.get("/me", protect, getMyOwnerProfile);
router.put("/me", protect, updateMyOwnerProfile);

module.exports = router;
