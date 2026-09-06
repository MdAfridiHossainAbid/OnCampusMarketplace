const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateAvailability,
} = require('../controllers/productController');

// POST /api/products — sellers and admins only
router.post('/', protect, authorize('seller', 'admin'), createProduct);

// GET /api/products — anyone can browse
router.get('/', getProducts);

// GET /api/products/mine — seller's own listings
// NOTE: must come before '/:id' or Express treats "mine" as an :id
router.get('/mine', protect, authorize('seller', 'admin'), getMyProducts);

// GET /api/products/:id — anyone can view a single product
router.get('/:id', getProductById);

// PUT /api/products/:id — owning seller or admin only
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);

// DELETE /api/products/:id — owning seller or admin only
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

// PATCH /api/products/:id/availability — owning seller or admin only
router.patch('/:id/availability', protect, authorize('seller', 'admin'), updateAvailability);

module.exports = router;