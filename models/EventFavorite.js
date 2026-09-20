const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventFavorite extends Model {}

EventFavorite.init(
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
    }
  },
  {
    sequelize,
    modelName: 'EventFavorite',
    tableName: 'event_favorites',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['event_id', 'user_id'], unique: true }
    ]
  }
);

module.exports = EventFavorite;
