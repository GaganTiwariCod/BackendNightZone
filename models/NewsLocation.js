const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class NewsLocation extends Model {}

NewsLocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    news_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    area: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'NewsLocation',
    tableName: 'news_locations',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['news_id'] },
      { fields: ['state'] },
      { fields: ['city'] }
    ]
  }
);

module.exports = NewsLocation;
