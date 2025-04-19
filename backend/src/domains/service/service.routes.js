const express = require("express");
const router = express.Router();
const {registerService, verifyServiceNumber, getAService, getAllServices, updateService, payForService, verifyServicePayment, getServiceByUserId, deleteService} = require("./service.controller");
const { cloudUpload } = require("../../application/middlewares/cloudinary"); 
const {authenticate} = require('../../application/middlewares/authenticate')
const {authorize} = require('../../application/middlewares/authorize')


//public routes
router.post("/register", cloudUpload, registerService);//signup api
router.post("/verify-service", verifyServiceNumber);
router.post("/pay/:serviceId", payForService);
router.get("/verify/:pay_ref", verifyServicePayment)
router.get("/:id", getAService);
router.get("/", getAllServices);




// Protected routes - require authentication
router.use(authenticate, authorize(["service", "admin", "superadmin"]));
router.put("/:id", cloudUpload, updateService);
router.delete("/:id", deleteService);
router.get("/user/:id", getServiceByUserId)






module.exports = router;
