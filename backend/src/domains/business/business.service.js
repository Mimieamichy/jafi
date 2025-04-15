const Business = require("./business.model");
const User = require("../user/user.model");
const PaymentService = require("../payments/payments.service");
const { generatePassword } = require("../../utils/generatePassword");

exports.registerBusiness = async (businessData) => {
  const existingBusiness = await Business.findOne({
    where: { email: businessData.email },
  });

  const existingUser = await User.findOne({
    where: { email: businessData.email },
  });

  // Prevent duplicate business or user
  if (existingBusiness) {
    throw new Error("Business already exists with this email");
  }

  // If user exists and is not admin/superadmin, prevent business creation
  if (existingUser) {
    if (existingUser.role !== "admin" && existingUser.role !== "superadmin") {
      throw new Error("Only admins can create a new business with an existing user");
    }

    // Proceed to create business for existing admin/superadmin user
    const newBusiness = await Business.create({
      ...businessData,
      userId: existingUser.id,
      status: "verified",
      claimed: false,
    });

    return {
      user: existingUser,
      newBusiness,
      plainPassword: null, // No new user created, so no plain password
    };
  }

  // If no user exists, create new user and business
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

exports.getAllBusinesses = async () => {
  const businesses = await Business.findAll({
    include: {
      model: User,
      attributes: ["id", "name", "email", "role"],
    },
  });

  if (!businesses || businesses.length === 0) {
    throw new Error("No businesses found");
  }

  return businesses;
};

exports.updateBusiness = async (businessId, userId, businessData, password, email) => {
  const business = await Business.findByPk(businessId);
  if (!business) throw new Error("Service not found");

  if (business.userId !== userId) throw new Error("Unauthorized to update this business");

  let finalPassword = password;

  if (!password || password.trim() === "") {
      const user = await User.findByPk(userId, {
          attributes: ["password"]
      });
      if (!user) throw new Error("User not found");
      finalPassword = user.password;
  } else {
    const { hashedPassword } = await generatePassword(password);
    finalPassword = hashedPassword;
  }

  console.log(finalPassword)
  await User.update(
      { password: finalPassword, email: email },
      { where: { id: userId } }
  );

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
  const business = await Business.findOne({ where: { userId } });
  if (!business) throw new Error("Business not found");

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
