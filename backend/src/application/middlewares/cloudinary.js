const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = "jafiImages/listings/images"; // Default folder
    if (file.fieldname === "logo") folder = "jafiImages/listings/logo";
    if (file.fieldname === "featured_images") folder = "jafiImages/listings/featured";
    if (file.fieldname === "hiring_images") folder = "jafiImages/services";

    return { folder, allowed_formats: ["jpg", "jpeg", "png"] };
  },
});

const upload = multer({ storage }).fields([
  { name: "logo", maxCount: 1 },
  { name: "featured_images", maxCount: 2 },
  { name: "images", maxCount: 5 },
  { name: "hiring_images", maxCount: 5 }
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(500).json({ error: `Upload error: ${err.message}` });
    next();
  });
};

module.exports = {uploadMiddleware};
