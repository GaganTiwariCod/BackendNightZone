const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ProfileVerification extends Model {}

ProfileVerification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'matrimonial_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    verification_type: {
      type: DataTypes.ENUM('email', 'mobile', 'photo', 'identity', 'profile'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'),
      defaultValue: 'pending'
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
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  },
  {
    sequelize,
    modelName: 'ProfileVerification',
    tableName: 'profile_verifications',
    indexes: [
      { fields: ['profile_id'] },
      { fields: ['verification_type'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = ProfileVerification;
