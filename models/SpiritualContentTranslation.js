const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualContentTranslation extends Model {}

SpiritualContentTranslation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'spiritual_contents',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    language_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'hi',
      comment: 'e.g. hi, mr, en, sa, gu, etc.'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'Full long-form formatted spiritual text / katha / mantra / pooja vidhi / aarti'
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
      defaultValue: 'PUBLISHED'
    }
  },
  {
    sequelize,
    modelName: 'SpiritualContentTranslation',
    tableName: 'spiritual_content_translations',
    indexes: [
      { fields: ['content_id', 'language_code'], unique: true },
      { fields: ['language_code', 'slug'], unique: true },
      { fields: ['language_code'] },
      { fields: ['slug'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = SpiritualContentTranslation;
