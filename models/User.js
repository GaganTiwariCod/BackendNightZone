const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const { ROLES, ROLE_LIST } = require('../constants/roles');

class User extends Model {
  /**
   * Compare plaintext candidate password with hashed password
   */
  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Check if user account is currently locked due to failed login attempts
   */
  isLocked() {
    return !!(this.lock_until && new Date(this.lock_until) > new Date());
  }

  /**
   * Increment failed login attempts and lock account if threshold exceeded
   */
  async incrementFailedAttempts(maxAttempts = 5, lockTimeMinutes = 15) {
    const attempts = this.failed_login_attempts + 1;
    let lockUntil = this.lock_until;

    if (attempts >= maxAttempts) {
      lockUntil = new Date(Date.now() + lockTimeMinutes * 60 * 1000);
    }

    return this.update({
      failed_login_attempts: attempts,
      lock_until: lockUntil
    });
  }

  /**
   * Reset failed login counter on successful authentication
   */
  async resetFailedAttempts() {
    if (this.failed_login_attempts > 0 || this.lock_until) {
      return this.update({
        failed_login_attempts: 0,
        lock_until: null
      });
    }
  }

  /**
   * Safe JSON output removing sensitive credential attributes
   */
  toSafeJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.password_reset_token;
    delete values.password_reset_expires;
    delete values.failed_login_attempts;
    delete values.lock_until;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' },
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Must be a valid email address' }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true // Nullable for OAuth-only accounts
    },
    role: {
      type: DataTypes.ENUM(...ROLE_LIST),
      defaultValue: ROLES.CUSTOMER,
      allowNull: false
    },
    auth_provider: {
      type: DataTypes.ENUM('LOCAL', 'GOOGLE'),
      defaultValue: 'LOCAL',
      allowNull: false
    },
    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lock_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password') && user.password) {
          const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
        if (user.changed('email') && user.email) {
          user.email = user.email.toLowerCase().trim();
        }
      }
    },
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['google_id'], unique: true },
      { fields: ['role'] }
    ]
  }
);

module.exports = User;
