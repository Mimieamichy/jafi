const claimService = require("./claim.service");
const sequelize = require('../../config/database')


exports.createClaim = async (req, res) => {
    try {
        const id = req.params.businessId
        const { pob, email, phone } = req.body;

      console.log(id, pob, email, phone);
      const claim = await claimService.createClaim(id, email, phone, pob);
      res.status(201).json(claim);
    } catch (error) {
      console.log(error)
      res.status(error.status || 500).json({ message: error.message });
    }
};



exports.getClaims = async (req, res) => {
    try {
      const claims = await claimService.getClaims();
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
    const businessId = req.params
    try {
        const response = await claimService.payForClaim(transaction, amount, businessId);
        await transaction.commit();
        res.status(200).json(response);
    } catch (error) {
        await transaction.rollback();
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


