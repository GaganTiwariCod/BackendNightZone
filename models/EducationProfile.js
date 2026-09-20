const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EducationProfile extends Model {}

EducationProfile.init(
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
    highest_education: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    education_field: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    college_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    university_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    additional_qualification: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    education_description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'EducationProfile',
    tableName: 'education_profiles',
    indexes: [
      { fields: ['profile_id'], unique: true },
      { fields: ['highest_education'] }
    ]
  }
);

module.exports = EducationProfile;
