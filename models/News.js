const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class News extends Model {}

News.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    source_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(550),
      allowNull: false,
      unique: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content_excerpt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    source_url: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    author: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(20),
      defaultValue: 'en'
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    published_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fetched_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    content_hash: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    canonical_url: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    relevance_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pending', 'published', 'rejected', 'archived'),
      defaultValue: 'pending',
      allowNull: false
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_breaking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'News',
    tableName: 'news',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['source_id'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['language'] },
      { fields: ['published_at'] },
      { fields: ['relevance_score'] },
      { fields: ['content_hash'] },
      { fields: ['is_featured'] },
      { fields: ['is_breaking'] }
    ]
  }
);

module.exports = News;
