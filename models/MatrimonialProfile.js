const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MatrimonialProfile extends Model {
  /**
   * Dynamically calculate age from date_of_birth
   */
  get age() {
    if (!this.date_of_birth) return null;
    const dob = new Date(this.date_of_birth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }
}

MatrimonialProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    profile_created_for: {
      type: DataTypes.ENUM('myself', 'son', 'daughter', 'brother', 'sister', 'friend', 'relative', 'other'),
      defaultValue: 'myself',
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    middle_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Height in cm or feet according to height_unit'
    },
    height_unit: {
      type: DataTypes.ENUM('cm', 'ft'),
      defaultValue: 'cm'
    },
    marital_status: {
      type: DataTypes.ENUM('never_married', 'divorced', 'widowed', 'awaiting_divorce', 'annulled'),
      defaultValue: 'never_married'
    },
    mother_tongue: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    about_me: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profile_status: {
      type: DataTypes.ENUM('draft', 'incomplete', 'pending_review', 'published', 'rejected', 'suspended', 'deactivated'),
      defaultValue: 'draft',
      allowNull: false
    },
    profile_visibility: {
      type: DataTypes.ENUM('public', 'registered_users', 'matches_only', 'private'),
      defaultValue: 'public',
      allowNull: false
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completion_percentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rejection_reason: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'MatrimonialProfile',
    tableName: 'matrimonial_profiles',
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['gender'] },
      { fields: ['marital_status'] },
      { fields: ['mother_tongue'] },
      { fields: ['profile_status'] },
      { fields: ['is_published'] },
      { fields: ['date_of_birth'] }
    ]
  }
);

module.exports = MatrimonialProfile;
