const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ReligiousProfile extends Model {}

ReligiousProfile.init(
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
    religion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    community: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sub_community: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    caste_no_bar: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    gotra: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rashi: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nakshatra: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    manglik_status: {
      type: DataTypes.ENUM('yes', 'no', 'anshik', 'dont_know', 'not_applicable'),
      defaultValue: 'dont_know'
    },
    religious_values: {
      type: DataTypes.ENUM('traditional', 'moderate', 'liberal', 'flexible'),
      allowNull: true
    },
    horoscope_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'ReligiousProfile',
    tableName: 'religious_profiles',
    indexes: [
      { fields: ['profile_id'], unique: true },
      { fields: ['religion'] },
      { fields: ['community'] },
      { fields: ['manglik_status'] }
    ]
  }
);

module.exports = ReligiousProfile;
