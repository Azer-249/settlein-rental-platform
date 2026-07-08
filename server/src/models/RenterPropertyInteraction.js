const mongoose = require("mongoose");

const renterPropertyInteractionSchema = new mongoose.Schema(
  {
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["rejected", "interested"],
      required: true,
    },
    rejectedAt: {
      type: Date,
    },
    dismissedUntil: {
      type: Date,
    },
    interestedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

renterPropertyInteractionSchema.index(
  { renter: 1, property: 1 },
  { unique: true }
);
renterPropertyInteractionSchema.index({
  renter: 1,
  action: 1,
  dismissedUntil: 1,
});

module.exports = mongoose.model(
  "RenterPropertyInteraction",
  renterPropertyInteractionSchema
);
