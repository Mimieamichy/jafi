const express = require("express");
const { createPayment, makePayment, verifyPayment, viewPayments , webhook} = require("../payments/payments.controller");


const router = express.Router();


//public routes
router.post("/create/:entityId", createPayment);
router.post("/pay/:transactionId", makePayment);
router.get("/verify/:reference", verifyPayment);
router.get("/view", viewPayments);
router.post("/webhook/paystack", webhook);


module.exports = router;
