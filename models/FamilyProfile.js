const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class FamilyProfile extends Model {}

FamilyProfile.init(
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
    family_type: {
      type: DataTypes.ENUM('nuclear', 'joint', 'other'),
      defaultValue: 'nuclear'
    },
    family_values: {
      type: DataTypes.ENUM('traditional', 'moderate', 'liberal'),
      defaultValue: 'moderate'
    },
    family_status: {
      type: DataTypes.ENUM('middle_class', 'upper_middle_class', 'rich', 'affluent'),
      defaultValue: 'middle_class'
    },
    family_location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    father_occupation: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    father_status: {
      type: DataTypes.ENUM('employed', 'business', 'retired', 'passed_away', 'homemaker', 'other'),
      allowNull: true
    },
    mother_occupation: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    mother_status: {
      type: DataTypes.ENUM('employed', 'business', 'retired', 'passed_away', 'homemaker', 'other'),
      allowNull: true
    },
    family_description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'FamilyProfile',
    tableName: 'family_profiles',
    indexes: [
      { fields: ['profile_id'], unique: true }
    ]
  }
);

module.exports = FamilyProfile;
