const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyProfile extends Model {}

AstrologyProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    profile_type: {
      type: DataTypes.ENUM('SELF', 'OTHER'),
      allowNull: false,
      defaultValue: 'SELF'
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    relationship: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Self'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
      defaultValue: 'male'
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time_of_birth: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '12:00'
    },
    birth_time_accuracy: {
      type: DataTypes.ENUM('ACCURATE', 'APPROXIMATE', 'UNKNOWN'),
      defaultValue: 'ACCURATE'
    },
    birth_country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    birth_state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    birth_city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    birth_place: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'New Delhi, India'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'Asia/Kolkata'
    },
    profile_photo: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'AstrologyProfile',
    tableName: 'astrology_profiles',
    timestamps: true,
    paranoid: true, // Enables soft-delete (deleted_at)
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['profile_type'] },
      { fields: ['user_id', 'profile_type'] }
    ]
  }
);

module.exports = AstrologyProfile;
