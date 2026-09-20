const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualCategory extends Model {}

SpiritualCategory.init(
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
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'SpiritualCategory',
    tableName: 'spiritual_categories',
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['is_active'] }
    ]
  }
);

module.exports = SpiritualCategory;
