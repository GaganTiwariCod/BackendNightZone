const { sequelize } = require('../config/db');

/**
 * Calculate distance in kilometers between two coordinates using Haversine formula
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

/**
 * Generate Sequelize SQL literal for calculating distance from target coordinates
 * @param {number} userLat
 * @param {number} userLng
 * @param {string} latCol Table column for latitude
 * @param {string} lngCol Table column for longitude
 */
const getDistanceSqlLiteral = (userLat, userLng, latCol = '`location`.`latitude`', lngCol = '`location`.`longitude`') => {
  return sequelize.literal(`(
    6371 * acos(
      cos(radians(${parseFloat(userLat)})) *
      cos(radians(${latCol})) *
      cos(radians(${lngCol}) - radians(${parseFloat(userLng)})) +
      sin(radians(${parseFloat(userLat)})) *
      sin(radians(${latCol}))
    )
  )`);
};

module.exports = {
  calculateHaversineDistance,
  getDistanceSqlLiteral
};
