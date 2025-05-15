const jwt = require("jsonwebtoken");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");
const {Review, User, Service , Business} = require('../../models/index')
const { generatePassword } = require("../../utils/generatePassword")
const { sendMail } = require("../../utils/sendEmail");


exports.registerReviewerWithOAuth = async (oauthUser, provider) => {
  // 1. Normalize fields across providers
  let email, name, profilePic;
  switch (provider) {
    case "google":
    case "facebook":
      // Both Google and Facebook supply these
      email      = oauthUser.email;
      name       = oauthUser.displayName || oauthUser.name;
      profilePic = oauthUser.picture || oauthUser.photos?.[0]?.value || null;
      break;

    case "apple":
      // Apple may supply name in separate fields
      email      = oauthUser.email;
      name       = oauthUser.name || `${oauthUser.firstName || ""} ${oauthUser.lastName || ""}`.trim();
      profilePic = null; // Apple doesn’t give a picture URL
      break;

    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  // 2. Lookup existing user by email
  let user = await User.findOne({ where: { email } });

  if (user) {
    // Update profilePic if changed
    if (profilePic && user.profilePic !== profilePic) {
      await User.update({ profilePic }, { where: { id: user.id } });
      user.profilePic = profilePic;
    }

  } else {
    // 3. Create a new "reviewer" user
    user = await User.create({
      email,
      password: "",       // no local password for OAuth users
      role: "reviewer",
      name,
      profilePic,
    });
  }

  // 4. Sign a JWT
  const token = jwt.sign(
    {
      id:    user.id,
      email: user.email,
      name:  user.name,
      role:  user.role,
      // optionally: provider,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  return {
    message: user._options.isNewRecord
      ? "Reviewer registered successfully"
      : "Login successful",
    token,
  };
};

exports.registerReviewer = async (email, name) => {
  const existingUser = await User.findOne({
      where: { email },
    });
   
  
    if (existingUser || existingReviewer) {
      throw new Error("User already exists with this email");
    }
  
  
    const { plainPassword, hashedPassword } = await generatePassword();
  
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
      role: "reviewer",
      name: name,
    });

    // Send an email notification to the service owner
        const mailContent = `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvmfubqhp/image/upload/v1744291750/jafi_logo_2_png_ktsfqn.png" alt="JAFIAI Logo" style="max-width: 150px;">
        </div>
        <h2 style="color: #333; text-align: center;">Service Approved - Login Details</h2>
        <p style="font-size: 16px; color: #555; text-align: center;">
            Your Registration was successful. You can log in with the details below.
        </p>
        <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 16px; color: #555;">Your password is: <strong>${plainPassword}</strong></p>
            <a href="${process.env.FRONTEND_URL}/signin" 
               style="display: inline-block; padding: 12px 20px; background-color: #5271FF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
               Login Now
            </a>
        </div>
        <p style="font-size: 14px; color: #777777; text-align: center;">
            If you did not request this, please contact support.
        </p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #777; text-align: center;">
            &copy; 2025 JAFIAI. All rights reserved.
        </p>
    </div>`
        await sendMail(email, "JAFI AI User Login details", mailContent);
        return { message: "Reviewer registered successfully", newUser };
}

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

exports.getReviews = async (page, limit, offset, searchQuery, sort) => {
  // 2. If searchQuery, find matching service & business IDs
  let serviceIds = [], businessIds = [];
  if (searchQuery) {
    const [svcs, businesses] = await Promise.all([
      Service.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchQuery}%` } },
            { category: { [Op.like]: `%${searchQuery}%` } },
          ],
        },
        attributes: ["uniqueId"],
        raw: true,
      }),
      Business.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchQuery}%` } },
            { category: { [Op.like]: `%${searchQuery}%` } },
          ],
        },
        attributes: ["uniqueId"],
        raw: true,
      }),
    ]);
    serviceIds = svcs.map(s => s.uniqueId);
    businessIds = businesses.map(b => b.uniqueId);
  }

  // 3. Build review filter
  const where = {};
  if (searchQuery) {
    where[Op.or] = [
      { listingType: "service", listingId: { [Op.in]: serviceIds } },
      { listingType: "business", listingId: { [Op.in]: businessIds } },
    ];
  }

  // 4. Fetch matching reviews with user data
  const reviewsRaw = await Review.findAll({
    where,
    include: [{
      model: User,
      as: "user",
      attributes: ["id", "email", "name", "role"],
    }],
    attributes: [
      "id", "userId", "listingId", "listingType", "listingName", "user_name",
      "comment", "images", "star_rating", "createdAt", "reply"
    ],
    raw: false,
  });

  if (!reviewsRaw.length) {
    return { data: [], meta: { page, limit, total: 0 } };
  }

  // 5. Annotate each review with additional data
  const annotated = await Promise.all(
    reviewsRaw.map(async (rev) => {
      const r = rev.toJSON();
      r.imageCount = Array.isArray(r.images) ? r.images.length : 0;
      r.wordCount = (r.comment.trim().split(/\s+/) || []).length;

      // Attach listing object
      r.listing = r.listingType === "service"
        ? await Service.findOne({ where: { uniqueId: r.listingId } })
        : await Business.findOne({ where: { uniqueId: r.listingId } });

      return r;
    })
  );

  // 6. Sort in-memory based on sort parameter
  annotated.sort((a, b) => {
    switch (sort) {
      case "relevant":
        if (b.imageCount !== a.imageCount) return b.imageCount - a.imageCount;
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

  // 7. Apply pagination
  const total = annotated.length;
  const data = annotated.slice(offset, offset + limit);

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

exports.getReviewsByUser = async (userId, sort, limit, offset, page ) => {
  // 1. Fetch all reviews for this user
  const reviewsRaw = await Review.findAll({
    where: { userId },
    attributes: [
      "id",
      "listingId",
      "listingType",
      "comment",
      "images",
      "star_rating",
      "createdAt",
      "reply",
    ],
    raw: true,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "role"],
      },
    ],
  });


  if (!reviewsRaw.length) {
    return { message: "No reviews found for this user", data: [], meta: { page, limit, total: 0 } };
  }

  // 2. Annotate each review
  const annotated = reviewsRaw.map((r) => {
    const imageCount = Array.isArray(r.images) ? r.images.length : 0;
    const wordCount = r.comment.trim().split(/\s+/).length;
    return { ...r, imageCount, wordCount };
  });

  // 3. Sort
  annotated.sort((a, b) => {
    switch (sort) {
      case "relevant":
        if (b.imageCount !== a.imageCount) return b.imageCount - a.imageCount;
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
  const total = annotated.length;
  const data = annotated.slice(offset, offset + limit);

  return {
    data: data,
    meta: { page, limit, total },
  };
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

