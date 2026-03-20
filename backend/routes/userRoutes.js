const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} = require('../controller/userController');

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
