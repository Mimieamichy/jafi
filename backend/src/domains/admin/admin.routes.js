const express = require('express');
const router = express.Router();

const {getABusiness, getAService, getAllBusinesses, getAllReviews, getAllServices, getAllUsers, getClaim, createAdmin, approveBusiness, approveClaim, approveService, updateAdminPassword, updateBusinessPremium, updateBusinessEnterprise, updateServicePrice, getAllReviewers, deleteBusiness, deleteReview, deleteService, deleteUser, addBusiness, deleteReviewer, getMyBusiness, getAllClaims, updateMyBusiness, getPremiumPrice, getEnterprisePrice, getServicePrice, getAdminCount, addCategory, deleteCategory, getPremiumCategories, getEnterpriseCategories, transferBusiness, exportUsers, exportBusinesses, exportServices, exportReviewers, exportTransactions} = require('./admin.controller')


const { cloudUpload } = require("../../application/middlewares/cloudinary");


router.get('/premiumPrice', getPremiumPrice)
router.get('/enterprisePrice', getEnterprisePrice)
router.get("/servicePrice", getServicePrice);
router.get("/premiumCategories", getPremiumCategories);
router.get("/enterpriseCategories", getEnterpriseCategories);



const { authenticate } = require('../../application/middlewares/authenticate');
const { authorize } = require('../../application/middlewares/authorize');



router.use(authenticate, authorize(["admin", "superadmin"])); 
router.post('/addBusiness', cloudUpload, addBusiness)
router.get("/myBusiness", getMyBusiness);
router.put('/myBusiness/:id', cloudUpload, updateMyBusiness)
router.put('/updateAdminPassword', updateAdminPassword);




router.use(authenticate, authorize(["superadmin"])); 
router.get('/service/:id', getAService);
router.get('/business/:id', getABusiness);
router.get('/businesses', getAllBusinesses);
router.get('/services', getAllServices);
router.get('/reviews', getAllReviews);

router.get('/claim', getClaim);
router.get('/claims', getAllClaims);
router.get('/reviewers', getAllReviewers)
router.post('/createAdmin', createAdmin);
router.post('/approveBusiness/:id', approveBusiness);
router.post("/approveClaim/:id", approveClaim);
router.post("/approveService/:id", approveService);
router.put('/enterprisePrice', updateBusinessEnterprise);
router.put('/premiumPrice', updateBusinessPremium);
router.put("/updateServicePrice", updateServicePrice);
router.delete('/deleteBusiness/:id', deleteBusiness);
router.delete('/deleteReview/:id', deleteReview);
router.delete('/deleteReviewer/:id', deleteReviewer);
router.delete('/deleteService/:id', deleteService);
router.delete('/user/:id', deleteUser);
router.post('/transfer/:userId', transferBusiness);
router.get('/adminCount', getAdminCount)
router.post('/addCategory', addCategory)
router.get('/users', getAllUsers);
router.delete('/deleteCategory', deleteCategory)




//export table data as CSV
router.get('/exportUsers', exportUsers);
router.get('/exportBusinesses', exportBusinesses);
router.get('/exportServices', exportServices);
router.get('/exportReviews', exportReviewers);
router.get('/exportTransactions', exportTransactions);


module.exports = router;