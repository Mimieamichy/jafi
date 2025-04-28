// middlewares/cloudUpload.js
const multer        = require("multer");
const mixedStorage  = require("./multer");

const cloudUpload = multer({ storage: mixedStorage }).fields([
  { name: "images",      maxCount: 10 },
  { name: "logo",        maxCount: 1  },
  { name: "workSamples", maxCount: 10 },
  { name: "reviewImages",maxCount: 10 },
  { name: "pob",         maxCount: 1  },
]);

module.exports = { cloudUpload };
