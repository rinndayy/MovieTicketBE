const mongoose = require('mongoose');

const seatTypeSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  }
});

const seatMapSchema = new mongoose.Schema({
  rows: [String],
  columns: Number,
  vipRows: [String],
  seatTypes: {
    standard: seatTypeSchema,
    vip: seatTypeSchema
  }
});

const hallSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  seatMap: seatMapSchema
});

const cinemaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  facilities: [{
    type: String,
    required: true
  }],
  halls: [hallSchema]
}, {
  timestamps: true
});

const Cinema = mongoose.model('Cinema', cinemaSchema);

module.exports = Cinema; 