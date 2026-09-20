const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MeetupParticipant extends Model {}

MeetupParticipant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    meetup_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('REQUESTED', 'APPROVED', 'JOINED', 'LEFT', 'REMOVED'),
      defaultValue: 'JOINED'
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'MeetupParticipant',
    tableName: 'meetup_participants',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['meetup_id', 'user_id'], unique: true },
      { fields: ['status'] }
    ]
  }
);

module.exports = MeetupParticipant;
