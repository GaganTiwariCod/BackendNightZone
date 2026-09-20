const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class UserPhoto extends Model {}

UserPhoto.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'matrimonial_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    is_profile_photo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    visibility: {
      type: DataTypes.ENUM('public', 'registered_users', 'matches_only', 'private'),
      defaultValue: 'public'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'approved' // Automatically approved in development, moderateable by admin
    }
  },
  {
    sequelize,
    modelName: 'UserPhoto',
    tableName: 'user_photos',
    indexes: [
      { fields: ['profile_id'] },
      { fields: ['is_profile_photo'] }
    ]
  }
);

module.exports = UserPhoto;
