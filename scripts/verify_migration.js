const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log('====================================================');
  console.log('STARTING RIGOROUS POST-MIGRATION VERIFICATION');
  console.log('====================================================');

  const snapshotPath = path.join(__dirname, '../migration_data/appwrite_full_export.json');
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

  const checks = [
    { name: 'Users', appwriteCount: 2109, getNeonCount: () => prisma.user.count() },
    { name: 'Courses', appwriteCount: (snapshot.collections['courses'] || []).length, getNeonCount: () => prisma.course.count() },
    { name: 'Posts', appwriteCount: (snapshot.collections['posts'] || []).length, getNeonCount: () => prisma.post.count() },
    { name: 'Ads', appwriteCount: (snapshot.collections['ads'] || []).length, getNeonCount: () => prisma.ad.count() },
    { name: 'Daily Users', appwriteCount: (snapshot.collections['daily_users'] || []).length, getNeonCount: () => prisma.dailyUser.count() },
    { name: 'Contributors', appwriteCount: (snapshot.collections['contributors'] || []).length, getNeonCount: () => prisma.contributor.count() },
    { name: 'Course Reviews', appwriteCount: (snapshot.collections['course_review_and_rating'] || []).length, getNeonCount: () => prisma.courseReviewAndRating.count() },
    { name: 'Payments', appwriteCount: (snapshot.collections['payments'] || []).length, getNeonCount: () => prisma.payment.count() },
    { name: 'Earnings', appwriteCount: (snapshot.collections['earnings'] || []).length, getNeonCount: () => prisma.earning.count() },
    { name: 'Wallets', appwriteCount: (snapshot.collections['wallet'] || []).length, getNeonCount: () => prisma.wallet.count() },
    { name: 'Library', appwriteCount: (snapshot.collections['library'] || []).length, getNeonCount: () => prisma.library.count() },
    { name: 'Transactions', appwriteCount: (snapshot.collections['transactions'] || []).length, getNeonCount: () => prisma.transaction.count() },
    { name: 'Wallet History', appwriteCount: (snapshot.collections['wallet_history'] || []).length, getNeonCount: () => prisma.walletHistory.count() },
    { name: 'Withdrawals', appwriteCount: (snapshot.collections['withdrawals'] || []).length, getNeonCount: () => prisma.withdrawal.count() },
    { name: 'Withdrawal Requests', appwriteCount: (snapshot.collections['withdrawal_requests'] || []).length, getNeonCount: () => prisma.withdrawalRequest.count() },
    { name: 'Subscriptions', appwriteCount: (snapshot.collections['subscriptions'] || []).length, getNeonCount: () => prisma.subscription.count() },
    { name: 'Analytics Events', appwriteCount: (snapshot.collections['analytics_events'] || []).length, getNeonCount: () => prisma.analyticsEvent.count() },
    { name: 'Analytics Daily Metrics', appwriteCount: (snapshot.collections['analytics_daily_metrics'] || []).length, getNeonCount: () => prisma.analyticsDailyMetric.count() },
    { name: 'Documents', appwriteCount: (snapshot.collections['documents'] || []).length, getNeonCount: () => prisma.document.count() },
    { name: 'Streaks', appwriteCount: (snapshot.collections['streaks'] || []).length, getNeonCount: () => prisma.streak.count() },
    { name: 'Weekly Awards', appwriteCount: (snapshot.collections['weekly_awards'] || []).length, getNeonCount: () => prisma.weeklyAward.count() },
    { name: 'Document Reviews', appwriteCount: (snapshot.collections['document_reviews'] || []).length, getNeonCount: () => prisma.documentReview.count() },
    { name: 'Monthly Users', appwriteCount: (snapshot.collections['monthly_users'] || []).length, getNeonCount: () => prisma.monthlyUser.count() },
    { name: 'Weekly Users', appwriteCount: (snapshot.collections['weekly_users'] || []).length, getNeonCount: () => prisma.weeklyUser.count() },
    { name: 'Chats', appwriteCount: (snapshot.collections['chats'] || []).length, getNeonCount: () => prisma.chat.count() },
    { name: 'Messages', appwriteCount: (snapshot.collections['messages'] || []).length, getNeonCount: () => prisma.message.count() },
    { name: 'Businesses', appwriteCount: (snapshot.collections['businesses'] || []).length, getNeonCount: () => prisma.business.count() },
    { name: 'Contest Performance', appwriteCount: (snapshot.collections['contest_performance'] || []).length, getNeonCount: () => prisma.contestPerformance.count() },
    { name: 'Sources', appwriteCount: (snapshot.collections['sources'] || []).length, getNeonCount: () => prisma.source.count() },
    { name: 'Communities', appwriteCount: (snapshot.collections['communities'] || []).length, getNeonCount: () => prisma.community.count() },
    { name: 'Threads', appwriteCount: (snapshot.collections['threads'] || []).length, getNeonCount: () => prisma.thread.count() },
  ];

  let totalDiscrepancies = 0;

  console.log('\n--- TABLE RECORD COUNTS COMPARISON ---');
  console.log('TABLE NAME'.padEnd(28) + ' | ' + 'APPWRITE'.padStart(10) + ' | ' + 'NEON POSTGRES'.padStart(14) + ' | STATUS');
  console.log('-'.repeat(65));

  for (const check of checks) {
    const neonCount = await check.getNeonCount();
    const match = neonCount === check.appwriteCount;
    if (!match) totalDiscrepancies++;
    const status = match ? '✅ MATCH' : `❌ MISMATCH (Diff: ${neonCount - check.appwriteCount})`;
    console.log(check.name.padEnd(28) + ' | ' + String(check.appwriteCount).padStart(10) + ' | ' + String(neonCount).padStart(14) + ' | ' + status);
  }

  // Sample data integrity checks
  console.log('\n--- SAMPLE DATA INTEGRITY CHECKS ---');
  const sampleUser = await prisma.user.findFirst({
    where: { password: { not: null } },
    include: { contributor: true, wallet: true, library: true },
  });

  if (sampleUser) {
    console.log(`✅ Sample User Found: ${sampleUser.id} (${sampleUser.email})`);
    console.log(`  - Has Argon2 Password Hash: ${sampleUser.password.startsWith('$argon2')}`);
    console.log(`  - Associated Wallet Balance: ${sampleUser.wallet?.balance ?? 'None'}`);
    console.log(`  - Contributor Account: ${sampleUser.contributor ? sampleUser.contributor.username : 'None'}`);
  }

  const sampleCourse = await prisma.course.findFirst({
    include: { user: true, posts: true, reviews: true },
  });

  if (sampleCourse) {
    console.log(`✅ Sample Course Found: ${sampleCourse.id} ("${sampleCourse.title}")`);
    console.log(`  - Files count: ${sampleCourse.files.length}`);
    console.log(`  - Creator Email: ${sampleCourse.user?.email || 'N/A'}`);
    console.log(`  - Reviews count: ${sampleCourse.reviews.length}`);
  }

  console.log('\n====================================================');
  if (totalDiscrepancies === 0) {
    console.log('🎯 VERIFICATION RESULT: 100% PERFECT MATCH ACROSS ALL TABLES!');
  } else {
    console.log(`⚠️ VERIFICATION FINISHED WITH ${totalDiscrepancies} DISCREPANCIES.`);
  }
  console.log('====================================================');
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
