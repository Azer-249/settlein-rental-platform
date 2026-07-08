const mongoose = require("mongoose");

const propertyInterestSchema = new mongoose.Schema(
  {
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner: {
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
      required: true,
      index: true,
    },
    interestedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    withdrawnAt: {
      type: Date,
    },
    ownerRespondedAt: {
      type: Date,
    },
    contactSharedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

propertyInterestSchema.index({ renter: 1, property: 1 }, { unique: true });
propertyInterestSchema.index({ renter: 1, status: 1, updatedAt: -1 });
propertyInterestSchema.index({ owner: 1, property: 1, status: 1 });
propertyInterestSchema.index({ property: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model("PropertyInterest", propertyInterestSchema);
