const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class LifestyleProfile extends Model {}

LifestyleProfile.init(
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
    diet: {
      type: DataTypes.ENUM('vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'other', 'prefer_not_to_say'),
      defaultValue: 'vegetarian'
    },
    smoking: {
      type: DataTypes.ENUM('never', 'occasionally', 'regularly', 'prefer_not_to_say'),
      defaultValue: 'never'
    },
    drinking: {
      type: DataTypes.ENUM('never', 'occasionally', 'regularly', 'prefer_not_to_say'),
      defaultValue: 'never'
    },
    body_type: {
      type: DataTypes.ENUM('slim', 'athletic', 'average', 'heavy', 'prefer_not_to_say'),
      allowNull: true
    },
    physical_status: {
      type: DataTypes.ENUM('normal', 'physically_challenged', 'other'),
      defaultValue: 'normal'
    },
    languages_spoken: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of language strings spoken by user'
    }
  },
  {
    sequelize,
    modelName: 'LifestyleProfile',
    tableName: 'lifestyle_profiles',
    indexes: [
      { fields: ['profile_id'], unique: true },
      { fields: ['diet'] }
    ]
  }
);

module.exports = LifestyleProfile;
