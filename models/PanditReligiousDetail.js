const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditReligiousDetail extends Model {}

PanditReligiousDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pandit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'pandit_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    gotra: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pravara: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    veda: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Rigveda, Yajurveda (Shukla/Krishna), Samaveda, Atharvaveda'
    },
    shakha: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sutra: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sampradaya: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Smartha, Vaishnava, Shaiva, Shakta, Ramanuja, Madhva, Nimbarka, etc.'
    },
    kul: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    kul_devta: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    ishta_devta: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    guru_parampara: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sanskrit_knowledge: {
      type: DataTypes.ENUM('Beginner', 'Intermediate', 'Fluent', 'Scholar / Acharya'),
      defaultValue: 'Fluent'
    },
    vedic_education: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    additional_details: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditReligiousDetail',
    tableName: 'pandit_religious_details',
    indexes: [
      { fields: ['pandit_id'], unique: true },
      { fields: ['gotra'] },
      { fields: ['veda'] },
      { fields: ['sampradaya'] }
    ]
  }
);

module.exports = PanditReligiousDetail;
