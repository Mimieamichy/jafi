const express = require('express');
const router = express.Router();

const {getABusiness, getAService, getAllBusinesses, getAllReviews, getAllServices, getAllUsers, getClaim, createAdmin, approveBusiness, approveClaim, approveService, updateAdminPassword, updateBusinessPrice, updateServicePrice, getAllReviewers, deleteBusiness, deleteReview, deleteService, deleteUser, addBusiness, deleteReviewer, getMyBusiness, getClaims} = require('./admin.controller')


const { uploadMiddleware } = require("../../application/middlewares/cloudinary");
const { authenticate } = require('../../application/middlewares/authenticate');
const { authorize } = require('../../application/middlewares/authorize');

router.use(authenticate, authorize(["admin", "superadmin"])); 
router.post('/addBusiness', uploadMiddleware, addBusiness)
router.get("/myBusiness", getMyBusiness);
//update my business functionality router.put('/myBusiness/:id, updateMyBusiness)




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
router.post('/updateAdminPassword', updateAdminPassword);
router.post('/updateBusinessPrice', updateBusinessPrice);
router.post("/updateServicePrice", updateServicePrice);
router.delete('/deleteBusiness/:id', deleteBusiness);
router.delete('/deleteReview/:id', deleteReview);
router.delete('/deleteReviewer/:id', deleteReviewer);
router.delete('/deleteService/:id', deleteService);
router.delete('/user/:id', deleteUser);


module.exports = router;