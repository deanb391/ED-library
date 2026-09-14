import prisma from '../lib/prisma';

async function main() {
  try {
    console.log('Testing Neon connection via Prisma...');
    const usersCount = await prisma.user.count();
    const coursesCount = await prisma.course.count();
    const postsCount = await prisma.post.count();
    const adsCount = await prisma.ad.count();
    const contributorsCount = await prisma.contributor.count();
    const walletsCount = await prisma.wallet.count();
    
    console.log('Neon Tables verified successfully!');
    console.log(`Current counts in Neon: User: ${usersCount}, Course: ${coursesCount}, Post: ${postsCount}, Ad: ${adsCount}, Contributor: ${contributorsCount}, Wallet: ${walletsCount}`);
  } catch (err) {
    console.error('Error connecting to Neon:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
