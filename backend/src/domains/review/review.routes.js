const express = require("express");
const passport = require("passport");
const {googleAuth, googleAuthCallback, createReview, updateReview, deleteReview, getAllReviews, getReviewById, getReviewsForListings, getReviewsByUser } = require("../review/review.controller");

const router = express.Router();

// Google Authentication Routes
router.get("/google", googleAuth);
router.get("/google-callback", googleAuthCallback);


// Public Routes
router.get("/", getAllReviews);
router.get("/:id", getReviewById);
router.get("/listing/:listingId", getReviewsForListings);


// Protected Routes
router.get("/", passport.authenticate("jwt", { session: false }), getReviewsByUser);
router.post("/:entityId", passport.authenticate("jwt", { session: false }), createReview);
router.put("/:id", passport.authenticate("jwt", { session: false }), updateReview);
router.delete("/:id", passport.authenticate("jwt", { session: false }), deleteReview);


module.exports = router;
