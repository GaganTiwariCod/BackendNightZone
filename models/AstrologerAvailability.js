const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologerAvailability extends Model {}

AstrologerAvailability.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    astrologer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrologer_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    day_of_week: {
      type: DataTypes.INTEGER, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      allowNull: false
    },
    start_time: {
      type: DataTypes.STRING(10), // e.g. "09:00"
      allowNull: false,
      defaultValue: '09:00'
    },
    end_time: {
      type: DataTypes.STRING(10), // e.g. "18:00"
      allowNull: false,
      defaultValue: '18:00'
    },
    slot_duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    break_start_time: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: '13:00'
    },
    break_end_time: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: '14:00'
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'Asia/Kolkata'
    },
    max_consultations_per_day: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'AstrologerAvailability',
    tableName: 'astrologer_availability',
    timestamps: true,
    underscored: true
  }
);

module.exports = AstrologerAvailability;
