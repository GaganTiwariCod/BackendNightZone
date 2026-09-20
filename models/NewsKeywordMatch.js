const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class NewsKeywordMatch extends Model {}

NewsKeywordMatch.init(
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
    keyword_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    matched_text: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'NewsKeywordMatch',
    tableName: 'news_keyword_matches',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['news_id'] },
      { fields: ['keyword_id'] }
    ]
  }
);

module.exports = NewsKeywordMatch;
