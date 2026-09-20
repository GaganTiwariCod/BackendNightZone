const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class EmailOtp extends Model {
  /**
   * Checks if OTP is expired or already used
   */
  isValid() {
    return !this.is_used && new Date(this.expires_at) > new Date();
  }
}

EmailOtp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('LOGIN', 'SIGNUP', 'RESET_PASSWORD'),
      defaultValue: 'LOGIN',
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'EmailOtp',
    tableName: 'email_otps',
    indexes: [
      { fields: ['email'] },
      { fields: ['otp'] }
    ]
  }
);

module.exports = EmailOtp;
