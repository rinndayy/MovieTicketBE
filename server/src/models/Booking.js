const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
  seats: [{
    row: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['standard', 'vip'],
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['momo', 'zalopay', 'vnpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
});

// Middleware to check max seats per booking
bookingSchema.pre('save', function(next) {
  if (this.seats.length > 8) {
    next(new Error('Maximum 8 seats allowed per booking'));
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 