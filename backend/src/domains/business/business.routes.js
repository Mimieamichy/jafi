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
  deleteBusiness 
} = require("./business.controller");

const { uploadMiddleware } = require("../../application/middlewares/cloudinary");
const { authenticate } = require('../../application/middlewares/authenticate');
const { authorize } = require('../../application/middlewares/authorize');

// Public routes
router.post("/register", uploadMiddleware, registerBusiness); // Signup API
router.get("/", getAllBusinesses);
router.get("/:id", getABusiness);
router.get("/verify/:pay_ref", verifyBusinessPayment);

// Protected routes - require authentication and authorization
router.use(authenticate, authorize(["business", "admin", "superadmin"])); 
router.put("/:id", updateBusiness);
router.delete("/:id", deleteBusiness);
router.get("/user/:id", getBusinessByUserId);
router.post("/pay/:businessId", payForBusiness);

module.exports = router;
