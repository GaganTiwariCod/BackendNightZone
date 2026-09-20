const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditAvailability extends Model {}

PanditAvailability.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pandit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'pandit_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    weekly_schedule: {
      type: DataTypes.JSON,
      defaultValue: {
        Monday: { available: true, startTime: '06:00', endTime: '20:00' },
        Tuesday: { available: true, startTime: '06:00', endTime: '20:00' },
        Wednesday: { available: true, startTime: '06:00', endTime: '20:00' },
        Thursday: { available: true, startTime: '06:00', endTime: '20:00' },
        Friday: { available: true, startTime: '06:00', endTime: '20:00' },
        Saturday: { available: true, startTime: '06:00', endTime: '21:00' },
        Sunday: { available: true, startTime: '06:00', endTime: '21:00' }
      }
    },
    home_visit: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    online_consultation: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    same_day_booking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    advance_booking_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'PanditAvailability',
    tableName: 'pandit_availability',
    indexes: [
      { fields: ['pandit_id'], unique: true }
    ]
  }
);

module.exports = PanditAvailability;
