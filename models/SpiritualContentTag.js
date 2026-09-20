const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualContentTag extends Model {}

SpiritualContentTag.init(
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
    tag_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'spiritual_tags',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'SpiritualContentTag',
    tableName: 'spiritual_content_tags',
    indexes: [
      { fields: ['content_id', 'tag_id'], unique: true },
      { fields: ['content_id'] },
      { fields: ['tag_id'] }
    ]
  }
);

module.exports = SpiritualContentTag;
