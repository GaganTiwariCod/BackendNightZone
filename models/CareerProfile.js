const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class CareerProfile extends Model {}

CareerProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'matrimonial_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    employment_status: {
      type: DataTypes.ENUM('employed', 'self_employed', 'business', 'government', 'student', 'not_working', 'retired', 'other'),
      defaultValue: 'employed'
    },
    profession: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    job_title: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    company_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    work_city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    work_state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    work_country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    annual_income: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true,
      comment: 'Numeric annual income in chosen currency'
    },
    income_currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR'
    },
    income_visibility: {
      type: DataTypes.ENUM('visible', 'hidden'),
      defaultValue: 'visible'
    },
    employment_type: {
      type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'freelance', 'business', 'other'),
      defaultValue: 'full_time'
    }
  },
  {
    sequelize,
    modelName: 'CareerProfile',
    tableName: 'career_profiles',
    indexes: [
      { fields: ['profile_id'], unique: true },
      { fields: ['profession'] },
      { fields: ['employment_status'] },
      { fields: ['annual_income'] }
    ]
  }
);

module.exports = CareerProfile;
