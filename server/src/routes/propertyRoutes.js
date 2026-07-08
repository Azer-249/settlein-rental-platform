const express = require("express");
const {
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
} = require("../controllers/propertyController");
const {
  approvePropertyInterest,
  getPropertyInterestsForOwner,
  rejectPropertyInterest,
} = require("../controllers/propertyInterestController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { createUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

const imageUpload = createUpload(MAX_IMAGE_BYTES);
const videoUpload = createUpload(MAX_VIDEO_BYTES);
const documentUpload = createUpload(MAX_DOCUMENT_BYTES);
const propertyCreateUpload = createUpload({
  images: MAX_IMAGE_BYTES,
  documents: MAX_DOCUMENT_BYTES,
  video: MAX_VIDEO_BYTES,
});

const createPropertyUploadMiddleware = (req, res, next) => {
  propertyCreateUpload.fields([
    { name: "images", maxCount: 12 },
    { name: "documents", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ])(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "Each image must be 5 MB or smaller, each property document must be 10 MB or smaller, and the video tour must be 50 MB or smaller",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "Upload a maximum of 12 images using the images field, 5 documents using the documents field, and 1 video using the video field",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  });
};

const uploadPropertyImagesMiddleware = (req, res, next) => {
  imageUpload.array("images", 12)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Each image must be 5 MB or smaller",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Upload a maximum of 12 images using the images field",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  });
};

const uploadPropertyVideoMiddleware = (req, res, next) => {
  videoUpload.single("video")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Video tour must be 50 MB or smaller",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Upload one video using the video field",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  });
};

const uploadPropertyDocumentsMiddleware = (req, res, next) => {
  documentUpload.array("documents", 5)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Each property document must be 10 MB or smaller",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Upload a maximum of 5 documents using the documents field",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  });
};

router.get("/", getApprovedProperties);
router.post(
  "/",
  protect,
  requireRole("owner"),
  createPropertyUploadMiddleware,
  createProperty
);
router.get("/mine", protect, requireRole("owner"), getMyProperties);
router.post(
  "/:id/images",
  protect,
  requireRole("owner"),
  uploadPropertyImagesMiddleware,
  uploadPropertyImages
);
router.delete(
  "/:id/images/:imageId",
  protect,
  requireRole("owner"),
  deletePropertyImage
);
router.patch(
  "/:id/images/:imageId/cover",
  protect,
  requireRole("owner"),
  setPropertyCoverImage
);
router.post(
  "/:id/video-tour",
  protect,
  requireRole("owner"),
  uploadPropertyVideoMiddleware,
  uploadPropertyVideoTour
);
router.delete(
  "/:id/video-tour",
  protect,
  requireRole("owner"),
  deletePropertyVideoTour
);
router.post(
  "/:id/documents",
  protect,
  requireRole("owner"),
  uploadPropertyDocumentsMiddleware,
  uploadPropertyDocuments
);
router.delete(
  "/:id/documents/:documentId",
  protect,
  requireRole("owner"),
  deletePropertyDocument
);
router.get(
  "/:propertyId/interests",
  protect,
  requireRole("owner"),
  getPropertyInterestsForOwner
);
router.patch(
  "/:propertyId/interests/:interestId/approve",
  protect,
  requireRole("owner"),
  approvePropertyInterest
);
router.patch(
  "/:propertyId/interests/:interestId/reject",
  protect,
  requireRole("owner"),
  rejectPropertyInterest
);
router.get("/:id", getPropertyById);
router.put("/:id", protect, requireRole("owner"), updateProperty);
router.delete("/:id", protect, requireRole("owner"), deleteProperty);

module.exports = router;
