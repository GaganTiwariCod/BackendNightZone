const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class CustomerProfile extends Model {}

CustomerProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  },
  {
    sequelize,
    modelName: 'CustomerProfile',
    tableName: 'customer_profiles',
    indexes: [
      { fields: ['user_id'], unique: true }
    ]
  }
);

module.exports = CustomerProfile;
