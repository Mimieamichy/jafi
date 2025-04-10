const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaims,
  getAClaim,
  payForClaim,
  verifyClaimPayment,
} = require("./claim.controller");

//public routes
router.post('/:businessId', createClaim)
router.post('/pay/:businessId', payForClaim);
router.get('/verify/:pay_ref', verifyClaimPayment);
router.get('/', getClaims);
router.get('/:id', getAClaim);

module.exports = router;
