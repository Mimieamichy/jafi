const PaymentService = require("../payments/payments.service");
const { Op } = require("sequelize");
const {Business, User, Claim} = require('../../models/index')



exports.createClaim = async (businessId, email, phone, proof) => {
  const business = await Business.findByPk(businessId);
  if (!business || business.claim === true) {
    throw new Error("Business not available for claim")
  }

  const user = await User.findOne({ where: { email } });
  if (user) {
    return { message: "User already exists"};
  }

  const existingClaim = await Claim.findOne({ where: { businessId } });
  if (existingClaim) {
    return { message: "A pending claim already exists for this business"};
  }

  const name = business.name;
  const role = "business";
  const businessType = business.businessType;
  const businessName = business.name;
  const claim = await Claim.create({ businessId, email, phone, proof, businessType, businessName });
  await User.create({ email, name, role });
  return { message: "Claim submitted", claim };
};

exports.getAllClaims = async (searchTerm, offset, limit) => {
  const searchFilter = searchTerm
    ? {
        [Op.or]: [
          { email: { [Op.like]: `%${searchTerm}%` } },
        ],
      }
    : {};

  const { count, rows } = await Claim.findAndCountAll({
    where: searchFilter,
    include: [
      {
        model: Business,
        attributes: ["name", "category"], // Add more fields if necessary
      },
    ],
    order: [["createdAt", "DESC"]],
    offset,
    limit,
  });

  return { claims: rows};
};

exports.getAClaim = async (claimId) => {
  const claim = await Claim.findByPk(claimId);
  if (!claim) {
    throw new Error("Claim not found");
  }
  return claim;
};

exports.payForClaim = async (businessId, claimId, amount, transaction) => {
  const claim = await Claim.findOne({
    where: { businessId: businessId, id: claimId },
    include: [{ model: Business, attributes: ["userId", "email", "name"] }],
    transaction,
  });


  if (!claim || !claim.Business) {
    throw new Error("Claim not found or does not have an associated business.");
  }

  const userId = claim.Business.userId;
  const entity_type = "claim";

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
