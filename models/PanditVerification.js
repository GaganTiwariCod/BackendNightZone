const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditVerification extends Model {}

PanditVerification.init(
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
    identity_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    education_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    experience_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    address_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    overall_status: {
      type: DataTypes.ENUM('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditVerification',
    tableName: 'pandit_verifications',
    indexes: [
      { fields: ['pandit_id'], unique: true },
      { fields: ['overall_status'] }
    ]
  }
);

module.exports = PanditVerification;
