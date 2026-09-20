const { User } = require('../models');
const { ROLE_LIST } = require('../constants/roles');

const email = process.argv[2];
const newRole = process.argv[3] ? process.argv[3].toUpperCase() : 'ADMIN';

if (!email) {
  console.log('\n❌ Please provide an email address.');
  console.log('Usage: node scripts/setRole.js <user-email> [ADMIN|CUSTOMER|MERCHANT|COMPANY]');
  console.log('Example: node scripts/setRole.js gaganstiwari@gmail.com ADMIN\n');
  process.exit(1);
}

if (!ROLE_LIST.includes(newRole)) {
  console.log(`\n❌ Invalid role: "${newRole}". Valid roles are: ${ROLE_LIST.join(', ')}\n`);
  process.exit(1);
}

async function setRole() {
  try {
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      console.log(`\n❌ No user found with email: ${email}\n`);
      process.exit(1);
    }

    const oldRole = user.role;
    await user.update({ role: newRole });

    console.log(`\n✅ Success! User role updated:`);
    console.log(`   User:  ${user.name} (${user.email})`);
    console.log(`   Role:  ${oldRole} ➔ ${newRole}\n`);
    console.log(`💡 Next step: Log out and log back in on the frontend to refresh your access token and permissions.\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating role:', err.message);
    process.exit(1);
  }
}

setRole();
