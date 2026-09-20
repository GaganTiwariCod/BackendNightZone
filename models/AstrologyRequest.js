const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyRequest extends Model {}

AstrologyRequest.init(
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
    astrology_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrology_profiles',
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
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'astrology_categories',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preferred_language: {
      type: DataTypes.STRING(50),
      defaultValue: 'Hindi'
    },
    consultation_type: {
      type: DataTypes.ENUM('CHAT', 'AUDIO_CALL', 'VIDEO_CALL', 'REPORT'),
      defaultValue: 'CHAT'
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'MATCHING', 'ASSIGNED', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CLOSED'),
      defaultValue: 'SUBMITTED'
    }
  },
  {
    sequelize,
    modelName: 'AstrologyRequest',
    tableName: 'astrology_requests',
    timestamps: true,
    underscored: true
  }
);

module.exports = AstrologyRequest;
