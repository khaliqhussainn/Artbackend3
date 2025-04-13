const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { authenticate, isAdmin, localVariables } = require("../middleware/authenticate");

// Public routes
router.get('/', userController.getAllUsers);
router.get('/user/:userId', userController.getUserById);
router.get('/generateOTP', userController.verifyUser, userController.generateOTP);
router.get('/verifyOTP', userController.verifyUser, userController.verifyOTP);
router.get('/createResetSession', userController.createResetSession);
router.put('/resetPassword', userController.verifyUser, userController.resetPassword);

// Protected routes - require authentication
router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);
router.post('/address', authenticate, userController.addAddress);
router.put('/address/:addressId', authenticate, userController.updateAddress);
router.delete('/address/:addressId', authenticate, userController.deleteAddress);

module.exports = router;