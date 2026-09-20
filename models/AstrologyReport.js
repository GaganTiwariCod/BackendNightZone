const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyReport extends Model {}

AstrologyReport.init(
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
    astrologer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'astrologer_profiles',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'astrology_bookings',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    astrology_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'astrology_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    report_type: {
      type: DataTypes.ENUM(
        'KUNDLI_REPORT',
        'CAREER_REPORT',
        'MARRIAGE_REPORT',
        'RELATIONSHIP_REPORT',
        'BUSINESS_REPORT',
        'BIRTH_CHART_REPORT',
        'KUNDLI_MATCHING_REPORT',
        'PERSONALIZED_REPORT',
        'DOSHA_REMEDY_REPORT'
      ),
      defaultValue: 'KUNDLI_REPORT'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    analysis_content: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Structured charts, dosha summaries, and key predictions'
    },
    status: {
      type: DataTypes.ENUM('GENERATING', 'READY', 'DELIVERED', 'ARCHIVED'),
      defaultValue: 'READY'
    }
  },
  {
    sequelize,
    modelName: 'AstrologyReport',
    tableName: 'astrology_reports',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['astrology_profile_id'] }
    ]
  }
);

module.exports = AstrologyReport;
