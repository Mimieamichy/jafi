const express = require("express");
const router = express.Router();
const {registerService, verifyServiceNumber, getAService, getAllServices, updateService, payForService, verifyServicePayment} = require("./service.controller");
const { uploadMiddleware } = require("../../application/middlewares/cloudinary"); 
const {authenticate} = require('../../application/middlewares/authenticate')
const {authorize} = require('../../application/middlewares/authorize')


//public routes
router.get("/", getAllServices);
router.get("/:id", getAService);
router.post("/register", uploadMiddleware, registerService);//signup api
router.post("/verify-service", verifyServiceNumber);
router.post("/pay/:serviceId", payForService);
router.get("/verify/:pay_ref", verifyServicePayment)


// Protected routes - require authentication
router.use(authenticate, authorize(["service", "admin"]));
router.patch("/:id", updateService);






module.exports = router;
