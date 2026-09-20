const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MasterLanguage extends Model {}

MasterLanguage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    script: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'MasterLanguage',
    tableName: 'master_languages',
    indexes: [
      { fields: ['name'], unique: true }
    ]
  }
);

module.exports = MasterLanguage;
