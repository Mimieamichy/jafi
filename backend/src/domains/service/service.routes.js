const express = require("express");
const router = express.Router();
const {registerService, verifyServiceNumber, getAService, getAllServices, updateService, payForService, verifyServicePayment, getServiceByUserId, deleteService} = require("./service.controller");
const { uploadMiddleware } = require("../../application/middlewares/cloudinary"); 
const {authenticate} = require('../../application/middlewares/authenticate')
const {authorize} = require('../../application/middlewares/authorize')


// Protected routes - require authentication
router.use(authenticate, authorize(["service", "admin"]));
router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.get("/user/:id", getServiceByUserId)

//public routes
router.get("/", getAllServices);
router.get("/:id", getAService);
router.post("/register", uploadMiddleware, registerService);//signup api
router.post("/verify-service", verifyServiceNumber);
router.post("/pay/:serviceId", payForService);
router.get("/verify/:pay_ref", verifyServicePayment)










module.exports = router;
