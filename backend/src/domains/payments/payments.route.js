const express = require("express");
const { authenticate } = require('../../application/middlewares/authenticate');
const { authorize } = require('../../application/middlewares/authorize');
const { createPayment, makePayment, verifyPayment, viewPayments} = require("../payments/payments.controller");


const router = express.Router();


//public routes
router.post("/create/:entityId", createPayment);
router.post("/pay/:transactionId", makePayment);


router.use(authenticate, authorize(["admin", "superadmin"])); 
//Protected routes
router.post("/verify/:reference", verifyPayment);
router.get("/view", viewPayments);



module.exports = router;
