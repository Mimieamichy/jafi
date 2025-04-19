const express = require('express');
const router = express.Router();
const {
  createClaim,
  getAllClaims,
  getAClaim,
  payForClaim,
  verifyClaimPayment,
} = require("./claim.controller");
const uploadPob = require("../../application/middlewares/multer");

//public routes
router.post('/:businessId', uploadPob.fields([{ name: 'pob', maxCount: 1 }]), createClaim)
router.post("/pay/:businessId/:claimId", payForClaim);
router.get('/verify/:pay_ref', verifyClaimPayment);
router.get('/:id', getAClaim);
router.get('/', getAllClaims);

module.exports = router;
