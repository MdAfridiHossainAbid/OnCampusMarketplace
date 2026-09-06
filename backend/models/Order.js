const mongoose = require('mongoose');
const { PICKUP_LOCATIONS } = require('../config/constants');
const { ORDER_STATUS, VALID_STATUSES } = require('../config/orderStatus');

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Denormalized from Product.sellerId at order time — keeps order
    // history correct even if a product is later edited or removed.
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      enum: {
        values: PICKUP_LOCATIONS,
        message: 'Pickup location must be one of the approved campus locations',
      },
    },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: ORDER_STATUS.PENDING,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);