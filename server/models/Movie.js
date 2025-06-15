const mongoose = require('mongoose');

// Drop existing collection to apply new schema
const dropCollection = async () => {
  try {
    await mongoose.connection.collection('movies').drop();
    console.log('Old movies collection dropped successfully');
  } catch (error) {
    if (error.code === 26) {
      console.log('Collection does not exist, proceeding with new schema');
    } else {
      console.error('Error dropping collection:', error);
    }
  }
};

// Call dropCollection when model is initialized
dropCollection();

const showtimeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  times: [{ type: String, required: true }]
});

const seatMapSchema = new mongoose.Schema({
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  vipRows: [{ type: Number }],
  seatTypes: {
    standard: {
      price: { type: Number, required: true },
      color: { type: String, default: '#4B5563' }
    },
    vip: {
      price: { type: Number, required: true },
      color: { type: String, default: '#DC2626' }
    }
  }
});

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  capacity: { type: Number, required: true },
  seatMap: { type: seatMapSchema, required: true },
  showtimes: [showtimeSchema]
});

const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  halls: [hallSchema]
});

const actorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  role: { type: String, required: true }
});

// Define the new schema without any old fields
const movieSchema = new mongoose.Schema({
  // Basic Information
  title: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  duration: { 
    type: Number, 
    required: true,
    min: 1
  },
  releaseDate: { 
    type: Date, 
    required: true
  },
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Images
  poster: { 
    type: String, 
    required: true,
    trim: true
  },
  bannerImage: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Status
  isNowPlaying: { 
    type: Boolean, 
    default: false
  },
  isComingSoon: { 
    type: Boolean, 
    default: true
  },
  
  // Director Information - Only these three fields
  director: {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    image: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true,
      trim: true
    }
  },
  
  // Cast and Locations
  actors: [actorSchema],
  cinemas: [cinemaSchema]
}, {
  // Disable version key
  versionKey: false,
  // Enable timestamps
  timestamps: true,
  // Disable strict mode to prevent old fields from causing errors
  strict: false
});

// Create indexes
movieSchema.index({ title: 1 }, { unique: true });
movieSchema.index({ 'director.name': 1 });
movieSchema.index({ category: 1 });
movieSchema.index({ isNowPlaying: 1, isComingSoon: 1 });

// Create the model
const Movie = mongoose.model('Movie', movieSchema);

// Export both the model and the drop function
module.exports = {
  Movie,
  dropCollection
}; 