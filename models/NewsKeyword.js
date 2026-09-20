const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class NewsKeyword extends Model {}

NewsKeyword.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    keyword: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    normalized_keyword: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    language: {
      type: DataTypes.STRING(20),
      defaultValue: 'en'
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    weight: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    match_title: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    match_description: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    match_content: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'NewsKeyword',
    tableName: 'news_keywords',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['normalized_keyword'] },
      { fields: ['language'] },
      { fields: ['category_id'] },
      { fields: ['is_active'] }
    ]
  }
);

module.exports = NewsKeyword;
