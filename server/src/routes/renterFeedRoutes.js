const express = require("express");
const {
  getRenterFeed,
  markPropertyInterest,
  rejectProperty,
} = require("../controllers/renterFeedController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, requireRole("renter"));

router.get("/", getRenterFeed);
router.post("/:propertyId/reject", rejectProperty);
router.post("/:propertyId/interest", markPropertyInterest);

module.exports = router;
