const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { status, genre } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (genre) {
      query.genre = { $in: [genre] };
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    const movie = await Movie.findById(id);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  const movie = new Movie({
    title: req.body.title,
    description: req.body.description,
    duration: req.body.duration,
    genre: req.body.genre,
    releaseDate: req.body.releaseDate,
    poster: req.body.poster,
    trailer: req.body.trailer,
    status: req.body.status
  });

  try {
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    const movie = await Movie.findById(id);

    if (movie) {
      Object.assign(movie, req.body);
      const updatedMovie = await movie.save();
      res.json(updatedMovie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    const movie = await Movie.findById(id);

    if (movie) {
      await movie.remove();
      res.json({ message: 'Movie deleted successfully' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update movie showtimes
// @route   PUT /api/movies/:id/showtimes
// @access  Private/Admin
const updateShowtimes = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    const movie = await Movie.findById(id);

    if (movie) {
      movie.showTimes = req.body.showTimes;
      const updatedMovie = await movie.save();
      res.json(updatedMovie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get now showing movies
// @route   GET /api/movies/now-showing
// @access  Public
const getNowShowing = async (req, res) => {
  try {
    const movies = await Movie.find({ status: 'Now Showing' }).sort({ releaseDate: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coming soon movies
// @route   GET /api/movies/coming-soon
// @access  Public
const getComingSoon = async (req, res) => {
  try {
    const movies = await Movie.find({ status: 'Coming Soon' }).sort({ releaseDate: 1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateShowtimes,
  getNowShowing,
  getComingSoon,
};
