const express = require('express');
const router = express.Router();
const {
  createClaim,
  getAllClaims,
  getAClaim,
  payForClaim,
  verifyClaimPayment,
} = require("./claim.controller");
const { cloudUpload } = require("../../application/middlewares/cloudinary");


//public routes
router.post('/:businessId', cloudUpload, createClaim)
router.post("/pay/:businessId/:claimId", payForClaim);
router.get('/verify/:pay_ref', verifyClaimPayment);
router.get('/:id', getAClaim);
router.get('/', getAllClaims);

module.exports = router;
