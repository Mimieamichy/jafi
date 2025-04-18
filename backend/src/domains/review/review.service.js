const Review = require("./review.model");
const User = require("../user/user.model");
const jwt = require("jsonwebtoken");
const Service = require("../service/service.model");
const Business = require("../business/business.model");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");



exports.registerReviewerWithGoogle = async (googleUser) => {
  const { email, displayName } = googleUser;

  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    if (existingUser.role !== "reviewer") {
      return {message: "User already exists with a different role"}
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      },
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

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );
  return { message: "Reviewer registered successfully", token };
};

exports.createReview = async (userId, entityId, rating, comment, user_name, images) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  let listingId = null;
  let listingName = null;
  let listingType = null;
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

      listingName = service.name;
      listingType = "service";

    } else if (prefix === "bus") {
      const business = await Business.findOne({ where: { id } });
      if (!business) throw new Error("Business not found");

      const existingReview = await Review.findOne({ where: { userId, listingId } });
      if (existingReview) throw new Error("You cannot review this business more than once");

      listingName = business.name;
      listingType = "business";

    } else {
      throw new Error("Invalid entity type");
    }
  }

  // Start transaction
  const result = await sequelize.transaction(async (t) => {
    // Create review inside transaction
    const review = await Review.create(
      {
        userId,
        user_name,
        comment,
        star_rating: rating,
        listingId,
        listingName,
        listingType,
        images
      },
      { transaction: t }
    );

    // Recalculate averageRating and update the parent entity
    const allReviews = await Review.findAll({ 
      where: { listingId },
      transaction: t 
    });
    
    const starRatings = allReviews.map(review => review.star_rating);
    const total = starRatings.reduce((sum, rating) => sum + rating, 0);
    const average = starRatings.length > 0 ? total / starRatings.length : 0;
    const averageRating = average.toFixed(1);

    if (prefix === "ser") {
      await Service.update(
        { average_rating: averageRating },
        { 
          where: { id },
          transaction: t 
        }
      );
    } else if (prefix === "bus") {
      await Business.update(
        { average_rating: averageRating },
        { 
          where: { id },
          transaction: t 
        }
      );
    }

    return review;
  });

  return result;
};

exports.updateReview = async (reviewId, userId, comment) => {
  const review = await Review.findOne({ where: { id: reviewId, userId } });
  if (!review) throw new Error("Review not found or unauthorized");

  review.comment = comment
  await review.save();
  return review;
};

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({ where: { id: reviewId, userId } });
  if (!review) throw new Error("Review not found or unauthorized");

  await review.destroy();
  return { message: "Review deleted successfully" };
};

exports.getAllReviews = async (searchTerm = "", offset = 0, limit = 10) => {
  const whereClause = searchTerm
    ? {
        [Op.or]: [
          { reviewText: { [Op.like]: `%${searchTerm}%` } },
          { rating: { [Op.like]: `%${searchTerm}%` } },
        ],
      }
    : {};

  const { count, rows } = await Review.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        attributes: ["id", "email", "name", "role"],
      },
    ],
    order: [["createdAt", "DESC"]],
    offset,
    limit,
  });

  if (count === 0) {
    throw new Error("No reviews found");
  }

  const enrichedReviews = await Promise.all(
    rows.map(async (review) => {
      if (review.listingType === "business") {
        review.dataValues.listing = await Business.findOne({
          where: { uniqueId: review.listingId },
        });
      } else if (review.listingType === "service") {
        review.dataValues.listing = await Service.findOne({
          where: { uniqueId: review.listingId },
        });
      }
      return review;
    })
  );

  return {
    enrichedReviews,
  };
};


exports.searchReviews = async (searchQuery) => {
    let serviceIds = [];
    let businessIds = [];

    if (searchQuery) {
        const serviceResults = await Service.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchQuery}%` } },
                    { category: { [Op.like]: `%${searchQuery}%` } },
                ],
            },
            attributes: ['id'],
        });

        const businessResults = await Business.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchQuery}%` } },
                    { category: { [Op.like]: `%${searchQuery}%` } },
                ],
            },
            attributes: ['id'],
        });

        serviceIds = serviceResults.map(s => s.id);
        businessIds = businessResults.map(b => b.id);
    }

    const reviews = await Review.findAll({
        where: {
            [Op.or]: [
                { listingType: 'service', listingId: { [Op.in]: serviceIds } },
                { listingType: 'business', listingId: { [Op.in]: businessIds } },
            ],
        },
        order: [['createdAt', 'DESC']],
    });

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
        attributes: ["id", "name", "email", "role"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

exports.getReviewsByUser = async (userId) => {
  const userReviews = await Review.findAll({ where: { userId } });
  if (!userReviews || userReviews.length === 0) {
    throw new Error("No reviews found for this user");
  }
  return userReviews;
};

exports.getAReviewwithReplies = async (reviewId) => {
  const replies = await Review.findAll({
    where: { id: reviewId },
    attributes: ["id", "comment", "createdAt", "reply"],
    include: [
      {
        model: User,
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
      },
      {
        model: Review,
        include: [
          {
            model: User,
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]], // Order reviews by creation date (descending)
  });

  if (!reviews) throw new Error("No reviews found");

  return reviews;
};


exports.acknowledgeReview = async (listingId) => {
  await Review.update(
    { isNew: false }, // values to update
    {
      where: {
        listingId,
        isNew: true
      }
    }
  );

    console.log("Review acknowledged");
    return { message: 'Marked as read' };
};

