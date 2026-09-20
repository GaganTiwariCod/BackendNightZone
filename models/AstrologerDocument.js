const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologerDocument extends Model {}

AstrologerDocument.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    doc_type: {
      type: DataTypes.ENUM('GOVT_ID', 'CERTIFICATION', 'QUALIFICATION', 'EXPERIENCE_PROOF', 'ADDRESS_PROOF', 'OTHER'),
      allowNull: false,
      defaultValue: 'CERTIFICATION'
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    document_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'image/jpeg'
    },
    file_size_bytes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'AstrologerDocument',
    tableName: 'astrologer_documents',
    timestamps: true,
    underscored: true
  }
);

module.exports = AstrologerDocument;
