const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReviews,
  getReviewById,
  getReviewsByMovie,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

// Public routes
router.get('/', getReviews);
router.get('/movie/:movieId', getReviewsByMovie);
router.get('/:id', getReviewById);

// Protected routes
router.get('/user/:userId', protect, getReviewsByUser);
router.post('/', protect, createReview);
router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router; 