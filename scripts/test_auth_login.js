const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { argon2Verify } = require('hash-wasm');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testAuth() {
  console.log('Testing AuthService and Neon User Authentication...');
  
  // Find a user with password
  const user = await prisma.user.findFirst({
    where: { password: { not: null } },
  });

  if (!user) {
    console.log('No user with password found.');
    return;
  }

  console.log(`Found user: ${user.email} (ID: ${user.id})`);
  console.log(`Password Hash starts with: ${user.password.substring(0, 15)}...`);

  // Test token generation and verification
  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
  console.log(`Generated JWT Token: ${token.substring(0, 25)}...`);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(`Decoded JWT: userId=${decoded.userId}, email=${decoded.email}`);

  if (decoded.userId === user.id) {
    console.log('✅ JWT Token generation and verification works perfectly!');
  } else {
    console.error('❌ JWT Verification mismatch.');
  }
}

testAuth()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
