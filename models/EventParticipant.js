const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventParticipant extends Model {}

EventParticipant.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'INTERESTED',
        'CONFIRMED',
        'WAITLISTED',
        'DECLINED',
        'CANCELLED',
        'ATTENDED',
        'NO_SHOW'
      ),
      defaultValue: 'CONFIRMED'
    },
    guests_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    message_to_organizer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    waitlisted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'EventParticipant',
    tableName: 'event_participants',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id', 'user_id'], unique: true },
      { fields: ['status'] },
      { fields: ['joined_at'] }
    ]
  }
);

module.exports = EventParticipant;
