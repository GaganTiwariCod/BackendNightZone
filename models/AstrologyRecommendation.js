const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyRecommendation extends Model {}

AstrologyRecommendation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    consultation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrology_consultations',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    astrologer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrologer_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    service_type: {
      type: DataTypes.ENUM('PUJA', 'KATHA', 'MANTRA', 'AARTI', 'GEMSTONE', 'RUDRAKSHA', 'VASTU_REMEDY', 'SPIRITUAL_GUIDANCE'),
      defaultValue: 'PUJA'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pandit_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'pandit_profiles',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    optional_action_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Direct link to book recommended puja / find pandit'
    }
  },
  {
    sequelize,
    modelName: 'AstrologyRecommendation',
    tableName: 'astrology_recommendations',
    timestamps: true,
    underscored: true
  }
);

module.exports = AstrologyRecommendation;
