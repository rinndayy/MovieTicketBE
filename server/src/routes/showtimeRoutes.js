const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', showtimeController.getAllShowtimes);
router.get('/:id', showtimeController.getShowtimeById);
router.get('/movie/:movieId', showtimeController.getShowtimesByMovie);
router.get('/cinema/:cinemaId', showtimeController.getShowtimesByCinema);

// Protected admin routes
router.post('/', protect, admin, showtimeController.createShowtime);
router.put('/:id', protect, admin, showtimeController.updateShowtime);
router.delete('/:id', protect, admin, showtimeController.deleteShowtime);

module.exports = router; 