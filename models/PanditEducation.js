const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PanditEducation extends Model {}

PanditEducation.init(
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
    institution_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    course_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    education_type: {
      type: DataTypes.ENUM('Gurukul', 'Veda Pathshala', 'Sanskrit University', 'Religious Institution', 'Other'),
      defaultValue: 'Gurukul'
    },
    specialization: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    start_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    completion_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    certificate_file: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PanditEducation',
    tableName: 'pandit_education',
    indexes: [
      { fields: ['pandit_id'] }
    ]
  }
);

module.exports = PanditEducation;
