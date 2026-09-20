const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditDocument extends Model {}

PanditDocument.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pandit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pandit_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    document_type: {
      type: DataTypes.ENUM('AADHAAR', 'PAN', 'VOTER_ID', 'PASSPORT', 'DRIVING_LICENSE', 'EDUCATION_CERTIFICATE', 'VEDIC_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'OTHER'),
      allowNull: false
    },
    document_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Securely stored/masked reference number'
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditDocument',
    tableName: 'pandit_documents',
    indexes: [
      { fields: ['pandit_id'] },
      { fields: ['document_type'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = PanditDocument;
