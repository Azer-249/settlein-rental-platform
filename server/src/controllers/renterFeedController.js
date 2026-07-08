const mongoose = require("mongoose");
const Property = require("../models/Property");
const RenterPreference = require("../models/RenterPreference");
const PropertyInterest = require("../models/PropertyInterest");
const RenterPropertyInteraction = require("../models/RenterPropertyInteraction");
const {
  MIN_FEED_SIMILARITY,
  REJECTION_COOLDOWN_HOURS,
  buildRenterFeedQuery,
  normalizeLimit,
  orderMatchesByThreshold,
  scorePropertyForRenter,
} = require("../utils/renterMatching");

const MAX_CANDIDATES = 500;

const findInteractableProperty = async (propertyId) => {
  if (!mongoose.isValidObjectId(propertyId)) {
    return null;
  }

  return Property.findOne({
    _id: propertyId,
    moderationStatus: "approved",
    availabilityStatus: "available",
    "pricing.currency": "GEL",
  });
};

const getExcludedPropertyIds = async (renterId, now) => {
  const [interactions, interests] = await Promise.all([
    RenterPropertyInteraction.find({
      renter: renterId,
      $or: [
        { action: "interested" },
        {
          action: "rejected",
          dismissedUntil: { $gt: now },
        },
      ],
    }).select("property"),
    PropertyInterest.find({
      renter: renterId,
      status: { $in: ["pending", "approved", "rejected"] },
    }).select("property"),
  ]);

  return [
    ...interactions.map((interaction) => interaction.property),
    ...interests.map((interest) => interest.property),
  ];
};

const getRenterFeed = async (req, res) => {
  try {
    const limit = normalizeLimit(req.query.limit);
    const preferences = await RenterPreference.findOne({ user: req.user._id });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "Renter preferences not found",
      });
    }

    if (!preferences.location?.city) {
      return res.status(400).json({
        success: false,
        message: "Select a city in renter preferences before using the feed",
      });
    }

    const now = new Date();
    const excludedPropertyIds = await getExcludedPropertyIds(req.user._id, now);
    const query = buildRenterFeedQuery(preferences, excludedPropertyIds);

    query.owner = { $ne: req.user._id };

    const properties = await Property.find(query)
      .select("-propertyDocuments")
      .populate("owner", "fullName profilePicture")
      .sort({ createdAt: -1 })
      .limit(MAX_CANDIDATES);

    const matches = properties
      .map((property) => ({
        similarity: scorePropertyForRenter(property, preferences),
        property,
      }))
      .filter((match) => match.similarity > MIN_FEED_SIMILARITY);
    const orderedMatches = orderMatchesByThreshold(matches).slice(0, limit);

    return res.json({
      success: true,
      count: orderedMatches.length,
      data: {
        matches: orderedMatches,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectProperty = async (req, res) => {
  try {
    const property = await findInteractableProperty(req.params.propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or is not available",
      });
    }

    if (property.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot reject your own property",
      });
    }

    const rejectedAt = new Date();
    const dismissedUntil = new Date(
      rejectedAt.getTime() + REJECTION_COOLDOWN_HOURS * 60 * 60 * 1000
    );

    const interaction = await RenterPropertyInteraction.findOneAndUpdate(
      {
        renter: req.user._id,
        property: property._id,
      },
      {
        $set: {
          action: "rejected",
          rejectedAt,
          dismissedUntil,
        },
        $unset: {
          interestedAt: "",
        },
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Property rejected for this renter feed",
      data: {
        interaction,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markPropertyInterest = async (req, res) => {
  try {
    const property = await findInteractableProperty(req.params.propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or is not available",
      });
    }

    if (property.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot mark interest in your own property",
      });
    }

    const existingInterest = await PropertyInterest.findOne({
      renter: req.user._id,
      property: property._id,
    });

    if (existingInterest?.status === "rejected") {
      return res.status(409).json({
        success: false,
        message: "The owner has rejected this interest request",
      });
    }

    if (
      existingInterest &&
      ["pending", "approved"].includes(existingInterest.status)
    ) {
      return res.status(200).json({
        success: true,
        message: "Property interest already exists",
        data: {
          interest: existingInterest,
        },
      });
    }

    const now = new Date();
    const interest = await PropertyInterest.findOneAndUpdate(
      {
        renter: req.user._id,
        property: property._id,
      },
      {
        $set: {
          owner: property.owner,
          status: "pending",
          interestedAt: now,
        },
        $unset: {
          approvedAt: "",
          rejectedAt: "",
          withdrawnAt: "",
          ownerRespondedAt: "",
          contactSharedAt: "",
        },
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Property interest saved",
      data: {
        interest,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRenterFeed,
  markPropertyInterest,
  rejectProperty,
};
