const { Movie, dropCollection } = require('../models/Movie');

// Initialize by dropping old collection
dropCollection().then(() => {
  console.log('Movie collection reset complete');
}).catch(error => {
  console.error('Error resetting movie collection:', error);
});

// Create a new movie
exports.createMovie = async (req, res) => {
  try {
    const movieData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'title', 'description', 'duration', 'releaseDate', 
      'poster', 'bannerImage', 'category', 'director',
      'actors', 'cinemas'
    ];

    for (const field of requiredFields) {
      if (!movieData[field]) {
        return res.status(400).json({ 
          message: `Missing required field: ${field}` 
        });
      }
    }

    // Validate director fields
    if (!movieData.director.name || !movieData.director.image || !movieData.director.description) {
      return res.status(400).json({ 
        message: 'Director information is incomplete' 
      });
    }

    // Validate cinemas and halls
    if (!Array.isArray(movieData.cinemas) || movieData.cinemas.length === 0) {
      return res.status(400).json({ 
        message: 'At least one cinema is required' 
      });
    }

    for (const cinema of movieData.cinemas) {
      if (!cinema.name || !cinema.address || !Array.isArray(cinema.halls) || cinema.halls.length === 0) {
        return res.status(400).json({ 
          message: 'Cinema information is incomplete' 
        });
      }

      for (const hall of cinema.halls) {
        if (!hall.name || !hall.type || !hall.capacity || !hall.seatMap) {
          return res.status(400).json({ 
            message: 'Hall information is incomplete' 
          });
        }
      }
    }

    // Create new movie with only the fields we want
    const movie = new Movie({
      title: movieData.title,
      description: movieData.description,
      duration: movieData.duration,
      releaseDate: movieData.releaseDate,
      poster: movieData.poster,
      bannerImage: movieData.bannerImage,
      category: movieData.category,
      isNowPlaying: movieData.isNowPlaying,
      isComingSoon: movieData.isComingSoon,
      director: {
        name: movieData.director.name,
        image: movieData.director.image,
        description: movieData.director.description
      },
      actors: movieData.actors.map(actor => ({
        name: actor.name,
        image: actor.image,
        role: actor.role
      })),
      cinemas: movieData.cinemas.map(cinema => ({
        name: cinema.name,
        address: cinema.address,
        halls: cinema.halls.map(hall => ({
          name: hall.name,
          type: hall.type,
          capacity: hall.capacity,
          seatMap: hall.seatMap,
          showtimes: hall.showtimes
        }))
      }))
    });

    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie
    });
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ 
      message: 'Error creating movie',
      error: error.message 
    });
  }
};

// Get all movies
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ 
      message: 'Error fetching movies',
      error: error.message 
    });
  }
};

// Get movie by ID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ 
        message: 'Movie not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ 
      message: 'Error fetching movie',
      error: error.message 
    });
  }
};

// Update movie
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ 
        message: 'Movie not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ 
      message: 'Error updating movie',
      error: error.message 
    });
  }
};

// Delete movie
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ 
        message: 'Movie not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ 
      message: 'Error deleting movie',
      error: error.message 
    });
  }
};

// Get movies by status (now playing or coming soon)
exports.getMoviesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    let query = {};

    if (status === 'now-playing') {
      query.isNowPlaying = true;
    } else if (status === 'coming-soon') {
      query.isComingSoon = true;
    }

    const movies = await Movie.find(query)
      .sort({ releaseDate: 1 });

    res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Error fetching movies by status:', error);
    res.status(500).json({ 
      message: 'Error fetching movies by status',
      error: error.message 
    });
  }
}; 