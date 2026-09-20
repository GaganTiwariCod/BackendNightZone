const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditExperience extends Model {}

PanditExperience.init(
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
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    organization: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Temple, Ashram, Trust, or Independent'
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    start_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    end_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditExperience',
    tableName: 'pandit_experience',
    indexes: [
      { fields: ['pandit_id'] }
    ]
  }
);

module.exports = PanditExperience;
