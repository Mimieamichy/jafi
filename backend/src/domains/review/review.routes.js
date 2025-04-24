const express = require("express");
const passport = require("passport");
const {googleAuth, googleAuthCallback, createReview, updateReview, deleteReview, getAllReviews, getReviewById, getReviewsForListings,  getReviewsByUser, searchReviews, getAReviewwithReplies, getAllReviewsWithReplies, acknowledgeReview, getAllReviewsByuserId} = require("../review/review.controller");
const { cloudUpload } = require("../../application/middlewares/cloudinary"); 
const router = express.Router();

// Google Authentication Routes
router.get("/google", googleAuth); //signup api
router.get("/google-callback", googleAuthCallback);




// Protected Routes
router.get("/user/", passport.authenticate("jwt", { session: false }), getReviewsByUser );
router.post("/:entityId", passport.authenticate("jwt", { session: false }), cloudUpload, createReview);
router.put("/:id", passport.authenticate("jwt", { session: false }), cloudUpload, updateReview);
router.delete("/:id", passport.authenticate("jwt", { session: false }), deleteReview);


// Public Routes
router.get("/:userId", getAllReviewsByuserId)
router.get("/entity/:entityId", getReviewsForListings);
router.get("/search", searchReviews); //removed this and merge to get All
router.get("/:id", getReviewById);
router.get("/replies/:reviewId", getAReviewwithReplies);
router.get("/reply", getAllReviewsWithReplies);
router.put('/acknowledge/:listingId', passport.authenticate("jwt", { session: false }), acknowledgeReview)
router.get("/", getAllReviews);




module.exports = router;
