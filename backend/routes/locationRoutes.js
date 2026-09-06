const express = require('express');
const router = express.Router();
const { getPickupLocations } = require('../controllers/locationController');

// GET /api/pickup-locations
router.get('/', getPickupLocations);

module.exports = router;