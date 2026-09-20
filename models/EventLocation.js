const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventLocation extends Model {}

EventLocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    venue_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    area: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Mumbai'
    },
    state: {
      type: DataTypes.STRING(100),
      defaultValue: 'Maharashtra'
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    landmark: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    map_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    // Meeting Point for Yatra/Travel
    meeting_point_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    meeting_point_address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    meeting_point_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    meeting_point_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    meeting_time: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    meeting_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'EventLocation',
    tableName: 'event_locations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['city'] },
      { fields: ['state'] },
      { fields: ['latitude', 'longitude'] }
    ]
  }
);

module.exports = EventLocation;
