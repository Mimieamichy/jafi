const express = require("express");
const { login, forgotPassword, verifyResetToken, resetPassword, getAllUsers, getUserById, updateUser, getAllListings, getUserRole, replyToReview } = require("../user/user.controller");
const {authenticate} = require("../../application/middlewares/authenticate");
const { authorize } = require("../../application/middlewares/authorize");
const router = express.Router();

// Public routes - specific routes first
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken);
router.get("/listings", getAllListings);
router.post("/reset-password", resetPassword);
router.get("/role/:id", getUserRole);



// Public routes with parameters - place after specific routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);




// Protected routes - require authentication
router.use(authenticate, authorize(["user", "admin", "business", "service"]));
router.post("/reply/:reviewId", replyToReview);

router.use(authenticate, authorize(["user", "admin"]));
router.put("/:id", updateUser);

module.exports = router;