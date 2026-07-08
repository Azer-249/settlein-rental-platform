const express = require("express");
const {
  getMyInterests,
  withdrawMyInterest,
} = require("../controllers/propertyInterestController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, requireRole("renter"));

router.get("/me", getMyInterests);
router.delete("/:interestId", withdrawMyInterest);

module.exports = router;
