const { PICKUP_LOCATIONS } = require('../config/constants');

// GET /api/pickup-locations
const getPickupLocations = (req, res) => {
  res.status(200).json(PICKUP_LOCATIONS);
};

module.exports = { getPickupLocations };