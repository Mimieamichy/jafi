const express = require("express");
const { login, forgotPassword, resetPassword, googleLogin } = require("../user/user.controller");

const router = express.Router();


// Public routes
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google-login", googleLogin);


module.exports = router;
