const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  releaseDate: {
    type: Date,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  trailer: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['now-playing', 'coming-soon', 'ended'],
    default: 'coming-soon'
  }
}, {
  timestamps: true
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie; 