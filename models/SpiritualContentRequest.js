const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpiritualContentRequest extends Model {}

SpiritualContentRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    request_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Katha'
    },
    deity_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'spiritual_deities',
        key: 'id'
      }
    },
    requested_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    language_code: {
      type: DataTypes.STRING(10),
      defaultValue: 'hi'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    additional_information: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'UNDER_REVIEW', 'COMPLETED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fulfilled_content_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'spiritual_contents',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'SpiritualContentRequest',
    tableName: 'spiritual_content_requests',
    indexes: [
      { fields: ['status'] },
      { fields: ['request_type'] },
      { fields: ['user_id'] }
    ]
  }
);

module.exports = SpiritualContentRequest;
