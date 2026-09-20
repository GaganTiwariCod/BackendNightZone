const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class NewsFetchLog extends Model {}

NewsFetchLog.init(
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
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('running', 'success', 'partial', 'failed'),
      defaultValue: 'running'
    },
    articles_found: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    articles_added: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    duplicates_found: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    errors_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'NewsFetchLog',
    tableName: 'news_fetch_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['source_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] }
    ]
  }
);

module.exports = NewsFetchLog;
