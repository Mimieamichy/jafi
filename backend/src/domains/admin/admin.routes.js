const express = require('express');
const router = express.Router();

const {getABusiness, getAService, getAllBusinesses, getAllReviews, getAllServices, getAllUsers, getClaim, createAdmin, approveBusiness, approveClaim, approveService, updateAdminPassword, updateBusinessPrice, updateServicePrice, getAllReviewers} = require('./admin.controller')




router.get('/service', getAService);
router.get('/business', getABusiness);
router.get('/businesses', getAllBusinesses);
router.get('/services', getAllServices);
router.get('/reviews', getAllReviews);
router.get('/users', getAllUsers);
router.get('/claim', getClaim);
router.get('/reviewers', getAllReviewers)
router.post('/createAdmin', createAdmin);
router.post('/approveBusiness', approveBusiness);
router.post('/approveClaim', approveClaim);
router.post('/approveService', approveService);
router.post('/updateAdminPassword', updateAdminPassword);
router.post('/updateBusinessPrice', updateBusinessPrice);
router.post("/updateServicePrice", updateServicePrice);


module.exports = router;