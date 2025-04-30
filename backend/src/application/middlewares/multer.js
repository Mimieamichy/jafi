// middlewares/mixedStorage.js
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary               = require("../../config/cloudinary");
const multer                   = require("multer");
const fs                       = require("fs");

// 1️⃣ diskStorage for POB
const pobDisk = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// 2️⃣ CloudinaryStorage for images
const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder;
    const imgFormats = ["jpg","jpeg","png","gif","svg","webp","tiff","bmp","heic"];
    switch (file.fieldname) {
      case "images":
      case "logo":
        folder = "jafiImages/business"; break;
      case "workSamples":
        folder = "jafiImages/services"; break;
      case "reviewImages":
        folder = "jafiImages/reviews"; break;
      default:
        folder = "jafiImages/other";
    }
    return {
      folder,
      resource_type: "image",
      allowed_formats: imgFormats
    };
  }
});

// 3️⃣ Wrap them in one storage engine
const mixedStorage = {
  _handleFile(req, file, cb) {
    if (file.fieldname === "pob") {
      // delegate to disk
      pobDisk._handleFile(req, file, cb);
    } else {
      // delegate to cloud
      cloudStorage._handleFile(req, file, cb);
    }
  },
  _removeFile(req, file, cb) {
    if (file.fieldname === "pob") {
      pobDisk._removeFile(req, file, cb);
    } else {
      cloudStorage._removeFile(req, file, cb);
    }
  }
};

module.exports = mixedStorage;
