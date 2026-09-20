const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualDeity extends Model {}

SpiritualDeity.init(
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
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
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
    modelName: 'SpiritualDeity',
    tableName: 'spiritual_deities',
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['is_active'] }
    ]
  }
);

module.exports = SpiritualDeity;
