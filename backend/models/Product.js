const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Books',
        'Electronics',
        'Furniture',
        'Clothing',
        'Stationery',
        'Sports',
        'Other',
      ],
    },
    availability: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
      index: true,
    },
  },
  { timestamps: true }
);

// Text index -> keyword search across title + description (Feature 8)
productSchema.index({ title: 'text', description: 'text' });

// Compound index -> fast category + price-range filtering (Feature 8)
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);