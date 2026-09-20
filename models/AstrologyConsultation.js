const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyConsultation extends Model {}

AstrologyConsultation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'astrology_bookings',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'MISSED'),
      defaultValue: 'SCHEDULED'
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    astrologer_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    report_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'AstrologyConsultation',
    tableName: 'astrology_consultations',
    timestamps: true,
    underscored: true
  }
);

module.exports = AstrologyConsultation;
