const mongoose = require("mongoose");
const OwnerProfile = require("../models/OwnerProfile");
const Property = require("../models/Property");
const PropertyInterest = require("../models/PropertyInterest");
const User = require("../models/User");

const findOwnedProperty = async (propertyId, ownerId) => {
  if (!mongoose.isValidObjectId(propertyId)) {
    return null;
  }

  return Property.findOne({
    _id: propertyId,
    owner: ownerId,
  });
};

const getOwnerContactInfo = async (ownerId) => {
  const [owner, ownerProfile] = await Promise.all([
    User.findById(ownerId).select("fullName email profilePicture"),
    OwnerProfile.findOne({ user: ownerId }).select(
      "phoneNumber whatsappNumber languages preferredContactMethods"
    ),
  ]);

  if (!owner) {
    return null;
  }

  return {
    owner: {
      _id: owner._id,
      fullName: owner.fullName,
      email: owner.email,
      profilePicture: owner.profilePicture,
    },
    ownerProfile,
  };
};

const addContactAccessToInterest = async (interest) => {
  const interestObject = interest.toObject();

  if (interest.status !== "approved") {
    return {
      ...interestObject,
      ownerContact: null,
    };
  }

  return {
    ...interestObject,
    ownerContact: await getOwnerContactInfo(interest.owner),
  };
};

const getMyInterests = async (req, res) => {
  try {
    const statuses = ["pending", "approved", "rejected"];

    if (req.query.includeWithdrawn === "true") {
      statuses.push("withdrawn");
    }

    const interests = await PropertyInterest.find({
      renter: req.user._id,
      status: { $in: statuses },
    })
      .populate({
        path: "property",
        select: "-propertyDocuments",
        populate: {
          path: "owner",
          select: "fullName profilePicture",
        },
      })
      .sort({ updatedAt: -1 });

    const interestsWithContact = await Promise.all(
      interests.map((interest) => addContactAccessToInterest(interest))
    );

    return res.json({
      success: true,
      count: interestsWithContact.length,
      data: {
        interests: interestsWithContact,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const withdrawMyInterest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.interestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest ID",
      });
    }

    const interest = await PropertyInterest.findOne({
      _id: req.params.interestId,
      renter: req.user._id,
    });

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Interest not found",
      });
    }

    if (interest.status === "rejected") {
      return res.status(409).json({
        success: false,
        message: "Owner-rejected interests cannot be withdrawn",
      });
    }

    if (interest.status !== "withdrawn") {
      interest.status = "withdrawn";
      interest.withdrawnAt = new Date();
      await interest.save();
    }

    return res.json({
      success: true,
      message: "Property interest withdrawn",
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

const getPropertyInterestsForOwner = async (req, res) => {
  try {
    const property = await findOwnedProperty(
      req.params.propertyId,
      req.user._id
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    const statuses = ["pending", "approved", "rejected"];

    if (req.query.includeWithdrawn === "true") {
      statuses.push("withdrawn");
    }

    const interests = await PropertyInterest.find({
      property: property._id,
      owner: req.user._id,
      status: { $in: statuses },
    })
      .populate("renter", "fullName email profilePicture")
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: interests.length,
      data: {
        property,
        interests,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const respondToInterest = async (req, res, status) => {
  try {
    const property = await findOwnedProperty(
      req.params.propertyId,
      req.user._id
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    if (!mongoose.isValidObjectId(req.params.interestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest ID",
      });
    }

    const interest = await PropertyInterest.findOne({
      _id: req.params.interestId,
      property: property._id,
      owner: req.user._id,
    });

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Interest not found",
      });
    }

    if (interest.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending interests can be responded to",
      });
    }

    const now = new Date();
    interest.status = status;
    interest.ownerRespondedAt = now;

    if (status === "approved") {
      interest.approvedAt = now;
      interest.contactSharedAt = now;
    } else {
      interest.rejectedAt = now;
    }

    await interest.save();

    return res.json({
      success: true,
      message:
        status === "approved"
          ? "Property interest approved"
          : "Property interest rejected",
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

const approvePropertyInterest = (req, res) =>
  respondToInterest(req, res, "approved");

const rejectPropertyInterest = (req, res) =>
  respondToInterest(req, res, "rejected");

module.exports = {
  approvePropertyInterest,
  getMyInterests,
  getPropertyInterestsForOwner,
  rejectPropertyInterest,
  withdrawMyInterest,
};
