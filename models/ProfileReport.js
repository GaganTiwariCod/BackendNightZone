const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ProfileReport extends Model {}

ProfileReport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    reported_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'matrimonial_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    reason: {
      type: DataTypes.ENUM('fake_profile', 'inappropriate_photos', 'harassment', 'fraud_scam', 'already_married', 'other'),
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
      defaultValue: 'pending'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'ProfileReport',
    tableName: 'profile_reports',
    indexes: [
      { fields: ['reporter_id'] },
      { fields: ['reported_profile_id'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = ProfileReport;
