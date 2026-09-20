const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualRelatedContent extends Model {}

SpiritualRelatedContent.init(
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
    related_content_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'spiritual_contents',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'SpiritualRelatedContent',
    tableName: 'spiritual_related_contents',
    indexes: [
      { fields: ['content_id', 'related_content_id'], unique: true },
      { fields: ['content_id'] },
      { fields: ['related_content_id'] }
    ]
  }
);

module.exports = SpiritualRelatedContent;
