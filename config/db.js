const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'NightZone';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

/**
 * Initializes the database 'NightZone' if it doesn't exist already
 */
const initializeDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log(`✨ Database '${DB_NAME}' verified/created successfully.`);
  } catch (error) {
    console.warn(`⚠️ Could not auto-create database '${DB_NAME}': ${error.message}. Proceeding with direct Sequelize connection.`);
  }
};

/**
 * Production-ready Sequelize Instance with connection pooling
 */
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false, // Disabled verbose SQL query dumping
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

const connectDB = async () => {
  try {
    await initializeDatabase();
    await sequelize.authenticate();
    console.log(`🌙 NightZone MySQL Database connected successfully via Sequelize.`);
    
    // Sync models once (creates tables if they do not exist, without altering them continuously)
    await sequelize.sync();
    console.log('🔄 NightZone Sequelize models ready.');
  } catch (error) {
    console.error('❌ NightZone MySQL Connection Failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = {
  sequelize,
  connectDB
};
