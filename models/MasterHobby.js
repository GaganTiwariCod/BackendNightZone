const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MasterHobby extends Model {}

MasterHobby.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: 'General'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'MasterHobby',
    tableName: 'master_hobbies',
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['category'] }
    ]
  }
);

module.exports = MasterHobby;
