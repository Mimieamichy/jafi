const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaims,
  getAClaim,
  payForClaim,
  verifyClaimPayment,
} = require("./claim.controller");
const { uploadMiddleware } = require("../../application/middlewares/cloudinary");

//public routes
router.post('/:businessId', uploadMiddleware, createClaim)
router.post("/pay/:businessId/:claimId", payForClaim);
router.get('/verify/:pay_ref', verifyClaimPayment);
router.get('/', getClaims);
router.get('/:id', getAClaim);

module.exports = router;
