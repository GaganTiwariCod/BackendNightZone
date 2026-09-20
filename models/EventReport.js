const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventReport extends Model {}

EventReport.init(
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
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'dismissed', 'action_taken'),
      defaultValue: 'pending'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'EventReport',
    tableName: 'event_reports',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['reporter_id'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = EventReport;
