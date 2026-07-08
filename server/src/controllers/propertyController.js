const Property = require("../models/Property");
const OwnerProfile = require("../models/OwnerProfile");
const PropertyInterest = require("../models/PropertyInterest");
const RenterPropertyInteraction = require("../models/RenterPropertyInteraction");
const {
  uploadImageBuffer,
  uploadVideoBuffer,
  uploadDocumentBuffer,
  deleteCloudinaryImage,
  deleteCloudinaryVideo,
  deleteCloudinaryDocument,
} = require("../utils/cloudinaryUpload");

const contentSections = [
  "basicInformation",
  "location",
  "pricing",
  "propertyDetails",
  "tenantRules",
  "livingSituation",
  "features",
];

const MAX_PROPERTY_IMAGES = 12;
const MAX_PROPERTY_DOCUMENTS = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MIN_IMAGE_WIDTH = 1200;
const MIN_IMAGE_HEIGHT = 900;

const cleanupUploadedImages = async (publicIds) => {
  await Promise.allSettled(
    publicIds.map((publicId) => deleteCloudinaryImage(publicId))
  );
};

const cleanupUploadedDocuments = async (documents) => {
  await Promise.allSettled(
    documents.map((document) =>
      deleteCloudinaryDocument(document.publicId, document.resourceType)
    )
  );
};

const sendErrorResponse = (res, error) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

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
};

const parsePropertyData = (req) => {
  if (typeof req.body.propertyData !== "string") {
    return null;
  }

  return JSON.parse(req.body.propertyData);
};

