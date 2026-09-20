const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyService extends Model {}

AstrologyService.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'astrology_categories',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    short_description: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cover_image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    pricing: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    login_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    birth_details_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    partner_details_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    booking_supported: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    consultation_supported: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    report_supported: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'AstrologyService',
    tableName: 'astrology_services',
    timestamps: true,
    underscored: true
  }
);

module.exports = AstrologyService;
