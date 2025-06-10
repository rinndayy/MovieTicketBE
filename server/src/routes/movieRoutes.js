const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', movieController.getMovies); // ✅ fix tên này
router.get('/now-showing', movieController.getNowShowing); // ✅ đúng route và tên
router.get('/coming-soon', movieController.getComingSoon); // ✅ đúng route và tên
router.get('/:id', movieController.getMovieById);

// Protected admin routes
router.post('/', protect, admin, movieController.createMovie);
router.put('/:id', protect, admin, movieController.updateMovie);
router.delete('/:id', protect, admin, movieController.deleteMovie);

module.exports = router;
