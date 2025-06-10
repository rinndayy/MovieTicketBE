const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime');
const asyncHandler = require('express-async-handler');

// @desc    Get all seats
// @route   GET /api/seats
// @access  Public
const getSeats = asyncHandler(async (req, res) => {
  const seats = await Seat.find().populate('showtime');
  res.json(seats);
});

// @desc    Get seats by showtime
// @route   GET /api/seats/showtime/:showtimeId
// @access  Public
const getSeatsByShowtime = asyncHandler(async (req, res) => {
  const seats = await Seat.find({ showtime: req.params.showtimeId })
    .sort({ row: 1, seatNumber: 1 });

  if (!seats) {
    res.status(404);
    throw new Error('Không tìm thấy thông tin ghế ngồi');
  }

  res.json(seats);
});

// @desc    Get single seat
// @route   GET /api/seats/:id
// @access  Public
const getSeatById = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.id).populate('showtime');
  
  if (seat) {
    res.json(seat);
  } else {
    res.status(404);
    throw new Error('Seat not found');
  }
});

// @desc    Create a seat
// @route   POST /api/seats
// @access  Admin
const createSeat = asyncHandler(async (req, res) => {
  const { seatNumber, row, type, price, showtime } = req.body;

  const seat = await Seat.create({
    seatNumber,
    row,
    type,
    price,
    showtime
  });

  if (seat) {
    res.status(201).json(seat);
  } else {
    res.status(400);
    throw new Error('Invalid seat data');
  }
});

// @desc    Update seat status
// @route   PUT /api/seats/:id/status
// @access  Private/Admin
const updateSeatStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const seat = await Seat.findById(req.params.id);

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: 'Seat not found'
      });
    }

    seat.status = status;
    await seat.save();

    res.json({
      success: true,
      seat,
      message: 'Seat status updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update seat status'
    });
  }
};

// @desc    Update seat
// @route   PUT /api/seats/:id
// @access  Admin
const updateSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.id);
  
  if (seat) {
    seat.seatNumber = req.body.seatNumber || seat.seatNumber;
    seat.row = req.body.row || seat.row;
    seat.type = req.body.type || seat.type;
    seat.price = req.body.price || seat.price;
    seat.showtime = req.body.showtime || seat.showtime;
    
    const updatedSeat = await seat.save();
    res.json(updatedSeat);
  } else {
    res.status(404);
    throw new Error('Seat not found');
  }
});

// @desc    Delete seat
// @route   DELETE /api/seats/:id
// @access  Admin
const deleteSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.id);
  
  if (seat) {
    await seat.deleteOne();
    res.json({ message: 'Seat removed' });
  } else {
    res.status(404);
    throw new Error('Seat not found');
  }
});

// @desc    Initialize seats for a showtime
// @route   POST /api/seats/init
// @access  Private/Admin
const initializeSeats = async (req, res) => {
  try {
    const { movieId, hall, date, time, seatMap } = req.body;

    if (!movieId || !hall || !date || !time || !seatMap) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const seats = [];
    const rows = seatMap.rows;
    const vipRows = seatMap.vipRows;

    // Create seat documents
    for (let row of rows) {
      for (let number = 1; number <= seatMap.seatsPerRow; number++) {
        const seatNumber = `${row}${number}`;
        const type = vipRows.includes(row) ? 'vip' : 'standard';
        const price = seatMap.seatTypes[type].price;

        seats.push({
          movieId,
          hall,
          date,
          time,
          seatNumber,
          type,
          price,
          status: 'available'
        });
      }
    }

    // Insert all seats
    await Seat.insertMany(seats, { ordered: false });

    res.status(201).json({
      success: true,
      message: 'Seats initialized successfully'
    });
  } catch (error) {
    // Ignore duplicate key errors
    if (error.code === 11000) {
      res.status(200).json({
        success: true,
        message: 'Seats already initialized'
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize seats'
      });
    }
  }
};

// @desc    Get seat status
// @route   GET /api/seats/status/:seatId
// @access  Public
const getSeatStatus = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.seatId);

  if (!seat) {
    res.status(404);
    throw new Error('Không tìm thấy ghế');
  }

  // Check if selection has expired
  if (seat.status === 'selected' && seat.hasSelectionExpired()) {
    seat.status = 'available';
    seat.selectedBy = null;
    seat.lastSelectedAt = null;
    await seat.save();
  }

  res.json({
    status: seat.status,
    type: seat.type,
    price: seat.price
  });
});

// @desc    Select a seat
// @route   POST /api/seats/select/:seatId
// @access  Private
const selectSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.seatId);

  if (!seat) {
    res.status(404);
    throw new Error('Không tìm thấy ghế');
  }

  if (!seat.isAvailable()) {
    res.status(400);
    throw new Error('Ghế này không khả dụng');
  }

  seat.status = 'selected';
  seat.selectedBy = req.user._id;
  seat.lastSelectedAt = new Date();
  
  const updatedSeat = await seat.save();

  res.json(updatedSeat);
});

// @desc    Release a selected seat
// @route   POST /api/seats/release/:seatId
// @access  Private
const releaseSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.seatId);

  if (!seat) {
    res.status(404);
    throw new Error('Không tìm thấy ghế');
  }

  if (seat.status !== 'selected' || seat.selectedBy.toString() !== req.user._id.toString()) {
    res.status(400);
    throw new Error('Không thể hủy chọn ghế này');
  }

  seat.status = 'available';
  seat.selectedBy = null;
  seat.lastSelectedAt = null;

  const updatedSeat = await seat.save();

  res.json(updatedSeat);
});

// Get seats for a specific showtime
exports.getSeats = async (req, res) => {
  try {
    const { movieId, hall, date, time } = req.query;

    if (!movieId || !hall || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const seats = await Seat.find({
      movieId,
      hall,
      date,
      time
    }).select('seatNumber type status price');

    res.status(200).json({
      success: true,
      seats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch seats'
    });
  }
};

// Update seat status
exports.updateSeatStatus = async (req, res) => {
  try {
    const { movieId, hall, date, time, seatNumber, status } = req.body;

    if (!movieId || !hall || !date || !time || !seatNumber || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const seat = await Seat.findOneAndUpdate(
      {
        movieId,
        hall,
        date,
        time,
        seatNumber
      },
      { status },
      { new: true }
    );

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: 'Seat not found'
      });
    }

    res.status(200).json({
      success: true,
      seat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update seat status'
    });
  }
};

module.exports = {
  getSeats,
  getSeatById,
  createSeat,
  updateSeat,
  deleteSeat,
  getSeatsByShowtime,
  updateSeatStatus,
  initializeSeats,
  getSeatStatus,
  selectSeat,
  releaseSeat
}; 