const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  verifyToken,
  getProfile,
  updateProfile,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/verify', protect, verifyToken);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;