const createProperty = async (req, res) => {
  const uploadedImagePublicIds = [];
  const uploadedDocuments = [];
  let uploadedVideoPublicId = "";

  try {
    const ownerProfile = await OwnerProfile.findOne({ user: req.user._id });

    if (!ownerProfile) {
      return res.status(404).json({
        success: false,
        message: "Create an owner profile before adding a property",
      });
    }

    let propertyData;

    try {
      propertyData = parsePropertyData(req);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "propertyData must be valid JSON",
      });
    }

    if (!propertyData || typeof propertyData !== "object") {
      return res.status(400).json({
        success: false,
        message: "propertyData is required",
      });
    }

    const imageFiles = req.files?.images || [];
    const documentFiles = req.files?.documents || [];
    const videoFile = req.files?.video?.[0];

    if (imageFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (documentFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one property document is required",
      });
    }

    if (!videoFile) {
      return res.status(400).json({
        success: false,
        message: "Video tour is required",
      });
    }

    if (imageFiles.length > MAX_PROPERTY_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `A property can have a maximum of ${MAX_PROPERTY_IMAGES} images`,
      });
    }

    if (documentFiles.length > MAX_PROPERTY_DOCUMENTS) {
      return res.status(400).json({
        success: false,
        message: `A property can have a maximum of ${MAX_PROPERTY_DOCUMENTS} documents`,
      });
    }

    for (const file of imageFiles) {
      if (file.size > MAX_IMAGE_BYTES) {
        return res.status(400).json({
          success: false,
          message: "Each image must be 5 MB or smaller",
        });
      }
    }

    for (const file of documentFiles) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        return res.status(400).json({
          success: false,
          message: "Each property document must be 10 MB or smaller",
        });
      }
    }

    if (videoFile.size > MAX_VIDEO_BYTES) {
      return res.status(400).json({
        success: false,
        message: "Video tour must be 50 MB or smaller",
      });
    }

    const uploadedImages = [];

    for (const file of imageFiles) {
      const result = await uploadImageBuffer(file.buffer);
      uploadedImagePublicIds.push(result.public_id);

      if (result.width < MIN_IMAGE_WIDTH || result.height < MIN_IMAGE_HEIGHT) {
        await cleanupUploadedImages(uploadedImagePublicIds);

        return res.status(400).json({
          success: false,
          message: `Images must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px`,
        });
      }

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        isCover: uploadedImages.length === 0,
      });
    }

    const propertyDocuments = [];

    for (const file of documentFiles) {
      const result = await uploadDocumentBuffer(file.buffer);
      const uploadedDocument = {
        publicId: result.public_id,
        resourceType: result.resource_type,
      };

      uploadedDocuments.push(uploadedDocument);

      propertyDocuments.push({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        originalName: file.originalname,
      });
    }

    const videoResult = await uploadVideoBuffer(videoFile.buffer);
    uploadedVideoPublicId = videoResult.public_id;
    const videoTour = {
      url: videoResult.secure_url,
      publicId: videoResult.public_id,
      format: videoResult.format,
      bytes: videoResult.bytes,
      duration: videoResult.duration || 0,
    };

    const {
      basicInformation,
      location,
      pricing,
      propertyDetails,
      tenantRules,
      livingSituation,
      features,
    } = propertyData;

    const property = await Property.create({
      owner: req.user._id,
      basicInformation,
      location,
      pricing,
      propertyDetails,
      tenantRules,
      livingSituation,
      features,
      images: uploadedImages,
      videoTour,
      propertyDocuments,
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully and is pending approval",
      data: {
        property,
      },
    });
  } catch (error) {
    await Promise.all([
      cleanupUploadedImages(uploadedImagePublicIds),
      cleanupUploadedDocuments(uploadedDocuments),
    ]);

    if (uploadedVideoPublicId) {
      await deleteCloudinaryVideo(uploadedVideoPublicId);
    }

    return sendErrorResponse(res, error);
  }
};

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: properties.length,
      data: {
        properties,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const getApprovedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      moderationStatus: "approved",
      availabilityStatus: "available",
    })
      .select("-propertyDocuments")
      .populate("owner", "fullName profilePicture")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: properties.length,
      data: {
        properties,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      moderationStatus: "approved",
      availabilityStatus: "available",
    })
      .select("-propertyDocuments")
      .populate("owner", "fullName profilePicture");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    let contentWasUpdated = false;
    let propertyWasUpdated = false;

    for (const section of contentSections) {
      const sectionUpdate = req.body[section];

      if (
        sectionUpdate &&
        typeof sectionUpdate === "object" &&
        !Array.isArray(sectionUpdate)
      ) {
        for (const [field, value] of Object.entries(sectionUpdate)) {
          property.set(`${section}.${field}`, value);
        }

        contentWasUpdated = true;
        propertyWasUpdated = true;
      }
    }

    if (req.body.availabilityStatus !== undefined) {
      property.availabilityStatus = req.body.availabilityStatus;
      propertyWasUpdated = true;
    }

    if (!propertyWasUpdated) {
      return res.status(400).json({
        success: false,
        message: "No valid property fields were provided",
      });
    }

    if (contentWasUpdated) {
      property.moderationStatus = "pending";
      property.rejectionReason = "";
    }

    await property.save();

    return res.json({
      success: true,
      message: contentWasUpdated
        ? "Property updated successfully and is pending approval"
        : "Property availability updated successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const uploadPropertyImages = async (req, res) => {
  const uploadedImagePublicIds = [];

  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (property.images.length + req.files.length > MAX_PROPERTY_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `A property can have a maximum of ${MAX_PROPERTY_IMAGES} images`,
      });
    }

    for (const file of req.files) {
      if (file.size > MAX_IMAGE_BYTES) {
        return res.status(400).json({
          success: false,
          message: "Each image must be 5 MB or smaller",
        });
      }

      const result = await uploadImageBuffer(file.buffer);
      uploadedImagePublicIds.push(result.public_id);

      if (result.width < MIN_IMAGE_WIDTH || result.height < MIN_IMAGE_HEIGHT) {
        await cleanupUploadedImages(uploadedImagePublicIds);

        return res.status(400).json({
          success: false,
          message: `Images must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px`,
        });
      }

      property.images.push({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        isCover: property.images.length === 0,
      });
    }

    property.moderationStatus = "pending";
    property.rejectionReason = "";

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property images uploaded successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    await cleanupUploadedImages(uploadedImagePublicIds);
    return sendErrorResponse(res, error);
  }
};

const deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    const image = property.images.id(req.params.imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Property image not found",
      });
    }

    if (property.images.length === 1) {
      return res.status(400).json({
        success: false,
        message: "A property must have at least one image",
      });
    }

    const deletedImageWasCover = image.isCover;

    if (image.publicId) {
      await deleteCloudinaryImage(image.publicId);
    }

    property.images.pull(image._id);

    if (deletedImageWasCover && property.images.length > 0) {
      property.images[0].isCover = true;
    }

    property.moderationStatus = "pending";
    property.rejectionReason = "";

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property image deleted successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const setPropertyCoverImage = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    const coverImage = property.images.id(req.params.imageId);

    if (!coverImage) {
      return res.status(404).json({
        success: false,
        message: "Property image not found",
      });
    }

    property.images.forEach((image) => {
      image.isCover = image._id.equals(coverImage._id);
    });

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property cover image updated successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const uploadPropertyVideoTour = async (req, res) => {
  let uploadedVideoPublicId = "";

  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video tour is required",
      });
    }

    if (req.file.size > MAX_VIDEO_BYTES) {
      return res.status(400).json({
        success: false,
        message: "Video tour must be 50 MB or smaller",
      });
    }

    const previousVideoPublicId = property.videoTour?.publicId;
    const result = await uploadVideoBuffer(req.file.buffer);
    uploadedVideoPublicId = result.public_id;

    property.videoTour = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration || 0,
    };

    property.moderationStatus = "pending";
    property.rejectionReason = "";

    await property.save();

    if (previousVideoPublicId) {
      await deleteCloudinaryVideo(previousVideoPublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Property video tour uploaded successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    if (uploadedVideoPublicId) {
      await deleteCloudinaryVideo(uploadedVideoPublicId);
    }

    return sendErrorResponse(res, error);
  }
};

const deletePropertyVideoTour = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    if (!property.videoTour?.publicId) {
      return res.status(404).json({
        success: false,
        message: "Property video tour not found",
      });
    }

    await deleteCloudinaryVideo(property.videoTour.publicId);

    property.videoTour = {
      url: "",
      publicId: "",
      format: "",
      bytes: 0,
      duration: 0,
    };
    property.moderationStatus = "pending";
    property.rejectionReason = "";

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property video tour deleted successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const uploadPropertyDocuments = async (req, res) => {
  const uploadedDocuments = [];

  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one property document is required",
      });
    }

    if (
      property.propertyDocuments.length + req.files.length >
      MAX_PROPERTY_DOCUMENTS
    ) {
      return res.status(400).json({
        success: false,
        message: `A property can have a maximum of ${MAX_PROPERTY_DOCUMENTS} documents`,
      });
    }

    for (const file of req.files) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        await cleanupUploadedDocuments(uploadedDocuments);

        return res.status(400).json({
          success: false,
          message: "Each property document must be 10 MB or smaller",
        });
      }

      const result = await uploadDocumentBuffer(file.buffer);
      const uploadedDocument = {
        publicId: result.public_id,
        resourceType: result.resource_type,
      };

      uploadedDocuments.push(uploadedDocument);

      property.propertyDocuments.push({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        originalName: file.originalname,
      });
    }

    property.moderationStatus = "pending";
    property.rejectionReason = "";

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property documents uploaded successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    await cleanupUploadedDocuments(uploadedDocuments);
    return sendErrorResponse(res, error);
  }
};

const deletePropertyDocument = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    const document = property.propertyDocuments.id(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Property document not found",
      });
    }

    await deleteCloudinaryDocument(document.publicId, document.resourceType);
    property.propertyDocuments.pull(document._id);
    property.moderationStatus = "pending";
    property.rejectionReason = "";

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property document deleted successfully",
      data: {
        property,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not own it",
      });
    }

    await Promise.all([
      PropertyInterest.deleteMany({ property: property._id }),
      RenterPropertyInteraction.deleteMany({ property: property._id }),
    ]);

    await property.deleteOne();

    await cleanupUploadedImages(
      property.images.map((image) => image.publicId).filter(Boolean)
    );

    if (property.videoTour?.publicId) {
      await deleteCloudinaryVideo(property.videoTour.publicId);
    }

    await cleanupUploadedDocuments(
      property.propertyDocuments.map((document) => ({
        publicId: document.publicId,
        resourceType: document.resourceType,
      }))
    );

    return res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

module.exports = {
  createProperty,
  getMyProperties,
  getApprovedProperties,
  getPropertyById,
  updateProperty,
  uploadPropertyImages,
  deletePropertyImage,
  setPropertyCoverImage,
  uploadPropertyVideoTour,
  deletePropertyVideoTour,
  uploadPropertyDocuments,
  deletePropertyDocument,
  deleteProperty,
};
