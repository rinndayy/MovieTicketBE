const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  movieTitle: {
    type: String,
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
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  seats: {
    type: [String],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema); 