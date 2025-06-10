const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

// Protected user routes
router.get('/user/:userId', protect, bookingController.getUserBookings);
router.post('/', protect, bookingController.createBooking);
router.put('/:id/status', protect, bookingController.updateBookingStatus);
router.put('/:id/payment', protect, bookingController.updatePaymentStatus);

// Protected admin routes
router.get('/', protect, admin, bookingController.getAllBookings);
router.get('/:id', protect, admin, bookingController.getBookingById);

module.exports = router; 