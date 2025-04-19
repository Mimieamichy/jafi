const claimService = require("./claim.service");
const sequelize = require('../../config/database')


exports.createClaim = async (req, res) => {
  try {
    const id = req.params.businessId;
    const { email, phone } = req.body;

    const file = req.files?.["pob"]?.[0];
    if (!file) {
      return res.status(400).json({ message: "Proof of business (pob) is required" });
    }

    const proofUrl = `${req.protocol}://${req.get('host')}/uploads/pob/${file.filename}`;
    
    const response = await claimService.createClaim(id, email, phone, proofUrl);
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
};



exports.getAllClaims = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const claims = await claimService.getAllClaims(searchTerm, offset, limit);
    res.status(200).json(claims);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


exports.getAClaim = async (req, res) => {
  const claimId = req.params.id;
  try {
    const claims = await claimService.getAClaim(claimId);
    res.status(200).json(claims);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.payForClaim = async (req, res) => {
  const transaction = await sequelize.transaction();
  const amount = req.body.amount;
  const businessId = req.params.businessId
  const claimId = req.params.claimId

  try {
    const response = await claimService.payForClaim(businessId, claimId, amount, transaction);
    await transaction.commit();
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    await transaction.rollback();
    console.log(error)
    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.verifyClaimPayment = async (req, res) => {
  const { pay_ref } = req.params;
  try {
    const response = await claimService.verifyPayment(pay_ref);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


