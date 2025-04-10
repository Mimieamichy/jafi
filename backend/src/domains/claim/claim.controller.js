const claimService = require("../services/claim.service");


exports.createClaim = async (req, res) => {
    try {
        const {businessId} = req
        const { pob, email, phone_number } = req.body;

      const claim = await claimService.createClaim(businessId, email, phone_number, pob);
      res.status(201).json(claim);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};



exports.getClaims = async (req, res) => {
    try {
      const claims = await claimService.getClaims();
      res.status(200).json(claims);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


exports.getAClaim = async (req, res) => {
    const claimId = req.params.id;
    try {
        const claims = await claimService.getAClaim(claimId);
        res.status(200).json(claims);
      } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
}

exports.verifyClaimPayment = async (req, res) => {
  const { pay_ref } = req.params;
  try {
    const response = await claimService.verifyPayment(pay_ref);
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};


