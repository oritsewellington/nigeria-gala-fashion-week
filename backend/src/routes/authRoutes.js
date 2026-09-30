const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.use(protect); // everything below requires auth

router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);
router.post('/create-host', restrictTo('superadmin'), authController.createHost);
router.get('/users', restrictTo('superadmin'), authController.getUsers);
router.patch('/users/:id/status', restrictTo('superadmin'), authController.updateUserStatus);

module.exports = router;
