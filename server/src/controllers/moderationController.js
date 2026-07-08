const Property = require("../models/Property");
const OwnerProfile = require("../models/OwnerProfile");

const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ moderationStatus: "pending" })
      .populate("owner", "fullName email profilePicture")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: { properties },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPropertyForModeration = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "fullName email profilePicture"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const ownerProfile = await OwnerProfile.findOne({
      user: property.owner._id,
    }).select("phoneNumber whatsappNumber languages preferredContactMethods");

    return res.status(200).json({
      success: true,
      data: {
        property,
        ownerProfile,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      moderationStatus: "pending",
    });

    if (!property) {
      const propertyExists = await Property.exists({ _id: req.params.id });

      if (!propertyExists) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Only pending properties can be approved",
      });
    }

    if (property.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Property must have at least one image before approval",
      });
    }

    property.moderationStatus = "approved";
    property.rejectionReason = "";
    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property approved successfully",
      data: { property },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectProperty = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (
      typeof rejectionReason !== "string" ||
      rejectionReason.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const property = await Property.findOneAndUpdate(
      {
        _id: req.params.id,
        moderationStatus: "pending",
      },
      {
        $set: {
          moderationStatus: "rejected",
          rejectionReason: rejectionReason.trim(),
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!property) {
      const propertyExists = await Property.exists({ _id: req.params.id });

      if (!propertyExists) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Only pending properties can be rejected",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property rejected successfully",
      data: { property },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPendingProperties,
  getPropertyForModeration,
  approveProperty,
  rejectProperty,
};
