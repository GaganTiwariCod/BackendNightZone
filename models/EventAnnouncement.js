const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventAnnouncement extends Model {}

EventAnnouncement.init(
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('normal', 'important', 'urgent'),
      defaultValue: 'normal'
    }
  },
  {
    sequelize,
    modelName: 'EventAnnouncement',
    tableName: 'event_announcements',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['priority'] }
    ]
  }
);

module.exports = EventAnnouncement;
