const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available'
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }
});

// Compound index to ensure unique seat numbers per showtime
seatSchema.index({ showtime: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema); 