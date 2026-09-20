const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditAuditLog extends Model {}

PanditAuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    admin_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'VERIFICATION_APPROVED, VERIFICATION_REJECTED, DOCUMENT_VERIFIED, etc.'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditAuditLog',
    tableName: 'pandit_audit_logs',
    indexes: [
      { fields: ['pandit_id'] },
      { fields: ['admin_user_id'] }
    ]
  }
);

module.exports = PanditAuditLog;
