const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class NewsSource extends Model {}

NewsSource.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    source_type: {
      type: DataTypes.ENUM('rss', 'api', 'scraper'),
      defaultValue: 'rss',
      allowNull: false
    },
    base_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    feed_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    scrape_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(20),
      defaultValue: 'en'
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fetch_interval_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    last_fetched_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_success_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_error_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_articles_fetched: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'NewsSource',
    tableName: 'news_sources',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['is_active'] },
      { fields: ['source_type'] },
      { fields: ['language'] }
    ]
  }
);

module.exports = NewsSource;
