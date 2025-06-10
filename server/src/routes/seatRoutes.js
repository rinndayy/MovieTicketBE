const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getSeats,
  getSeatById,
  createSeat,
  updateSeat,
  deleteSeat,
  getSeatsByShowtime,
  updateSeatStatus,
  initializeSeats
} = require('../controllers/seatController');

// Public routes
router.get('/', getSeats);
router.get('/showtime/:showtimeId', getSeatsByShowtime);
router.get('/:id', getSeatById);

// Protected routes
router.use(protect);
router.post('/initialize', initializeSeats);
router.put('/status', updateSeatStatus);

// Admin routes
router.route('/:id')
  .put(protect, admin, updateSeat)
  .delete(protect, admin, deleteSeat);

module.exports = router; 