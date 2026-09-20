const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MerchantProfile extends Model {}

MerchantProfile.init(
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
    store_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    store_slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    business_reg_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    store_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.00
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    }
  },
  {
    sequelize,
    modelName: 'MerchantProfile',
    tableName: 'merchant_profiles',
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['store_slug'], unique: true }
    ]
  }
);

module.exports = MerchantProfile;
