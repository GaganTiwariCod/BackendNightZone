const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditProfile extends Model {}

PanditProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    display_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    profile_photo: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      defaultValue: 'male'
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    short_bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    pandit_types: {
      type: DataTypes.JSON,
      defaultValue: ['Purohit'],
      comment: 'Array of types e.g. Purohit, Vedic Pandit, Jyotish, Katha Vyas, Vastu Expert'
    },
    native_place: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'),
      defaultValue: 'DRAFT',
      allowNull: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.00
    },
    completed_services_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rejection_reason: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditProfile',
    tableName: 'pandit_profiles',
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['status'] },
      { fields: ['is_public'] },
      { fields: ['years_of_experience'] }
    ]
  }
);

module.exports = PanditProfile;
