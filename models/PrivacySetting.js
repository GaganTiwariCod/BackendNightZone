const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PrivacySetting extends Model {}

PrivacySetting.init(
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
    profile_visibility: {
      type: DataTypes.ENUM('public', 'registered_users', 'matches_only', 'private'),
      defaultValue: 'public'
    },
    photo_visibility: {
      type: DataTypes.ENUM('public', 'registered_users', 'matches_only', 'private'),
      defaultValue: 'public'
    },
    contact_visibility: {
      type: DataTypes.ENUM('private', 'accepted_connections', 'authorized_users'),
      defaultValue: 'private'
    },
    horoscope_visibility: {
      type: DataTypes.ENUM('public', 'registered_users', 'matches_only', 'private'),
      defaultValue: 'registered_users'
    },
    income_visibility: {
      type: DataTypes.ENUM('visible', 'hidden'),
      defaultValue: 'visible'
    }
  },
  {
    sequelize,
    modelName: 'PrivacySetting',
    tableName: 'privacy_settings',
    indexes: [
      { fields: ['profile_id'], unique: true }
    ]
  }
);

module.exports = PrivacySetting;
