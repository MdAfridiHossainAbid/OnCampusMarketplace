const Product = require('../models/Product');

// POST /api/products  (protected — seller or admin only)
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, availability } = req.body;

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({
        message: 'title, description, price, and category are all required',
      });
    }

    const product = await Product.create({
      sellerId: req.user.id,
      title,
      description,
      price,
      category,
      availability,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Could not create product', error: error.message });
  }
};

// GET /api/products
// GET /api/products?keyword=book&category=Books&minPrice=100&maxPrice=500
const getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate('sellerId', 'name studentId')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch products', error: error.message });
  }
};

// GET /api/products/mine  (protected — seller's own listings, for the manage-products page)
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch your products', error: error.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'sellerId',
      'name email studentId'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product ID', error: error.message });
  }
};

const findOwnedProductOrRespond = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return null;
  }

  const isOwner = product.sellerId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403).json({ message: 'You do not own this product' });
    return null;
  }

  return product;
};

// PUT /api/products/:id  (protected — owning seller or admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await findOwnedProductOrRespond(req, res);
    if (!product) return;

    const { title, description, price, category } = req.body;
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Could not update product', error: error.message });
  }
};

// DELETE /api/products/:id  (protected — owning seller or admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await findOwnedProductOrRespond(req, res);
    if (!product) return;

    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Could not delete product', error: error.message });
  }
};

// PATCH /api/products/:id/availability  (protected — owning seller or admin only)
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const validValues = ['available', 'reserved', 'sold'];

    if (!validValues.includes(availability)) {
      return res.status(400).json({
        message: `availability must be one of: ${validValues.join(', ')}`,
      });
    }

    const product = await findOwnedProductOrRespond(req, res);
    if (!product) return;

    product.availability = availability;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Could not update availability', error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateAvailability,
};