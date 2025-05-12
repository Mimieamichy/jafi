const ReviewService = require("../review/review.service");
const passport = require("passport");
require("../../config/google");
const cache = require("../../utils/cache");
const { off } = require("../../app");



exports.googleAuth = async (req, res, next) => {
    const redirect = req.query.redirect || "/";
    const state = Buffer.from(JSON.stringify({ redirect })).toString("base64");

    passport.authenticate("google", {
        scope: ["email", "profile"],
        session: false,
        state
    })(req, res, next)
};

exports.facebookAuth = async (req, res, next) => {
  // 1. Capture where to send the user after login
  const redirect = req.query.redirect || "/";
  const state    = Buffer.from(JSON.stringify({ redirect })).toString("base64");

  // 2. Kick off Facebook OAuth
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
    session: false,
    state,
  })(req, res, next);
};


exports.googleAuthCallback = async (req, res, next) => {
    passport.authenticate("google", { session: false, failureRedirect: '/' }, async (err, user, info) => {
        if (err || !user) {
            console.error("Google authentication error:", err);
            return res.status(401).json({ message: "Authentication failed" });
        }

        try {
            // Generate JWT token for the user
            const response = await ReviewService.registerReviewerWithOAuth(user, 'google');

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

exports.facebookAuthCallback = async (req, res, next) => {
  passport.authenticate(
    "facebook",
    { session: false, failureRedirect: "/" },
    async (err, user, info) => {
      if (err || !user) {
        console.error("Facebook authentication error:", err);
        return res.status(401).json({ message: "Authentication failed" });
      }

      try {
        // Register (or login) via your service and get a JWT
        const response = await ReviewService.registerReviewerWithOAuth(user, 'facebook');

        // Decode optional state param for redirect info
        let redirectState = {};
        try {
          if (req.query.state) {
            redirectState = JSON.parse(
              Buffer.from(req.query.state, "base64").toString()
            );
          }
        } catch (e) {
          console.error("Failed to parse state:", e);
        }

        const redirectPath = redirectState.redirect || "/";
        const url = `${process.env.FRONTEND_URL}${redirectPath}?token=${response.token}`;
        console.log("Redirecting to:", url);

        return res.redirect(url);
      } catch (error) {
        console.error("Error in Facebook callback:", error);
        return res
          .status(error.status || 500)
          .json({ message: error.message });
      }
    }
  )(req, res, next);
};

exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user.id;
        const entityId = req.params.entityId;
        const user_name = req.user.name;
        const images = req.files["reviewImages"] ? req.files["reviewImages"].map((file) => file.path) : [];
        const response = await ReviewService.createReview(userId, entityId, rating, comment, user_name, images);
        cache.flushAll();
        return res.status(201).json(response);
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

        //Delete cacke key
        cache.flushAll();
        const response = await ReviewService.updateReview(id, userId, comment);
        return res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        //Delete cacke key
        cache.flushAll();
        const response = await ReviewService.deleteReview(id, userId);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = req.query.filter || "";
        const offset = (page - 1) * limit;
        const {search} = req.query;

        //Cache the response for 20mins
        const cacheKey = `reviews:page=${page}-limit=${limit}-filter=${filter}-search=${search}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            console.log(`✅ Cache HIT for key: ${cacheKey}`);
            return res.status(200).json(cached);
        }
        const response = await ReviewService.getReviews(page, limit, offset, search, filter);
        cache.set(cacheKey, response);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await ReviewService.getReviewById(id);
        return res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getReviewsForListings = async (req, res) => {
    try {
        const { entityId } = req.params;
        const response = await ReviewService.getReviewsForListings(entityId);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getReviewsByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = req.query.filter || "";
        const offset = (page - 1) * limit;

        const response = await ReviewService.getReviewsByUser(userId, filter, limit , offset, page);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message });
    }
};


exports.getAReviewwithReplies = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const response = await ReviewService.getAReviewwithReplies(reviewId);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

exports.getAllReviewsWithReplies = async (req, res) => {
    try {
        const response = await ReviewService.getAllReviewsWithReplies();
        res.status(200).json(response);
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ message: error.message });
    }
}

exports.acknowledgeReview = async (req, res) => {
    try {
        const { listingId } = req.params;
        const response = await ReviewService.acknowledgeReview(listingId);
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ message: error.message });
    }
}

exports.getAllReviewsByuserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const response = await ReviewService.getAllReviewsByuserId(userId, offset, limit, page);
        return res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}
