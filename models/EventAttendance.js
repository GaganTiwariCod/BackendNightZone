const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventAttendance extends Model {}

EventAttendance.init(
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
    participant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ATTENDED', 'NO_SHOW'),
      defaultValue: 'ATTENDED'
    },
    check_in_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    check_in_method: {
      type: DataTypes.ENUM('manual', 'qr', 'code'),
      defaultValue: 'manual'
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'EventAttendance',
    tableName: 'event_attendance',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id', 'user_id'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = EventAttendance;
