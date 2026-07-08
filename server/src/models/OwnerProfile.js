const mongoose = require("mongoose");

const ownerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
    },
    whatsappNumber: {
      type: String,
      trim: true,
      required: [true, "WhatsApp number is required"],
    },
    languages: {
      type: [String],
      default: [],
    },
    preferredContactMethods: {
      type: [String],
      enum: ["phone", "whatsapp", "email"],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OwnerProfile", ownerProfileSchema);
