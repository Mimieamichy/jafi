const express = require("express");
const { login, forgotPassword, verifyResetToken, resetPassword, getAllUsers, getUserById, updateUser, getAllListings } = require("../user/user.controller");
const {authenticate} = require("../../application/middlewares/authenticate");
const { authorize } = require("../../application/middlewares/authorize");
const router = express.Router();


// Public routes
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken)
router.post("/reset-password", resetPassword);
router.get("/listings", getAllListings);
router.get("/", getAllUsers);
router.get("/:id", getUserById);



// Protected routes - require authentication
router.use(authenticate, authorize(["user", "admin"]));
router.put("/:id", updateUser);




module.exports = router;
