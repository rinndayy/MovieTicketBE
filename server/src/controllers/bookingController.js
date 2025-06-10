const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const QRCode = require('qrcode');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { movieId, showtimeId, seats, totalAmount, paymentMethod } = req.body;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(movieId) || 
        !mongoose.Types.ObjectId.isValid(showtimeId) || 
        !seats.every(seatId => mongoose.Types.ObjectId.isValid(seatId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format provided'
      });
    }

    // Check if seats are available
    const selectedSeats = await Seat.find({
      _id: { $in: seats },
      showtime: showtimeId,
      status: 'available'
    });

    if (selectedSeats.length !== seats.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected seats are not available'
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      movie: mongoose.Types.ObjectId(movieId),
      showtime: mongoose.Types.ObjectId(showtimeId),
      seats: seats.map(seatId => mongoose.Types.ObjectId(seatId)),
      totalAmount,
      paymentMethod
    });

    // Mark seats as selected
    await Seat.updateMany(
      { _id: { $in: seats } },
      { status: 'selected' }
    );

    // Generate QR code
    const showtime = await Showtime.findById(showtimeId);
    const qrData = JSON.stringify({
      bookingId: booking._id,
      showtime: showtime.id,
      seats: seats.map(seat => `${seat.row}${seat.number}`),
      totalAmount
    });
    
    booking.qrCode = await QRCode.toDataURL(qrData);

    // Update seat status in showtime
    for (const seat of seats) {
      const rowIndex = showtime.seats.findIndex(r => r.row === seat.row);
      const seatIndex = showtime.seats[rowIndex].seats.findIndex(s => s.number === seat.number);
      showtime.seats[rowIndex].seats[seatIndex].status = 'occupied';
    }

    await showtime.save();
    const newBooking = await booking.save();

    res.status(201).json({
      success: true,
      booking: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

// @desc    Complete booking payment
// @route   PUT /api/bookings/:id/complete
// @access  Private
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Complete the booking
    const success = await booking.completeBooking();

    if (success) {
      res.json({
        success: true,
        booking,
        message: 'Booking completed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to complete booking'
      });
    }
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to complete booking'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Cancel the booking
    const success = await booking.cancelBooking();

    if (success) {
      res.json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel booking'
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'movie',
        select: 'title posterUrl duration'
      })
      .populate({
        path: 'showtime',
        select: 'datetime cinema'
      })
      .populate({
        path: 'seats',
        select: 'seatNumber row type'
      })
      .sort('-createdAt');

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get bookings'
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    const booking = await Booking.findById(id)
      .populate({
        path: 'movie',
        select: 'title posterUrl duration'
      })
      .populate({
        path: 'showtime',
        select: 'datetime cinema'
      })
      .populate({
        path: 'seats',
        select: 'seatNumber row type'
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get booking'
    });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId')
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId' }
      });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.bookingStatus = status;
      if (status === 'cancelled') {
        // Release seats
        const showtime = await Showtime.findById(booking.showtimeId);
        for (const seat of booking.seats) {
          const rowIndex = showtime.seats.findIndex(r => r.row === seat.row);
          const seatIndex = showtime.seats[rowIndex].seats.findIndex(s => s.number === seat.number);
          showtime.seats[rowIndex].seats[seatIndex].status = 'available';
        }
        await showtime.save();
      }
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  completeBooking,
  cancelBooking,
  getUserBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
}; 