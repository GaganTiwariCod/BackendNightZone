const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologyReview extends Model {}

AstrologyReview.init(
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
      allowNull: false,
      references: {
        model: 'astrologer_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    consultation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'astrology_consultations',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'AstrologyReview',
    tableName: 'astrology_reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['astrologer_id'] },
      { fields: ['user_id'] }
    ]
  }
);

module.exports = AstrologyReview;
