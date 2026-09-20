const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MasterService extends Model {}

MasterService.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: 'Puja & Rituals'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: '🪔'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'MasterService',
    tableName: 'master_services',
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['category'] }
    ]
  }
);

module.exports = MasterService;
