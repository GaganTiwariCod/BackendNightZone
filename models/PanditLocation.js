const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditLocation extends Model {}

PanditLocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pandit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pandit_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    area: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    native_place: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    service_radius: {
      type: DataTypes.INTEGER,
      defaultValue: 25,
      comment: 'Service radius in km'
    },
    travel_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'PanditLocation',
    tableName: 'pandit_locations',
    indexes: [
      { fields: ['pandit_id'] },
      { fields: ['city'] },
      { fields: ['state'] }
    ]
  }
);

module.exports = PanditLocation;
