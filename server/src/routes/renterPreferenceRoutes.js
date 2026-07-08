const express = require("express");
const {
  createRenterPreferences,
  getMyRenterPreferences,
  updateMyRenterPreferences,
} = require("../controllers/renterPreferenceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createRenterPreferences);
router.get("/me", protect, getMyRenterPreferences);
router.put("/me", protect, updateMyRenterPreferences);

module.exports = router;
