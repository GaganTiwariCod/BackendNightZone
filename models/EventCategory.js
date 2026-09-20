const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EventCategory extends Model {}

EventCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    icon: {
      type: DataTypes.STRING(100),
      defaultValue: 'Calendar'
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'EventCategory',
    tableName: 'event_categories',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['is_active'] },
      { fields: ['sort_order'] }
    ]
  }
);

module.exports = EventCategory;
