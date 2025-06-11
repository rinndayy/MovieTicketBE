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
      userId: req.user._id,
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

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
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

// Other functions remain unchanged...

module.exports = {
  createBooking,
  completeBooking,
  cancelBooking,
  getUserBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
};
