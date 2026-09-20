const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class FamilyMember extends Model {}

FamilyMember.init(
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
    relationship: {
      type: DataTypes.ENUM('father', 'mother', 'brother', 'sister', 'other'),
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    marital_status: {
      type: DataTypes.ENUM('never_married', 'married', 'divorced', 'widowed'),
      defaultValue: 'never_married'
    },
    occupation: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    education: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'FamilyMember',
    tableName: 'family_members',
    indexes: [
      { fields: ['profile_id'] }
    ]
  }
);

module.exports = FamilyMember;
