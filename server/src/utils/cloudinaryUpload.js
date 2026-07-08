const cloudinary = require("../config/cloudinary");

const uploadImageBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "settlein/properties",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const uploadVideoBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "settlein/properties/video-tours",
        resource_type: "video",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const uploadDocumentBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "settlein/properties/documents",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteCloudinaryImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};

const deleteCloudinaryVideo = (publicId) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
  });
};

const deleteCloudinaryDocument = (publicId, resourceType) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

module.exports = {
  uploadImageBuffer,
  uploadVideoBuffer,
  uploadDocumentBuffer,
  deleteCloudinaryImage,
  deleteCloudinaryVideo,
  deleteCloudinaryDocument,
};
