const express = require("express");
const passport = require("passport");
const {googleAuth, googleAuthCallback, createReview, updateReview, deleteReview, getAllReviews, getReviewById, getReviewsForListings,  getReviewsByUser, searchReviewsByListingName, getAReviewwithReplies, getAllReviewsWithReplies, replyToReview} = require("../review/review.controller");

const router = express.Router();

// Google Authentication Routes
router.get("/google", googleAuth); //signup api
router.get("/google-callback", googleAuthCallback);




// Protected Routes
router.get("/user/", passport.authenticate("jwt", { session: false }), getReviewsByUser );
router.post("/:entityId", passport.authenticate("jwt", { session: false }), createReview);
router.put("/:id", passport.authenticate("jwt", { session: false }), updateReview);
router.delete("/:id", passport.authenticate("jwt", { session: false }), deleteReview);



// Public Routes
router.get("/", getAllReviews);
router.get("/entity/:entityId", getReviewsForListings);
router.get("/search", searchReviewsByListingName);
router.get("/:id", getReviewById);
router.get("/replies/:reviewId", getAReviewwithReplies);
router.get("/reply", getAllReviewsWithReplies);





module.exports = router;
