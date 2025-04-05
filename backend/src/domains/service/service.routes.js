const express = require("express");
const router = express.Router();
const {registerService, verifyServiceNumber, getAService, getAllServices, updateService, payForService, verifyServicePayment, getServiceByUserId, deleteService} = require("./service.controller");
const { uploadMiddleware } = require("../../application/middlewares/cloudinary"); 
const {authenticate} = require('../../application/middlewares/authenticate')
const {authorize} = require('../../application/middlewares/authorize')


<<<<<<< HEAD

=======
>>>>>>> 1d906130f0dfdc0663385f99f0136fa00f337690
//public routes
router.get("/", getAllServices);
router.get("/:id", getAService);
router.post("/register", uploadMiddleware, registerService);//signup api
router.post("/verify-service", verifyServiceNumber);
router.post("/pay/:serviceId", payForService);
router.get("/verify/:pay_ref", verifyServicePayment)


<<<<<<< HEAD

=======
>>>>>>> 1d906130f0dfdc0663385f99f0136fa00f337690
// Protected routes - require authentication
router.use(authenticate, authorize(["service", "admin"]));
router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.get("/user/:id", getServiceByUserId)
<<<<<<< HEAD

=======
>>>>>>> 1d906130f0dfdc0663385f99f0136fa00f337690






module.exports = router;
