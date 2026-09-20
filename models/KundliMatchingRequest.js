const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class KundliMatchingRequest extends Model {}

KundliMatchingRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    person_a_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrology_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    person_b_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrology_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('CALCULATED', 'SAVED', 'CONSULTATION_REQUESTED'),
      defaultValue: 'CALCULATED'
    },
    guna_score: {
      type: DataTypes.DECIMAL(4, 1),
      defaultValue: 0.0
    },
    max_score: {
      type: DataTypes.DECIMAL(4, 1),
      defaultValue: 36.0
    },
    matching_result: {
      type: DataTypes.STRING(100),
      defaultValue: 'Average Match'
    },
    ashtakoot_breakdown: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Breakdown of Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi'
    },
    manglik_analysis: {
      type: DataTypes.JSON,
      allowNull: true
    },
    recommendation_summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    report_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'KundliMatchingRequest',
    tableName: 'kundli_matching_requests',
    timestamps: true,
    underscored: true
  }
);

module.exports = KundliMatchingRequest;
