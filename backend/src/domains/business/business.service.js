const PaymentService = require("../payments/payments.service");
const { generatePassword } = require("../../utils/generatePassword")
const bcrypt = require("bcryptjs")
const { Op, fn, col } = require("sequelize");
const { Business, User, Review } = require('../../models/index')

exports.registerBusiness = async (businessData) => {
  const existingUser = await User.findOne({
    where: { email: businessData.email },
  });

  // No user – enforce unique business email
  const existingBusiness = await Business.findOne({
    where: { email: businessData.email },
  });

  if (existingBusiness || existingUser) {
    throw new Error("User already exists with this email");
  }

  const { plainPassword, hashedPassword } = await generatePassword();

  const newUser = await User.create({
    email: businessData.email,
    password: hashedPassword,
    role: "business",
    name: businessData.name,
  });

  const newBusiness = await Business.create({
    ...businessData,
    userId: newUser.id,
    status: "pending",
    claimed: true,
  });

  return {
    user: newUser,
    newBusiness,
    plainPassword,
  };
};

exports.getABusiness = async (businessId) => {
  const business = await Business.findByPk(businessId, {
    include: {
      model: User,
      as: 'user',
      attributes: ["id", "name", "email", "role"],
    },
  });

  if (!business) throw new Error("Business not found");

  return business;
};

exports.getAllBusinesses = async (offset, limit, page) => {
  const { count, rows: businesses } = await Business.findAndCountAll({
    include: {
      model: User,
      as: "user",
      attributes: ["id", "name", "email", "role"],
    },
    where: {
      status: "verified",
    },
    order: [["createdAt", "DESC"]],
    offset,
    limit,
  });

  if (!businesses || businesses.length === 0) {
    throw new Error("No businesses found");
  }

  return {
    data: businesses.map(item => item.toJSON()),
    meta: { page, limit, total: count },
  };
};

exports.updateBusiness = async (businessId, userId, businessData, password, email) => {
  const business = await Business.findByPk(businessId);
  if (!business) throw new Error("Business not found");

  if (business.userId !== userId) throw new Error("Unauthorized to update this business");

  // Find the user
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Only hash and update password if it's defined and not empty
  const updatedFields = { email };

  if (password && password.trim() !== "") {
    updatedFields.password = await bcrypt.hash(password, 10);
  }

  // Update user record
  await User.update(updatedFields, { where: { id: userId } });

  // Update business
  await Business.update(
    { ...businessData },
    { where: { id: businessId } }
  );
  const updatedBusiness = await Business.findByPk(businessId);

  return updatedBusiness;
};

exports.payForBusiness = async (businessId, amount, transaction) => {
  const business = await Business.findOne({
    where: { id: businessId },
    include: [{ model: User, as: 'user', attributes: ["id", "email", "name", "role"] }],
    transaction,
  });

  const businessUser = business.user.dataValues
  if (!business || !businessUser) {
    throw new Error("Business not found or does not have an associated user.");
  }


  const userId = businessUser.id;
  const entity_type = "business";

  // Create payment
  const response = await PaymentService.createPayment(
    userId,
    businessId,
    entity_type,
    amount,
    { transaction }
  );
  // Make payment
  const paymentDetails = await PaymentService.makePayment(response.id, {
    transaction,
  });

  return { response, paymentDetails };
};

exports.verifyPayment = async (paymentReference) => {
  const paymentResponse = await PaymentService.verifyPayment(paymentReference);

  return paymentResponse;
};

exports.getBusinessByUserId = async (userId) => {
  const business = await Business.findAll({
    where: { userId, status: "verified" },
    order: [["createdAt", "DESC"]],
  });

  if (business.length === 0) throw new Error("No business found for the given user.");

  return business;
};


exports.deleteBusiness = async (businessId, userId) => {
  if (userId === undefined || userId !== req.user.id) {
    throw new Error("Unauthorized to access this business");
  }
  const business = await Business.findByPk(businessId);

  if (!business) throw new Error("Business not found");

  // Check if the user is authorized to delete the business
  if (business.userId !== userId)
    throw new Error("Unauthorized to delete this business");

  // Find the corresponding user based on userId
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Delete the business and corresponding user
  await business.destroy();
  await user.destroy();

  return { message: "Business deleted successfully" };
};




exports.getBusinessByCategory = async (category, offset, limit, page, filter) => {
  // 1. Fetch ALL matching businesses (we'll sort & paginate in JS)
  const businesses = await Business.findAll({
    where: {
      category: { [Op.like]: `%${category}%` },
      status: "verified",
    },
    attributes: [
      "id",
      "name",
      "address",
      "category",
      "average_rating",
      "createdAt",
    ],
    raw: true,
  });

  if (!businesses.length) {
    return { message: "No businesses found for this category" };
  }

  // 2. Total count before pagination
  const total = businesses.length;

  // 3. Get review counts for these businesses
  const listingIds = businesses.map((b) => `bus_${b.id}`);
  const counts = await Review.findAll({
    where: { listingId: { [Op.in]: listingIds } },
    attributes: [
      "listingId",
      [fn("COUNT", col("id")), "reviewCount"],
    ],
    group: ["listingId"],
    raw: true,
  });
  const countMap = counts.reduce((m, r) => {
    m[r.listingId] = parseInt(r.reviewCount, 10);
    return m;
  }, {});

  // 4. Annotate & normalize fields
  const annotated = businesses.map((b) => ({
    ...b,
    average_rating: parseFloat(b.average_rating || 0),
    reviewCount: countMap[`bus_${b.id}`] || 0,
  }));

  // 5. Sort according to filter
  annotated.sort((a, b) => {
    switch (filter) {
      case "highestRated":
        return b.average_rating - a.average_rating;
      case "highestReviewed":
        return b.reviewCount - a.reviewCount;
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "mostRecent":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // 6. Paginate in-memory
  const data = annotated.slice(offset, offset + limit);

  return {
    data,
    meta: { page, limit, total },
  };
};
