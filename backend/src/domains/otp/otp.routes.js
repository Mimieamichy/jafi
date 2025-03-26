const express = require("express");
const {sendOTP, verifyOTP} = require("./otp.controller");

const router = express.Router();

router.post("/send", sendOTP);
router.post("/verify", verifyOTP);

module.exports = router;
