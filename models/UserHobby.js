const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class UserHobby extends Model {}

UserHobby.init(
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
    hobby_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'master_hobbies',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'UserHobby',
    tableName: 'user_hobbies',
    indexes: [
      { fields: ['profile_id', 'hobby_id'], unique: true },
      { fields: ['profile_id'] },
      { fields: ['hobby_id'] }
    ]
  }
);

module.exports = UserHobby;
