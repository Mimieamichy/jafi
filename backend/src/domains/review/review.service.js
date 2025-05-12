const jwt = require("jsonwebtoken");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");
const {Review, User, Service , Business} = require('../../models/index')




exports.registerReviewerWithGoogle = async (googleUser) => {
  const { email, displayName, picture } = googleUser;
  const profilePic = picture || null;


  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {

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
    
    await User.update(
      { profilePic },
      { where: { email } }
    )

    return { message: "Login successful", token };
  }

  // Register new user
  const newUser = await User.create({
    email,
    password: "", // No password since it's Google login
    role: "reviewer",
    name: displayName,
    profilePic
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

    return {message: "Review created successfully", review };
  });

  const resultReview = result
  return {message: resultReview.message, resultReview};
};

exports.updateReview = async (reviewId, userId, comment) => {
  const review = await Review.findOne({ where: { id: reviewId, userId } });
  if (!review) throw new Error("Review not found or unauthorized");

  await Review.update(
    { comment },
    { where: { id: reviewId, userId } }
  )
  const updatedReview = await Review.findByPk(reviewId);
  return {message: "Review updated successfully", review: updatedReview };
};

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({ where: { id: reviewId, userId } });
  if (!review) throw new Error("Review not found or unauthorized");

  await review.destroy();
  return { message: "Review deleted successfully" };
};

exports.getReviews = async (page , limit , searchQuery, sort) => {
  // 1. calc pagination
  const offset = (page - 1) * limit;

  // 2. if searchQuery, find matching service & business IDs
  let serviceIds = [], businessIds = [];
  if (searchQuery) {
    const [svcs, businesses] = await Promise.all([
      Service.findAll({
        where: {
          [Op.or]: [
            { name:     { [Op.like]: `%${searchQuery}%` } },
            { category: { [Op.like]: `%${searchQuery}%` } },
          ],
        },
        attributes: ["uniqueId"],
        raw: true,
      }),
      Business.findAll({
        where: {
          [Op.or]: [
            { name:     { [Op.like]: `%${searchQuery}%` } },
            { category: { [Op.like]: `%${searchQuery}%` } },
          ],
        },
        attributes: ["uniqueId"],
        raw: true,
      }),
    ]);
    serviceIds   = svcs.map(s => s.uniqueId);
    businessIds  = businesses.map(b => b.uniqueId);
  }

  // 3. build review filter
  const where = {};
  if (searchQuery) {
    where[Op.or] = [
      { listingType: "service",  listingId: { [Op.in]: serviceIds  } },
      { listingType: "business", listingId: { [Op.in]: businessIds } },
    ];
  }

  // 4. fetch all matching reviews + user
  const reviewsRaw = await Review.findAll({
    where,
    include: [{
      model: User,
      as: "user",
      attributes: ["id", "email", "name", "role"]
    }],
    attributes: [
      "id","userId","listingId","listingType",
      "comment","images","star_rating","createdAt","reply"
    ],
    raw: false, // so we can use .toJSON() later
  });

  if (!reviewsRaw.length) {
    return { data: [], meta: { page, limit, total: 0 } };
  }

  // 5. annotate each with imageCount, wordCount
  const annotated = await Promise.all(
    reviewsRaw.map(async (rev) => {
      const r = rev.toJSON();
      r.imageCount = Array.isArray(r.images) ? r.images.length : 0;
      r.wordCount  = (r.comment.trim().split(/\s+/) || []).length;

      // attach listing object
      if (r.listingType === "service") {
        r.listing = await Service.findOne({ where: { uniqueId: r.listingId } });
      } else {
        r.listing = await Business.findOne({ where: { uniqueId: r.listingId } });
      }

      return r;
    })
  );

  // 6. sort in-memory
  annotated.sort((a, b) => {
    switch (sort) {
      case "relevant":
        if (b.imageCount !== a.imageCount) return b.imageCount - a.imageCount;
        return b.wordCount  - a.wordCount;
      case "highest":
        return b.star_rating - a.star_rating;
      case "lowest":
        return a.star_rating - b.star_rating;
      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // 7. paginate
  const total = annotated.length;
  const data  = annotated.slice(offset, offset + limit);

  return {
    data,
    meta: { page, limit, total },
  };
};
 
exports.getReviewById = async (reviewId) => {
  const review = await Review.findByPk(reviewId);
  if (!review) throw new Error("Review not found");
  return {message: "Review fetched successfully", review };
};

exports.getReviewsForListings = async (listingId) => {
  const reviews = await Review.findAll({
    where: { listingId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ["id", "name", "email", "role"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return {message: "Reviews fetched successfully", reviews };
};

exports.getReviewsByUser = async (userId) => {
  const reviews = await Review.findAll({ where: { userId } });
  if (!reviews || reviews.length === 0) {
    return {mesage: "No reviews found for this user"};
  }
  return {message: "User reviews fetched successfully", reviews };
};

exports.getAReviewwithReplies = async (reviewId) => {
  const replies = await Review.findAll({
    where: { id: reviewId },
    attributes: ["id", "comment", "createdAt", "reply"],
    include: [
      {
        model: User,
        as: 'user',
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  return {message: "Replies fetched successfully", replies };
};

exports.getAllReviewsWithReplies = async () => {
  const reviews = await Review.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ["id", "name", "email", "role"],
      },
      {
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

  return {message: "All reviews with replies fetched successfully", reviews };
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

    return { message: 'Marked as read' };
};


exports.getAllReviewsByuserId = async (userId, offset, limit, page) => {
  const {count, rows: reviews} = await Review.findAndCountAll({
    where: { userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ["id", "name", "email", "profilePic"],
      },
    ],
    order: [["createdAt", "DESC"]],
    offset,
    limit
  });

  if (!reviews) throw new Error("No reviews found for this user");

  return {
    data: reviews,
    meta: { page, limit, total: count },
};
}


exports.getReviewsByListing = async (listingId, listingType, offset , limit , filter) => {
  // 1. Pull all reviews for that listing
  const reviews = await Review.findAll({
    where: {
      listingId,
      listingType,
    },
    attributes: [
      "id",
      "userId",
      "user_name",
      "comment",
      "images",
      "star_rating",
      "createdAt",
      "reply",
    ],
    raw: true,
  });

  if (!reviews.length) {
    return { message: "No reviews found" };
  }

  // 2. Annotate each with imageCount and wordCount
  const annotated = reviews.map((r) => {
    const imageCount = Array.isArray(r.images) ? r.images.length : 0;
    const wordCount = r.comment.trim().split(/\s+/).length;
    return { ...r, imageCount, wordCount };
  });

  // 3. Sort in-memory
  annotated.filter((a, b) => {
    switch (filter) {
      case "relevant":
        // primary: more images, secondary: longer comment
        if (b.imageCount !== a.imageCount) {
          return b.imageCount - a.imageCount;
        }
        return b.wordCount - a.wordCount;

      case "highest":
        return b.star_rating - a.star_rating;

      case "lowest":
        return a.star_rating - b.star_rating;

      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // 4. Paginate
  const paged = annotated.slice(offset, offset + limit);

  return {
    data: paged,
    meta: {
      total: annotated.length,
      page: Math.floor(offset / limit) + 1,
      limit,
    },
  };
};

