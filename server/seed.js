const User = require('./models/User');
const { hashPassword } = require('./utils/password');

async function seedAdmin() {
  const username = (process.env.ADMIN_USERNAME || '@Onpoint_Services').trim();
  const password = process.env.ADMIN_PASSWORD || 'Onpoint@123';

  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`[Seed] Admin user already exists: ${username}`);
    return existing;
  }

  const user = await User.create({
    username,
    password: hashPassword(password),
    fullName: 'Onpoint Services Admin',
    role: 'Administrator',
  });

  console.log(`[Seed] Created admin user: ${username}`);
  return user;
}

module.exports = { seedAdmin };
