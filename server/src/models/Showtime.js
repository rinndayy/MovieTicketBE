const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'selected', 'disabled'],
    default: 'available'
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
});

const rowSchema = new mongoose.Schema({
  row: {
    type: String,
    required: true
  },
  seats: [seatSchema]
});

const showtimeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  cinema: {
    type: String,
    required: true
  },
  hall: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  seats: [rowSchema]
}, {
  timestamps: true
});

// Compound index to prevent duplicate showtimes
showtimeSchema.index({ movieId: 1, date: 1, hall: 1 }, { unique: true });

const Showtime = mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime; 