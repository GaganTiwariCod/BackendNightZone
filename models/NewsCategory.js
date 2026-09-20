const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class NewsCategory extends Model {}

NewsCategory.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'NewsCategory',
    tableName: 'news_categories',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['is_active'] },
      { fields: ['sort_order'] }
    ]
  }
);

module.exports = NewsCategory;
