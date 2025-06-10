const Movie = require('../models/Movie');
const movieData = require('./movie.json');

const initializeMovies = async () => {
  try {
    // Check if there are any movies in the database
    const existingMovies = await Movie.find({});
    
    if (existingMovies.length === 0) {
      console.log('Initializing database with movies from movie.json...');
      
      // Insert all movies from movie.json
      const movies = movieData.movies.map(movie => ({
        ...movie,
        // Convert string dates to Date objects
        releaseDate: new Date(movie.releaseDate),
        showTimes: movie.showTimes?.map(showtime => ({
          ...showtime,
          date: new Date(showtime.date)
        })) || []
      }));

      await Movie.insertMany(movies);
      console.log('Successfully initialized movies database');
    } else {
      console.log('Movies already exist in database, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing movies:', error);
  }
};

module.exports = initializeMovies; 