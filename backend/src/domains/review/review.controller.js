const ReviewService = require("../review/review.service");
const passport = require("passport");
require("../../config/google");


exports.googleAuth = async (req, res, next) => {
    const redirect = req.query.redirect || "/";
    const state = Buffer.from(JSON.stringify({ redirect })).toString("base64");

    console.log(req.query)

    passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
    state
})(req, res, next)};
  
exports.googleAuthCallback = async (req, res, next) => {
    passport.authenticate("google", { session: false, failureRedirect: '/' }, async (err, user, info) => {
        if (err || !user) {
            console.error("Google authentication error:", err);
            return res.status(401).json({ success: false, message: "Authentication failed" });
        }

        try {
            // Generate JWT token for the user
            const response = await ReviewService.registerReviewerWithGoogle(user);
            
            // Parse the state parameter to get the redirect URL
            let redirectState = {};
            try {
                if (req.query.state) {
                    redirectState = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
                }
            } catch (e) {
                console.error("Failed to parse state:", e);
            }
            
            const redirectUrl = redirectState.redirect || "/";
            console.log("Redirecting to:", `${process.env.FRONTEND_URL}${redirectUrl}?token=${response.token}`);

            // Redirect back to frontend with token
            return res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}?token=${response.token}`);
        } catch (error) {
            console.error("Error in Google callback:", error);
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
        console.log(error)
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const userId = req.user.id; 
        const review = await ReviewService.updateReview(id, userId, comment);
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
        console.log(error);
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
        console.log(error);
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.searchReviews = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        const reviews = await ReviewService.searchReviews(searchQuery);
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

  
exports.replyToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { comment } = req.body;
        const userId = req.user.id; 
        const user_name = req.user.name;
        const reply = await ReviewService.replyToReview(reviewId, userId, user_name, comment);
        return res.status(201).json({ success: true, reply });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

exports.getAReviewwithReplies = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const replies = await ReviewService.getAReviewwithReplies(reviewId);
        return res.status(200).json({ success: true, replies });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}


exports.getAllReviewsWithReplies = async (req, res) => {
    try {
        const review = await ReviewService.getAllReviewsWithReplies();
        return res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}


exports.acknowledgeReview = async (req, res) => {
    try{
        const { reviewId, userId } = req.params;
        if (userId === req.user.id) {
            const review = await ReviewService.acknowledgeReview(reviewId, userId);
            return res.status(200).json({ success: true, review })
        }  
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}
