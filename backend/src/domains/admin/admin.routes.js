const express = require('express');
const router = express.Router();

const {getABusiness, getAService, getAllBusinesses, getAllReviews, getAllServices, getAllUsers, getClaim, createAdmin, approveBusiness, approveClaim, approveService, updateAdminPassword, updateBusinessPrice, updateServicePrice, getAllReviewers, deleteBusiness, deleteReview, deleteService, deleteUser, addBusiness, deleteReviewer, getMyBusiness, getClaims, updateMyBusiness, getBusinessPrice, getServicePrice} = require('./admin.controller')


const { uploadMiddleware } = require("../../application/middlewares/cloudinary");



router.get('/businessPrice', getBusinessPrice)
router.get("/servicePrice", getServicePrice);
const { authenticate } = require('../../application/middlewares/authenticate');
const { authorize } = require('../../application/middlewares/authorize');



router.use(authenticate, authorize(["admin", "superadmin"])); 
router.post('/addBusiness', uploadMiddleware, addBusiness)
router.get("/myBusiness", getMyBusiness);
router.put('/myBusiness/:id', uploadMiddleware, updateMyBusiness)
router.post('/updateAdminPassword', updateAdminPassword);




router.use(authenticate, authorize(["superadmin"])); 
router.get('/service/:id', getAService);
router.get('/business/:id', getABusiness);
router.get('/businesses', getAllBusinesses);
router.get('/services', getAllServices);
router.get('/reviews', getAllReviews);
router.get('/users', getAllUsers);
router.get('/claim', getClaim);
router.get('/claims', getClaims);
router.get('/reviewers', getAllReviewers)
router.post('/createAdmin', createAdmin);
router.post('/approveBusiness/:id', approveBusiness);
router.post("/approveClaim/:id", approveClaim);
router.post("/approveService/:id", approveService);
router.put('/updateBusinessPrice', updateBusinessPrice);
router.put("/updateServicePrice", updateServicePrice);
router.delete('/deleteBusiness/:id', deleteBusiness);
router.delete('/deleteReview/:id', deleteReview);
router.delete('/deleteReviewer/:id', deleteReviewer);
router.delete('/deleteService/:id', deleteService);
router.delete('/user/:id', deleteUser);


module.exports = router;