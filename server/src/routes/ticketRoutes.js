const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTicket,
  getUserTickets,
  getTicketById,
  cancelTicket,
  checkSeats,
  initializeSeats
} = require('../controllers/ticketController');

// Kiểm tra trạng thái ghế
router.post('/check-seats', protect, checkSeats);

// Khởi tạo ghế cho suất chiếu
router.post('/initialize-seats', protect, initializeSeats);

// Tạo vé mới
router.post('/', protect, createTicket);

// Lấy danh sách vé của người dùng
router.get('/', protect, getUserTickets);

// Lấy chi tiết một vé
router.get('/:id', protect, getTicketById);

// Hủy vé
router.put('/:id/cancel', protect, cancelTicket);

module.exports = router;
