const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualTag extends Model {}

SpiritualTag.init(
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
    }
  },
  {
    sequelize,
    modelName: 'SpiritualTag',
    tableName: 'spiritual_tags',
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['slug'], unique: true }
    ]
  }
);

module.exports = SpiritualTag;
