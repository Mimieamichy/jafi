const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");
const multer = require("multer");

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = "";
    let allowedFormats = ["jpg", "jpeg", "png", "gif", "svg", "webp", "tiff", "bmp", "heic"];

    if (file.fieldname === "workSamples") {
      folder = "jafiImages/services";
    } else if (file.fieldname === "reviewImages") {
      folder = "jafiImages/reviews";
    } else if (file.fieldname === "images") {
      folder = "jafiImages/business";
    }
    else if (file.fieldname === "logo") {
      folder = "jafiImages/business";
    }

    return {
      folder,
      resource_type: "image",
      allowed_formats: allowedFormats,
    };
  },
});

const cloudUpload = multer({ storage: cloudStorage }).fields([
  { name: "images", maxCount: 10 },
  { name: "logo", maxCount: 1 },
  { name: "workSamples", maxCount: 10 },
  { name: "reviewImages", maxCount: 10 },
]);

module.exports = { cloudUpload };
