const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    minlength: [3, 'Comment must be at least 3 characters long'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

// Middleware to update the updatedAt field on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get average rating of a movie
reviewSchema.statics.getAverageRating = async function(movieId) {
  const obj = await this.aggregate([
    {
      $match: { movie: movieId }
    },
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await mongoose.model('Movie').findByIdAndUpdate(movieId, {
        rating: obj[0].averageRating.toFixed(1)
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.movie);
});

// Call getAverageRating after remove
reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.movie);
});

module.exports = mongoose.model('Review', reviewSchema); 