const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventChangeHistory extends Model {}

EventChangeHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    changed_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    change_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'EventChangeHistory',
    tableName: 'event_change_history',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['event_id'] }
    ]
  }
);

module.exports = EventChangeHistory;
