const Review = require('../models/Review');
const Movie = require('../models/Movie');
const asyncHandler = require('express-async-handler');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('movie', 'title posterImage');
  res.json(reviews);
});

// @desc    Get reviews by movie ID
// @route   GET /api/reviews/movie/:movieId
// @access  Public
const getReviewsByMovie = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ movie: req.params.movieId })
    .populate('user', 'name email')
    .populate('movie', 'title posterImage');
  res.json(reviews);
});

// @desc    Get reviews by user ID
// @route   GET /api/reviews/user/:userId
// @access  Private
const getReviewsByUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.params.userId })
    .populate('user', 'name email')
    .populate('movie', 'title posterImage');
  res.json(reviews);
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name email')
    .populate('movie', 'title posterImage');
  
  if (review) {
    res.json(review);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { movie: movieId, rating, comment } = req.body;

  // Check if movie exists
  const movie = await Movie.findById(movieId);
  if (!movie) {
    res.status(404);
    throw new Error('Movie not found');
  }

  // Check if user already reviewed this movie
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    movie: movieId
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Movie already reviewed');
  }

  const review = await Review.create({
    user: req.user._id,
    movie: movieId,
    rating,
    comment
  });

  if (review) {
    res.status(201).json(review);
  } else {
    res.status(400);
    throw new Error('Invalid review data');
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (review) {
    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this review');
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    
    const updatedReview = await review.save();
    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (review) {
    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to delete this review');
    }

    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

module.exports = {
  getReviews,
  getReviewById,
  getReviewsByMovie,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview
}; 