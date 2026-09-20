const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ConsultationMessage extends Model {}

ConsultationMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    consultation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrology_consultations',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    sender_role: {
      type: DataTypes.ENUM('USER', 'ASTROLOGER', 'SYSTEM'),
      defaultValue: 'USER'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    attachment_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'ConsultationMessage',
    tableName: 'consultation_messages',
    timestamps: true,
    underscored: true
  }
);

module.exports = ConsultationMessage;
