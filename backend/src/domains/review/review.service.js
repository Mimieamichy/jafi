const Review = require("./review.model");
const User = require("../user/user.model");
const jwt = require("jsonwebtoken");
const Service = require("../service/service.model");
const Business = require("../business/business.model");
const { where } = require("sequelize");



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
    if (userId === undefined || userId != req.user.id) {
        throw new Error("Unauthorized to access this review");
    }
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
  
    let listingId = null;
    let listingName = null;
    let prefix = null;
    let id = null;
  
    if (entityId) {
      [prefix, id] = entityId.split("_");
      listingId = entityId;
  
      if (prefix === "ser") {
        const service = await Service.findOne({ where: { id } });
        if (!service) throw new Error("Service not found");
  
        const existingReview = await Review.findOne({ where: { userId, listingId } });
        if (existingReview) throw new Error("You cannot review this service more than once");
  
        listingName = service.service_name;
  
      } else if (prefix === "bus") {
        const business = await Business.findOne({ where: { id } });
        if (!business) throw new Error("Business not found");
  
        const existingReview = await Review.findOne({ where: { userId, listingId } });
        if (existingReview) throw new Error("You cannot review this business more than once");
  
        listingName = business.name;
  
      } else {
        throw new Error("Invalid entity type");
      }
    }
  
    const review = await Review.create({
      userId,
      user_name,
      comment,
      star_rating: rating,
      listingId,
      listingName,
    });
  
    // Recalculate averageRating and update the parent entity
    const allReviews = await Review.findAll({ where: { listingId } });
    const starRatings = allReviews.map(review => review.star_rating);
    const total = starRatings.reduce((sum, rating) => sum + rating, 0);
    const average = starRatings.length > 0 ? total / starRatings.length : 0;
    const averageRating = average.toFixed(1);
  

    if (prefix === "ser") {
      await Service.update(
        { average_rating: averageRating },
        { where: { id } }
      );
    } else if (prefix === "bus") {
      await Business.update(
        { average_rating: averageRating },
        { where: { id } }
      );
    }
  
    return review;
};
  
exports.updateReview = async (reviewId, userId, comment) => {    if (userId === undefined || userId != req.user.id) {
        throw new Error("Unauthorized to access this review");
    }
    const review = await Review.findOne({ where: { id: reviewId, userId } });
    if (!review) throw new Error("Review not found or unauthorized");

    review.comment = comment
    await review.save();
    return review;
};

exports.deleteReview = async (reviewId, userId) => {
    if (userId === undefined || userId != req.user.id) {
        throw new Error("Unauthorized to access this review");
    }
    const review = await Review.findOne({ where: { id: reviewId, userId } });
    if (!review) throw new Error("Review not found or unauthorized");

    await review.destroy();
    return { message: "Review deleted successfully" };
};

exports.getAllReviews = async () => {
    return await Review.findAll(
        { where: { listingId, parentReviewId: null }, 
        include: [{ model: User, as: "user", attributes: ["id", "email", "name", "role"] }, 
        {model: Business, as: "business"}, 
        {model: Service, as: "service"}], 
    order: [["createdAt", "DESC"]]});
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
        where: { listingId , parentReviewId: null },
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "name", "email", "role"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

exports.getReviewsByUser = async (userId) => {
    if (userId === undefined || userId != req.user.id) {
        throw new Error("Unauthorized to access this review");
    }
    const userReviews = await Review.findAll({ where: { userId } });
    if (!userReviews || userReviews.length === 0) {
        throw new Error("No reviews found for this user");
    }
    return userReviews;
};


exports.replyToReview = async (reviewId, userId, user_name, comment) => {
    const originalReview = await Review.findByPk(reviewId);
  
    if (!originalReview) throw new Error("Original review not found");
  
    // Check if the user is the business owner or the original reviewer
    const business = await Business.findOne({
      where: { id: originalReview.listingId, userId: userId },
    });

    const service = await Service.findOne({
        where: { id: originalReview.listingId, userId: userId },
      });
  
    if (!business && !service && originalReview.userId !== userId) {
      throw new Error("You are not authorized to reply to this review");
    }
  
    // Create the reply with `replyId` pointing to the original review
    const reply = await Review.create({
      userId,
      listingId: originalReview.listingId,
      listingName: originalReview.listingName,
      user_name: user_name, 
      comment,
      star_rating: originalReview.star_rating, 
      replyId: reviewId, 
    });
  
    return reply;
};

exports.getAReviewwithReplies = async (reviewId) => {
    const replies = await Review.findAll({
      where: { replyId: reviewId }, // Fetch only replies to the given reviewId
      include: [
        {
          model: User,
          as: "user", // User who made the reply
        },
      ],
      order: [["createdAt", "ASC"]],
    });
  
    return replies;
  };

  exports.getAllReviewsWithReplies = async () => {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: "user", // Include user who made the review
        },
        {
          model: Review,
          as: "replies", // Include replies to each review
          include: [
            {
              model: User,
              as: "user", // User who made the reply
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // Order reviews by creation date (descending)
    });
  
    if (!reviews) throw new Error("No reviews found");
  
    return reviews;
  };
  