const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrdersForSeller,
  updateOrderStatus,
} = require('../controllers/orderController');

// POST /api/orders — any logged-in student/seller can place an order
router.post('/', protect, createOrder);

// GET /api/orders/mine — the logged-in buyer's own order history
// NOTE: this must come before '/:id' or Express will treat "mine" as an :id
router.get('/mine', protect, getMyOrders);

// GET /api/orders/seller — orders placed on the logged-in seller's products
router.get('/seller', protect, authorize('seller', 'admin'), getOrdersForSeller);

// GET /api/orders/:id — any logged-in user (buyer, seller, or admin)
router.get('/:id', protect, getOrderById);

// PATCH /api/orders/:id/status — only sellers and admins can change status
router.patch('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;