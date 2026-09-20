const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualContent extends Model {}

SpiritualContent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'spiritual_content_types',
        key: 'id'
      }
    },
    deity_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'spiritual_deities',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'spiritual_categories',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
      defaultValue: 'DRAFT'
    },
    type_specific_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Flexible storage for samagri, duration, occasion, chapters, sacred_verses, benefits, chanting instructions'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'SpiritualContent',
    tableName: 'spiritual_contents',
    indexes: [
      { fields: ['type_id'] },
      { fields: ['deity_id'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['is_featured'] },
      { fields: ['sort_order'] }
    ]
  }
);

module.exports = SpiritualContent;
