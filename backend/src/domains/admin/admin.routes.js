const express = require('express');
const router = express.Router();

const {getABusiness, getAService, getAllBusinesses, getAllReviews, getAllServices, getAllUsers, getClaim, createAdmin, approveBusiness, approveClaim, approveService, updateAdminPassword, updateBusinessPrice, updateServicePrice, getAllReviewers, deleteBusiness, deleteReview, deleteService, deleteUser, addBusiness} = require('./admin.controller')


const { uploadMiddleware } = require("../../application/middlewares/cloudinary");
const { authenticate } = require('../../application/middlewares/authenticate');
const { authorize } = require('../../application/middlewares/authorize');

router.use(authenticate, authorize(["superadmin"])); 

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
router.delete('/deleteBusiness/:id', deleteBusiness);
router.delete('/deleteReview/:id', deleteReview);
router.delete('/deleteService/:id', deleteService);
router.delete('/user/:id', deleteUser);
router.post('/addBusiness', uploadMiddleware, addBusiness)

module.exports = router;