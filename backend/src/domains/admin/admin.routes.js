const express = require('express');
const router = express.Router();

const {getABusiness, getAService, getAllBusinesses, getAllReviews, getAllServices, getAllUsers, getClaim, createAdmin, approveBusiness, approveClaim, approveService, updateAdminPassword, updateBusinessPrice, updateServicePrice, getAllReviewers, deleteBusiness, deleteReviews, deleteService, deleteUser} = require('./admin.controller')




router.get('/service', getAService);
router.get('/business', getABusiness);
router.get('/businesses', getAllBusinesses);
router.get('/services', getAllServices);
router.get('/reviews', getAllReviews);
router.get('/users', getAllUsers);
router.get('/claim', getClaim);
router.get('/reviewers', getAllReviewers)
router.post('/createAdmin', createAdmin);
router.post('/approveBusiness/:id', approveBusiness);
router.post("/approveClaim/:id", approveClaim);
router.post("/approveService/:id", approveService);
router.post('/updateAdminPassword', updateAdminPassword);
router.post('/updateBusinessPrice', updateBusinessPrice);
router.post("/updateServicePrice", updateServicePrice);
router.delete('/business/:id', deleteBusiness);
router.delete('/reviews/:id', deleteReviews);
router.delete('/service/:id', deleteService);
router.delete('/user/:id', deleteUser);

module.exports = router;