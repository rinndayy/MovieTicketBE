const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');

const showtimeController = {
  // Get all showtimes
  getAllShowtimes: async (req, res) => {
    try {
      const showtimes = await Showtime.find().populate('movieId');
      res.json(showtimes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get showtime by ID
  getShowtimeById: async (req, res) => {
    try {
      const showtime = await Showtime.findById(req.params.id).populate('movieId');
      if (!showtime) {
        return res.status(404).json({ message: 'Showtime not found' });
      }
      res.json(showtime);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new showtime
  createShowtime: async (req, res) => {
    try {
      // Get cinema and hall details
      const cinema = await Cinema.findOne({ id: req.body.cinema });
      if (!cinema) {
        return res.status(404).json({ message: 'Cinema not found' });
      }

      const hall = cinema.halls.find(h => h.id === req.body.hall);
      if (!hall) {
        return res.status(404).json({ message: 'Hall not found' });
      }

      // Create seats based on hall configuration
      const seats = hall.seatMap.rows.map(row => ({
        row,
        seats: Array.from({ length: hall.seatMap.columns }, (_, i) => ({
          number: i + 1,
          status: 'available',
          type: hall.seatMap.vipRows.includes(row) ? 'vip' : 'standard',
          price: hall.seatMap.vipRows.includes(row) 
            ? hall.seatMap.seatTypes.vip.price 
            : hall.seatMap.seatTypes.standard.price
        }))
      }));

      const showtime = new Showtime({
        id: req.body.id,
        movieId: req.body.movieId,
        cinema: req.body.cinema,
        hall: req.body.hall,
        date: req.body.date,
        time: req.body.time,
        seats
      });

      const newShowtime = await showtime.save();
      res.status(201).json(newShowtime);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update showtime
  updateShowtime: async (req, res) => {
    try {
      const showtime = await Showtime.findById(req.params.id);
      if (!showtime) {
        return res.status(404).json({ message: 'Showtime not found' });
      }

      // Only allow updating certain fields
      const allowedUpdates = ['date', 'time'];
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          showtime[key] = req.body[key];
        }
      });

      const updatedShowtime = await showtime.save();
      res.json(updatedShowtime);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete showtime
  deleteShowtime: async (req, res) => {
    try {
      const showtime = await Showtime.findById(req.params.id);
      if (!showtime) {
        return res.status(404).json({ message: 'Showtime not found' });
      }

      await showtime.remove();
      res.json({ message: 'Showtime deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get showtimes by movie
  getShowtimesByMovie: async (req, res) => {
    try {
      const showtimes = await Showtime.find({ movieId: req.params.movieId })
        .populate('movieId')
        .sort({ date: 1, time: 1 });
      res.json(showtimes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get showtimes by cinema
  getShowtimesByCinema: async (req, res) => {
    try {
      const showtimes = await Showtime.find({ cinema: req.params.cinemaId })
        .populate('movieId')
        .sort({ date: 1, time: 1 });
      res.json(showtimes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = showtimeController; 