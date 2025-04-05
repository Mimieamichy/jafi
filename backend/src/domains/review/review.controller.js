const ReviewService = require("../review/review.service");
const passport = require("passport");
require("../../config/google");


exports.googleAuth = passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
});
  
exports.googleAuthCallback = async (req, res, next) => {
    passport.authenticate("google", { session: false, failureRedirect: '/' }, async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: "Authentication failed" });
        }

        try {
            const response = await ReviewService.registerReviewerWithGoogle(user);
            const redirectUrl = req.query.redirect || `${process.env.FRONTEND_URL}`
            return res.redirect(`${redirectUrl}?token=${response.token}`);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    })(req, res, next);
};

exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user.id; 
        const entityId = req.params.entityId;
        const user_name = req.user.name;
        const review = await ReviewService.createReview(userId, entityId, rating, comment, user_name);
        return res.status(201).json({ success: true, review });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id; 
        const review = await ReviewService.updateReview(id, userId, rating, comment);
        return res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; 
        await ReviewService.deleteReview(id, userId);
        return res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await ReviewService.getAllReviews();
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await ReviewService.getReviewById(id);
        return res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getReviewsForListings = async (req, res) => {
    try {
        const { entityId } = req.params;
        const reviews = await ReviewService.getReviewsForListings(entityId);
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getReviewsByUser = async (req, res) => {
    try {
        const userId  = req.user.id;
        const reviews = await ReviewService.getReviewsByUser(userId);
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.searchReviewsByListingName = async (req, res) => {
    try {
        const { listingName } = req.query;
        const reviews = await ReviewService.searchReviewsByListingName(listingName);
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

  