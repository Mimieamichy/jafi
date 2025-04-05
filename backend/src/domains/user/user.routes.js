const express = require("express");
const { login, forgotPassword, verifyResetToken, resetPassword, getAllUsers, getUserById, updateUser, getAllListings } = require("../user/user.controller");

const router = express.Router();


// Public routes
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken)
router.post("/reset-password", resetPassword);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.get("/listings", getAllListings);


module.exports = router;
