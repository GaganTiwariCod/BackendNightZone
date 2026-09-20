const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class HoroscopeProfile extends Model {}

HoroscopeProfile.init(
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
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    time_of_birth: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    birth_place: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    birth_city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    birth_state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    birth_country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
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
      type: DataTypes.ENUM('yes', 'no', 'anshik', 'dont_know'),
      defaultValue: 'dont_know'
    },
    gotra: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    horoscope_file_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    horoscope_visibility: {
      type: DataTypes.ENUM('public', 'registered_users', 'matches_only', 'private'),
      defaultValue: 'registered_users'
    }
  },
  {
    sequelize,
    modelName: 'HoroscopeProfile',
    tableName: 'horoscope_profiles',
    indexes: [
      { fields: ['profile_id'], unique: true }
    ]
  }
);

module.exports = HoroscopeProfile;
