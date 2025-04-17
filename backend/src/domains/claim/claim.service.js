const Business = require("../business/business.model");
const User = require("../user/user.model");
const Claim = require("./claim.model");
const PaymentService = require("../payments/payments.service");




exports.createClaim = async (businessId, email, phone, proof) => {
  console.log(businessId, email, phone, proof);
  const business = await Business.findByPk(businessId);
  if (!business || business.claim === true) {
    return { message: "Business not available for claim"};
  }

  const user = await User.findOne({ where: { email } });
  if (user) {
    return { message:"User already exists"};
  }

  const name = business.name;
  const role = "business";
  const claim = await Claim.create({ businessId, email, phone, proof });
  await User.create({ email, name, role });
  return { message: "Claim submitted", claim };
};

exports.getClaims = async () => {
  const claims = await Claim.findAll();
  res.status(200).json(claims);
};

exports.getAClaim = async (claimId) => {
  const claim = await Claim.findByPk(claimId);
  if (!claim) {
    throw new Error("Claim not found");
  }
  return claim;
};

exports.payForClaim = async (businessId, amount, transaction) => {
  const claim = await Claim.findOne({
    where: { id: businessId },
    include: [{ model: Business, attributes: ["userId", "email", "name"] }],
    transaction,
  });

  if (!claim || !claim.Business) {
    throw new Error("Claim not found or does not have an associated business.");
  }

  const userId = claim.Business.userId;
  const entity_type = "claim";

  console.log(userId, businessId, entity_type, amount);
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
