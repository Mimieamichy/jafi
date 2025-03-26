const express = require("express");
const { createPayment, makePayment, verifyPayment } = require("../controllers/transaction.controller");


const router = express.Router();


//public routes
router.post("/create/:entityId", createPayment);
router.post("/pay/:transactionId", makePayment);
router.get("/verify/:reference", verifyPayment);


module.exports = router;
