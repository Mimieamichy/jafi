const Review = require("./review.model");
const User = require("../user/user.model");
const jwt = require("jsonwebtoken");
const Service = require("../service/service.model");
const Business = require("../business/business.model");



exports.registerReviewerWithGoogle = async (googleUser) => {
    const { email, displayName } = googleUser;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const token = jwt.sign(
            { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );
        return { message: "Login successful", token };
    }

    // Register new user
    const newUser = await User.create({
        email,
        password: "", // No password since it's Google login
        role: "reviewer",
        name: displayName,
    });

    // Generate token
    const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: displayName, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    return { message: "Reviewer registered successfully", token };
}

exports.createReview = async (userId, entityId, rating, comment, user_name) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    let listingId = null;
    let listingName = null;

    if (entityId) {
        const [prefix, id] = entityId.split("_");
        listingId = entityId;

        if (prefix === "ser") {
            const service = await Service.findOne({ where: { id } });
            if (!service) {
                throw new Error("Service not found");
            }

            // Prevent duplicate reviews for the same service by the same user
            const existingReview = await Review.findOne({
                where: {
                    userId,
                    listingId,
                },
            });

            if (existingReview) {
                throw new Error("You cannot review this service more than once");
            }

            listingName = service.service_name;

        } else if (prefix === "bus") {
            const business = await Business.findOne({ where: { id } });
            if (!business) {
                throw new Error("Business not found");
            }

            // Prevent duplicate reviews for the same business by the same user
            const existingReview = await Business.findOne({
                where: {
                    userId,
                    listingId,
                },
            });

            if (existingReview) {
                throw new Error("You cannot review this business more than once");
            }

            listingName = business.name;
        } else {
            throw new Error("Invalid entity type");
        }
    }

    const review = await Review.create({
        userId,
        user_name, // Google Profile Name
        comment,
        star_rating: rating,
        listingId,
        listingName,
    });

    return review;
};


exports.updateReview = async (reviewId, userId, rating, comment) => {
    const review = await Review.findOne({ where: { id: reviewId, userId } });
    if (!review) throw new Error("Review not found or unauthorized");

    review.comment = comment
    review.star_rating = rating;

    await review.save();
    return review;
};

exports.deleteReview = async (reviewId, userId) => {
    const review = await Review.findOne({ where: { id: reviewId, userId } });
    if (!review) throw new Error("Review not found or unauthorized");

    await review.destroy();
    return { message: "Review deleted successfully" };
};

exports.getAllReviews = async () => {
    return await Review.findAll({ include: [{ model: User, attributes: ["id", "email", "name", "role"] }] });
};

exports.searchReviewsByListingName = async (listingName) => {
    const reviews = await Review.findAll({
        where: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("listingName")),
            {
                [Op.like]: `%${listingName.toLowerCase()}%`,
            }
        ),
        order: [["createdAt", "DESC"]],
    });

    if (!reviews || reviews.length === 0) {
        throw new Error("No reviews found for this listing");
    }

    return reviews;
};

exports.getReviewById = async (reviewId) => {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new Error("Review not found");
    return review;
};

exports.getReviewsForListings = async (listingId) => {
    return await Review.findAll({
        where: { listingId },
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "name", "email", "role"],
            },
        ],
    });
};

exports.getReviewsByUser = async (userId) => {
    return await Review.findAll({ where: { userId } });
};
