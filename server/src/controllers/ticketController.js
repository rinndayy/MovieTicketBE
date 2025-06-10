const Ticket = require('../models/Ticket');
const Seat = require('../models/Seat');
const emailjs = require('@emailjs/browser');



// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      cinema,
      hall,
      date,
      time,
      seats,
      totalAmount,
      paymentMethod
    } = req.body;

    if (!movieId || !movieTitle || !cinema || !hall || !date || !time || !seats || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if seats are available
    const unavailableSeats = await Seat.find({
      movieId,
      hall,
      date,
      time,
      seatNumber: { $in: seats },
      status: 'occupied'
    });

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected seats are no longer available'
      });
    }

    // Create new ticket
    const ticket = await Ticket.create({
      movieId,
      movieTitle,
      cinema,
      hall,
      date,
      time,
      seats,
      totalAmount,
      paymentMethod,
      user: req.user._id
    });

    // Update seat status to occupied
    await Seat.updateMany(
      {
        movieId,
        hall,
        date,
        time,
        seatNumber: { $in: seats }
      },
      {
        $set: {
          status: 'occupied',
          ticketId: ticket._id
        }
      }
    );

    // Send confirmation email
    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_email: req.user.email,
          to_name: req.user.fullName,
          movie_title: movieTitle,
          cinema_name: cinema,
          hall_name: hall,
          show_date: new Date(date).toLocaleDateString(),
          show_time: time,
          seats: seats.join(', '),
          total_amount: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(totalAmount),
          booking_id: ticket._id.toString()
        }
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      ticket,
      message: 'Ticket created successfully'
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create ticket'
    });
  }
};

// Get user's tickets
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch tickets'
    });
  }
};

// Get single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this ticket'
      });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch ticket'
    });
  }
};

// Cancel ticket
exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ticket'
      });
    }

    ticket.status = 'cancelled';
    await ticket.save();

    // Release seats
    await Seat.updateMany(
      {
        movieId: ticket.movieId,
        hall: ticket.hall,
        date: ticket.date,
        time: ticket.time,
        seatNumber: { $in: ticket.seats }
      },
      {
        $set: {
          status: 'available',
          ticketId: null
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel ticket'
    });
  }
};

// Check seats availability
exports.checkSeats = async (req, res) => {
  try {
    const { movieId, hall, date, time } = req.body;

    if (!movieId || !hall || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const seats = await Seat.find({ movieId, hall, date, time });

    res.status(200).json({
      success: true,
      seats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check seats'
    });
  }
};

// Initialize seats for a showtime
exports.initializeSeats = async (req, res) => {
  try {
    const { movieId, hall, date, time, seatNumbers } = req.body;

    if (!movieId || !hall || !date || !time || !Array.isArray(seatNumbers)) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid required fields'
      });
    }

    // Remove existing seats for this showtime first (optional, depends on your logic)
    await Seat.deleteMany({ movieId, hall, date, time });

    // Create new seats as available
    const seatDocs = seatNumbers.map(seatNumber => ({
      movieId,
      hall,
      date,
      time,
      seatNumber,
      status: 'available',
      ticketId: null
    }));

    await Seat.insertMany(seatDocs);

    res.status(201).json({
      success: true,
      message: 'Seats initialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize seats'
    });
  }
};
