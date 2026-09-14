const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Testing Neon connection via Prisma...');
    const usersCount = await prisma.user.count();
    const coursesCount = await prisma.course.count();
    const postsCount = await prisma.post.count();
    const adsCount = await prisma.ad.count();
    const contributorsCount = await prisma.contributor.count();
    const walletsCount = await prisma.wallet.count();
    
    console.log('✅ Neon Tables verified successfully!');
    console.log(`Current counts in Neon:\n- Users: ${usersCount}\n- Courses: ${coursesCount}\n- Posts: ${postsCount}\n- Ads: ${adsCount}\n- Contributors: ${contributorsCount}\n- Wallets: ${walletsCount}`);
  } catch (err) {
    console.error('Error connecting to Neon:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
