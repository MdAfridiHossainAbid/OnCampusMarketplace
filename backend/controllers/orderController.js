const Order = require('../models/Order');
const Product = require('../models/Product');
const { PICKUP_LOCATIONS } = require('../config/constants');
const { VALID_STATUSES } = require('../config/orderStatus');

// POST /api/orders  (protected — requires login)
// Body: { productId, quantity, pickupLocation }
const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId, quantity, pickupLocation } = req.body;

    if (!productId || !quantity || !pickupLocation) {
      return res.status(400).json({
        message: 'productId, quantity, and pickupLocation are all required',
      });
    }

    if (!PICKUP_LOCATIONS.includes(pickupLocation)) {
      return res.status(400).json({
        message: `pickupLocation must be one of: ${PICKUP_LOCATIONS.join(', ')}`,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.availability !== 'available') {
      return res.status(400).json({ message: 'This product is not available for order' });
    }

    const order = await Order.create({
      buyerId,
      productId,
      sellerId: product.sellerId,
      quantity,
      totalPrice: product.price * quantity,
      pickupLocation,
      // status defaults to ORDER_STATUS.PENDING via the schema
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Could not create order', error: error.message });
  }
};

// GET /api/orders/:id  (protected)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email studentId')
      .populate('sellerId', 'name email studentId')
      .populate('productId', 'title price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order ID', error: error.message });
  }
};

// GET /api/orders/mine  (protected — buyer's own order history)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate('productId', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch your orders', error: error.message });
  }
};

// GET /api/orders/seller  (protected — seller/admin: orders placed on their products)
const getOrdersForSeller = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user.id })
      .populate('buyerId', 'name email studentId')
      .populate('productId', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch seller orders', error: error.message });
  }
};

// PATCH /api/orders/:id/status  (protected — owning seller or admin only)
// Body: { status: 'Pending' | 'Completed' | 'Cancelled' }
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwningSeller = order.sellerId.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isOwningSeller) {
      return res.status(403).json({ message: 'You do not own this order' });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Could not update order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrdersForSeller,
  updateOrderStatus,
};