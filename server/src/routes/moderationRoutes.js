const express = require("express");
const {
  getPendingProperties,
  getPropertyForModeration,
  approveProperty,
  rejectProperty,
} = require("../controllers/moderationController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();
router.get(
  "/properties/pending",
  protect,
  requireRole("moderator"),
  getPendingProperties
);
router.get(
  "/properties/:id",
  protect,
  requireRole("moderator"),
  getPropertyForModeration
);
router.patch(
  "/properties/:id/approve",
  protect,
  requireRole("moderator"),
  approveProperty
);
router.patch(
  "/properties/:id/reject",
  protect,
  requireRole("moderator"),
  rejectProperty
);

module.exports = router;
