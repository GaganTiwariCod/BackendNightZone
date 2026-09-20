const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditService extends Model {}

PanditService.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pandit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pandit_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'master_services',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditService',
    tableName: 'pandit_services',
    indexes: [
      { fields: ['pandit_id', 'service_id'], unique: true },
      { fields: ['pandit_id'] },
      { fields: ['service_id'] }
    ]
  }
);

module.exports = PanditService;
