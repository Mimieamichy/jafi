const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = "jafiImages/business"; 
    if (file.fieldname === "workSamples") folder = "jafiImages/services"

    return { folder, allowed_formats: ["jpg", "jpeg", "png", "gif", "svg", "webp", "tiff", "bmp", "heic", "raw"] };

  },
});

const upload = multer({ storage }).fields([
  { name: "images", maxCount: 5 },
  { name: "workSamples", maxCount: 5 }
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(500).json({ error: `Upload error: ${err.message}` });
    next();
  });
};

module.exports = {uploadMiddleware};
