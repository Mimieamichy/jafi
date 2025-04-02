const express = require("express");
const { login, forgotPassword, verifyResetToken, resetPassword } = require("../user/user.controller");

const router = express.Router();


// Public routes
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken)
router.post("/reset-password", resetPassword);


module.exports = router;
