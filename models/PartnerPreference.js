const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PartnerPreference extends Model {}

PartnerPreference.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'matrimonial_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    min_age: {
      type: DataTypes.INTEGER,
      defaultValue: 18
    },
    max_age: {
      type: DataTypes.INTEGER,
      defaultValue: 40
    },
    min_height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    max_height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    genders: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    religions: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    communities: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    mother_tongues: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    marital_statuses: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    countries: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    states: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    cities: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    education_levels: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    professions: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    industries: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    min_income: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    max_income: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    income_currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR'
    },
    diet_preferences: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    smoking_preferences: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    drinking_preferences: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    manglik_preferences: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    family_values: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    additional_preferences: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PartnerPreference',
    tableName: 'partner_preferences',
    indexes: [
      { fields: ['profile_id'], unique: true }
    ]
  }
);

module.exports = PartnerPreference;
