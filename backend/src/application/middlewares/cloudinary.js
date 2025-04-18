const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = "";
    let allowedFormats = ["jpg", "jpeg", "png", "gif", "svg", "webp", "tiff", "bmp", "heic"];
  
    if (file.fieldname === "workSamples") {
      folder = "jafiImages/services";
    } else if (file.fieldname === "pob") {
      folder = "jafiImages/pob";
      allowedFormats = ["pdf", "docx"]; // only allow documents for pob
      return {
        folder,
        resource_type: "raw", // needed for non-image files like PDF/DOCX
        allowed_formats: allowedFormats,
      };
    } else if (file.fieldname === "reviewImages") {
      folder = "jafiImages/reviews";
    } else if (file.fieldname === "images") {
      folder = "jafiImages/business";
    }
  
    return {
      folder,
      allowed_formats: allowedFormats,
    };
  }  
});

const upload = multer({ storage }).fields([
  { name: "images", maxCount: 10 },
  { name: "workSamples", maxCount: 10 },
  { name: "pob", maxCount: 2},
  { name: "reviewImages", maxCount: 10}
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(500).json({ error: `Upload error: ${err.message}` });
    next();
  });
};

module.exports = {uploadMiddleware};
