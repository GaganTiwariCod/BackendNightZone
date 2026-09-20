const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualContentType extends Model {}

SpiritualContentType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '🪔'
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
    modelName: 'SpiritualContentType',
    tableName: 'spiritual_content_types',
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['is_active'] }
    ]
  }
);

module.exports = SpiritualContentType;
