const express = require("express");
const router = express.Router();
const { 
  registerBusiness, 
  getABusiness, 
  getAllBusinesses, 
  updateBusiness, 
  payForBusiness, 
  verifyBusinessPayment, 
  getBusinessByUserId, 
  deleteBusiness ,
  getBusinessByCategory
} = require("./business.controller");

const { cloudUpload } = require("../../application/middlewares/cloudinary");
const uploadPob  = require("../../application/middlewares/multer");
const { authenticate } = require('../../application/middlewares/authenticate');
const { authorize } = require('../../application/middlewares/authorize');

// Public routes
router.post("/register", cloudUpload, uploadPob.fields([{ name: 'pob', maxCount: 1 }]), registerBusiness); // Signup API
router.get("/verify/:pay_ref", verifyBusinessPayment);
router.post("/pay/:businessId", payForBusiness);
router.get("/:id", getABusiness);
router.get("/category/:category", getBusinessByCategory); 
router.get("/", getAllBusinesses);


// Protected routes - require authentication and authorization
router.use(authenticate, authorize(["business", "admin", "superadmin"])); 
router.put("/:id", cloudUpload, uploadPob.single("pob"), updateBusiness);
router.delete("/:id", deleteBusiness);
router.get("/user/:id", getBusinessByUserId);


module.exports = router;
