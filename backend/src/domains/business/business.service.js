const Business = require("./business.model");
const User = require("../user/user.model");
const PaymentService = require("../payments/payments.service");
const bcrypt = require("bcryptjs")
const {Op} = require('sequelize')

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
      attributes: ["id", "name", "email", "role"],
    },
  });

  if (!business) throw new Error("Business not found");

  return business;
};

exports.getAllBusinesses = async (searchTerm, offset, limit) => {
  const businesses = await Business.findAll({
    include: {
      model: User,
      attributes: ["id", "name", "email", "role"],
    },
    order: [["createdAt", "DESC"]],
    offset,
    limit,
  });

  if (!businesses || businesses.length === 0) {
    throw new Error("No businesses found");
  }

  return businesses;
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
  business.set(businessData);
  await business.save();

  return business;
};

exports.payForBusiness = async (businessId, amount, transaction) => {
  const business = await Business.findOne({
    where: { id: businessId },
    include: [{ model: User, attributes: ["id", "email", "name", "role"] }],
    transaction,
  });

  if (!business || !business.User) {
    throw new Error("Business not found or does not have an associated user.");
  }

  const userId = business.User.id;
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
    where: { userId },
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


exports.getBusinessByCategory = async (category) => {
  const businesses = await Business.findAll({
    where: {
      category: {
        [Op.like]: `%${category}%`,
      },
    },  
    order: [["createdAt", "DESC"]],
    attributes: {
      include: ["id", "name", "address", "category", "average_rating"],
    },

  });

  if (!businesses || businesses.length === 0) {
    return {message: "No businesses found for this category"};
  }

  return { message: "Businesses found", businesses };
}