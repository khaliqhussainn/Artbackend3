// authRoute.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController'); 
const adminAuthController = require('../controller/adminAuthController');
const authMiddleware = require('../middleware/authMiddleware');
const { resetAdminPassword } = require('../controller/adminPasswordController');

// User authentication routes
router.post('/signup', authController.register);
router.post('/signin', authController.login);

// Admin authentication routes
// IMPORTANT: Remove middleware from admin login route
router.post('/admin/signin', adminAuthController.adminLogin);

// Other admin routes with protection
router.post('/create-admin', authMiddleware.isAdmin, adminAuthController.createAdmin);
router.get('/admin/profile', authMiddleware.verifyToken, adminAuthController.getAdminProfile);
router.get('/admin/verify', authMiddleware.verifyToken, adminAuthController.verifyAdminStatus);


// This route should only be available in development or with strict security
if (process.env.NODE_ENV === 'development') {
    router.post('/reset-admin-password', resetAdminPassword);
  }
  
module.exports = router;