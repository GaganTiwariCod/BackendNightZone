const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditLanguage extends Model {}

PanditLanguage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pandit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pandit_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    language_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'master_languages',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    speaking_level: {
      type: DataTypes.ENUM('Basic', 'Conversational', 'Fluent', 'Native'),
      defaultValue: 'Fluent'
    },
    reading_level: {
      type: DataTypes.ENUM('Basic', 'Good', 'Expert / Vedic Mantras'),
      defaultValue: 'Expert / Vedic Mantras'
    }
  },
  {
    sequelize,
    modelName: 'PanditLanguage',
    tableName: 'pandit_languages',
    indexes: [
      { fields: ['pandit_id', 'language_id'], unique: true },
      { fields: ['pandit_id'] },
      { fields: ['language_id'] }
    ]
  }
);

module.exports = PanditLanguage;
