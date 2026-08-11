require('dotenv').config();

const bcrypt = require('bcryptjs');

const { connectDB, disconnectDB } = require('./config/database');
const User = require('./models/User');

const seedUsers = [
  {
    name: 'Customer User',
    email: 'customer@example.com',
    password: 'Customer@123',
    role: 'CUSTOMER'
  },
  {
    name: 'Driver One',
    email: 'driver1@example.com',
    password: 'Driver@123',
    role: 'DRIVER'
  },
  {
    name: 'Driver Two',
    email: 'driver2@example.com',
    password: 'Driver@123',
    role: 'DRIVER'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'ADMIN'
  }
];

const runSeed = async () => {
  await connectDB();

  const operations = await Promise.all(
    seedUsers.map(async (user) => ({
      updateOne: {
        filter: { email: user.email.toLowerCase() },
        update: {
          $setOnInsert: {
            name: user.name,
            email: user.email.toLowerCase(),
            password: await bcrypt.hash(user.password, 10),
            role: user.role
          }
        },
        upsert: true
      }
    }))
  );

  const result = await User.bulkWrite(operations, { ordered: false });

  console.log(`Seed complete. Users inserted: ${result.upsertedCount || 0}`);
};

runSeed()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });

