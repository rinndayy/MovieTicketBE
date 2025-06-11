const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all tickets for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.params.userId })
      .sort({ purchaseDate: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket status
router.put('/:id/status', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.status = req.body.status;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 