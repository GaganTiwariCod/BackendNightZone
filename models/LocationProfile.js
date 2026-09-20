const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class LocationProfile extends Model {}

LocationProfile.init(
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
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    current_country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    current_state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    current_city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    hometown: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    hometown_state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    hometown_country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    grew_up_in: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    residential_status: {
      type: DataTypes.ENUM('citizen', 'permanent_resident', 'work_permit', 'student_visa', 'temporary_visa', 'other'),
      defaultValue: 'citizen'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    relocation_preference: {
      type: DataTypes.ENUM('yes', 'no', 'not_sure', 'within_country_only'),
      defaultValue: 'not_sure'
    }
  },
  {
    sequelize,
    modelName: 'LocationProfile',
    tableName: 'location_profiles',
    indexes: [
      { fields: ['profile_id'], unique: true },
      { fields: ['current_country'] },
      { fields: ['current_state'] },
      { fields: ['current_city'] }
    ]
  }
);

module.exports = LocationProfile;
