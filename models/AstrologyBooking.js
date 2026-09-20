const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyBooking extends Model {}

AstrologyBooking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    service_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'astrology_services',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    astrology_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrology_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    astrology_request_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'astrology_requests',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    consultation_type: {
      type: DataTypes.ENUM('CHAT', 'AUDIO_CALL', 'VIDEO_CALL', 'REPORT'),
      allowNull: false,
      defaultValue: 'CHAT'
    },
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.STRING(10), // e.g. "10:30"
      allowNull: false
    },
    end_time: {
      type: DataTypes.STRING(10), // e.g. "11:00"
      allowNull: false
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'Asia/Kolkata'
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'),
      defaultValue: 'SUCCESS'
    },
    booking_status: {
      type: DataTypes.ENUM('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'MISSED'),
      defaultValue: 'SCHEDULED'
    },
    meeting_reference: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'AstrologyBooking',
    tableName: 'astrology_bookings',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['astrologer_id', 'booking_date', 'start_time'] },
      { fields: ['user_id'] },
      { fields: ['astrology_profile_id'] }
    ]
  }
);

module.exports = AstrologyBooking;
