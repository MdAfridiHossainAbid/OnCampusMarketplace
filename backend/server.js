// Load variables from .env (like MONGO_URI) before anything else runs
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Allows Express to read JSON in request bodies (e.g. req.body in POST requests)
app.use(express.json());

// Simple test route — visit http://localhost:5000/ in a browser to check the server is alive
app.get('/', (req, res) => {
  res.send('On-Campus Marketplace API is running');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/pickup-locations', require('./routes/locationRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});