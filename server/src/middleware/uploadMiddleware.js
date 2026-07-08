const multer = require("multer");

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
const allowedDocumentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "images" && !allowedImageTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }

  if (file.fieldname === "video" && !allowedVideoTypes.includes(file.mimetype)) {
    return cb(new Error("Only MP4, WebM, and MOV videos are allowed"));
  }

  if (
    file.fieldname === "documents" &&
    !allowedDocumentTypes.includes(file.mimetype)
  ) {
    return cb(new Error("Only PDF, JPEG, PNG, and WebP documents are allowed"));
  }

  if (!["images", "video", "documents"].includes(file.fieldname)) {
    return cb(new Error("Unexpected upload field"));
  }

  cb(null, true);
};

const getFileSizeLimit = (fileSize, fieldname) => {
  if (typeof fileSize === "number") {
    return fileSize;
  }

  return fileSize?.[fieldname] || 0;
};

const getMaxFileSize = (fileSize) => {
  if (typeof fileSize === "number") {
    return fileSize;
  }

  return Math.max(...Object.values(fileSize || { default: 0 }));
};

const createMemoryStorage = (fileSize) => ({
  _handleFile(req, file, cb) {
    const chunks = [];
    const limit = getFileSizeLimit(fileSize, file.fieldname);
    let totalSize = 0;
    let callbackWasCalled = false;

    const done = (error, info) => {
      if (callbackWasCalled) return;

      callbackWasCalled = true;
      cb(error, info);
    };

    file.stream.on("data", (chunk) => {
      totalSize += chunk.length;

      if (limit > 0 && totalSize > limit) {
        done(new multer.MulterError("LIMIT_FILE_SIZE", file.fieldname));
        file.stream.resume();
        return;
      }

      chunks.push(chunk);
    });

    file.stream.on("error", done);
    file.stream.on("end", () => {
      if (callbackWasCalled) return;

      done(null, {
        buffer: Buffer.concat(chunks, totalSize),
        size: totalSize,
      });
    });
  },

  _removeFile(req, file, cb) {
    delete file.buffer;
    cb(null);
  },
});

const createUpload = (fileSize) =>
  multer({
    storage: createMemoryStorage(fileSize),
    fileFilter,
    limits: {
      fileSize: getMaxFileSize(fileSize),
    },
  });

module.exports = {
  createUpload,
};
