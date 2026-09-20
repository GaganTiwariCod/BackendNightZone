const { sequelize } = require('../config/db');

async function alterRole() {
  try {
    await sequelize.query("ALTER TABLE `users` MODIFY COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER'");
    console.log('✅ Altered users.role column to VARCHAR(50)');
    process.exit(0);
  } catch (err) {
    console.error('Error altering role column:', err);
    process.exit(1);
  }
}

alterRole();
