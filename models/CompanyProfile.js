const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class CompanyProfile extends Model {}

CompanyProfile.init(
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
    company_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    tax_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    corporate_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    business_phone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    credit_limit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 50000.00
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'CompanyProfile',
    tableName: 'company_profiles',
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['tax_id'] }
    ]
  }
);

module.exports = CompanyProfile;
