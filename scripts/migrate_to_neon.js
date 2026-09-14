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

function getRelId(val) {
  if (!val) return null;
  if (typeof val === 'object' && val.$id) return val.$id;
  if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  return null;
}

function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function toStringArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return [val];
    }
  }
  return [];
}

async function migrate() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('STARTING BULLETPROOF MIGRATION TO NEON POSTGRES');
  console.log('====================================================');

  const snapshotPath = path.join(__dirname, '../migration_data/appwrite_full_export.json');
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot file not found at ${snapshotPath}`);
  }

  console.log('Reading migration snapshot...');
  const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
  const { authUsers, collections } = data;

  console.log(`Loaded snapshot with ${authUsers.length} Auth Users and ${Object.keys(collections).length} Collections.`);

  // ----------------------------------------------------
  // STEP 1: MIGRATE USERS (Auth Accounts + Profiles)
  // ----------------------------------------------------
  console.log('\n--- 1. Migrating Users ---');
  const userProfileMap = new Map();
  const userDocs = collections['user'] || [];
  for (const doc of userDocs) {
    userProfileMap.set(doc.$id, doc);
  }

  const allUserIds = new Set();
  const usersToInsert = [];

  for (const auth of authUsers) {
    allUserIds.add(auth.$id);
    const profile = userProfileMap.get(auth.$id);
    
    usersToInsert.push({
      id: auth.$id,
      email: (auth.email || `${auth.$id}@placeholder.local`).trim().toLowerCase(),
      name: auth.name || profile?.username || null,
      username: profile?.username || auth.name || auth.email?.split('@')[0] || auth.$id,
      password: auth.password || null, // Argon2 hash preserved as-is!
      googleId: null,
      accountId: profile?.accountId || auth.$id,
      avatar: profile?.avatar || null,
      department: profile?.department || null,
      level: profile?.level ? parseInt(profile.level, 10) : null,
      university: profile?.university || null,
      referredBy: profile?.referredBy || null,
      isAdmin: profile?.isAdmin === true,
      isContributor: profile?.isContributor === true,
      followingContributors: profile?.followingContributors || null,
      deactivatedAt: toDate(profile?.deactivatedAt),
      lastTime: toDate(profile?.lastTime) || toDate(auth.accessedAt),
      status: auth.status !== undefined ? !!auth.status : true,
      emailVerification: auth.emailVerification === true,
      phone: auth.phone || null,
      createdAt: toDate(auth.registration) || toDate(auth.$createdAt) || new Date(),
      updatedAt: toDate(auth.$updatedAt) || new Date(),
    });
  }

  // Also include any user profile documents that weren't in auth list
  for (const profile of userDocs) {
    if (!allUserIds.has(profile.$id)) {
      allUserIds.add(profile.$id);
      usersToInsert.push({
        id: profile.$id,
        email: (profile.email || `${profile.$id}@placeholder.local`).trim().toLowerCase(),
        name: profile.username || null,
        username: profile.username || profile.$id,
        password: null,
        googleId: null,
        accountId: profile.accountId || profile.$id,
        avatar: profile.avatar || null,
        department: profile.department || null,
        level: profile.level ? parseInt(profile.level, 10) : null,
        university: profile.university || null,
        referredBy: profile.referredBy || null,
        isAdmin: profile.isAdmin === true,
        isContributor: profile.isContributor === true,
        followingContributors: profile.followingContributors || null,
        deactivatedAt: toDate(profile.deactivatedAt),
        lastTime: toDate(profile.lastTime),
        status: true,
        emailVerification: false,
        phone: null,
        createdAt: toDate(profile.$createdAt) || new Date(),
        updatedAt: toDate(profile.$updatedAt) || new Date(),
      });
    }
  }

  console.log(`Inserting ${usersToInsert.length} Users into Neon...`);
  // Insert in batches of 200
  for (let i = 0; i < usersToInsert.length; i += 200) {
    const chunk = usersToInsert.slice(i, i + 200);
    await prisma.user.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`  Users progress: ${Math.min(i + 200, usersToInsert.length)} / ${usersToInsert.length}`);
  }
  console.log('✅ Users migration completed.');

  // Helper to check valid user
  const validUserIds = new Set((await prisma.user.findMany({ select: { id: true } })).map(u => u.id));

  // ----------------------------------------------------
  // STEP 2: COURSES
  // ----------------------------------------------------
  console.log('\n--- 2. Migrating Courses ---');
  const courseDocs = collections['courses'] || [];
  const coursesToInsert = courseDocs.map(c => {
    const rawUserId = getRelId(c.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: c.$id,
      title: c.title || null,
      code: c.code || null,
      description: c.description || null,
      lecturer: c.lecturer || null,
      thumbnailId: c.thumbnailId || null,
      thumbnailUrl: c.thumbnailUrl || null,
      files: toStringArray(c.files),
      lastOperation: c.lastOperation || null,
      userId,
      session: c.session || null,
      department: c.department || null,
      level: c.level ? parseInt(c.level, 10) : null,
      isOnGoing: c.isOnGoing !== false,
      price: c.price ? String(c.price) : null,
      university: c.university || null,
      analytics: c.analytics || null,
      pageCount: c.pageCount ? parseInt(c.pageCount, 10) : 0,
      isFree: c.isFree !== undefined ? !!c.isFree : null,
      rating: c.rating ? parseFloat(c.rating) : null,
      status: c.status || 'live',
      createdAt: toDate(c.$createdAt) || new Date(),
      updatedAt: toDate(c.$updatedAt) || new Date(),
    };
  });

  if (coursesToInsert.length > 0) {
    await prisma.course.createMany({ data: coursesToInsert, skipDuplicates: true });
  }
  console.log(`✅ Courses migrated: ${coursesToInsert.length}`);
  const validCourseIds = new Set((await prisma.course.findMany({ select: { id: true } })).map(c => c.id));

  // ----------------------------------------------------
  // STEP 3: POSTS
  // ----------------------------------------------------
  console.log('\n--- 3. Migrating Posts ---');
  const postDocs = collections['posts'] || [];
  const postsToInsert = postDocs.map(p => {
    const rawCourseId = getRelId(p.courses);
    const courseId = rawCourseId && validCourseIds.has(rawCourseId) ? rawCourseId : null;
    return {
      id: p.$id,
      description: p.description || null,
      images: toStringArray(p.images),
      courseId,
      createdAt: toDate(p.$createdAt) || new Date(),
      updatedAt: toDate(p.$updatedAt) || new Date(),
    };
  });
  if (postsToInsert.length > 0) {
    for (let i = 0; i < postsToInsert.length; i += 200) {
      await prisma.post.createMany({ data: postsToInsert.slice(i, i + 200), skipDuplicates: true });
    }
  }
  console.log(`✅ Posts migrated: ${postsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 4: ADS
  // ----------------------------------------------------
  console.log('\n--- 4. Migrating Ads ---');
  const adDocs = collections['ads'] || [];
  const adsToInsert = adDocs.map(a => {
    const rawUserId = getRelId(a.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: a.$id,
      name: a.name || null,
      videos: toStringArray(a.videos),
      uniqueUsers: toStringArray(a.uniqueUsers),
      isExpired: a.isExpired === true,
      endTime: toDate(a.endTime),
      userId,
      views: a.views ? parseInt(a.views, 10) : 0,
      type: a.type || null,
      link: a.link || null,
      smallImages: toStringArray(a.smallImages),
      mediumImages: toStringArray(a.mediumImages),
      largeImages: toStringArray(a.largeImages),
      clicks: a.clicks ? parseInt(a.clicks, 10) : 0,
      createdAt: toDate(a.$createdAt) || new Date(),
      updatedAt: toDate(a.$updatedAt) || new Date(),
    };
  });
  if (adsToInsert.length > 0) {
    await prisma.ad.createMany({ data: adsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Ads migrated: ${adsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 5: DAILY USERS
  // ----------------------------------------------------
  console.log('\n--- 5. Migrating Daily Users ---');
  const dailyUserDocs = collections['daily_users'] || [];
  const dailyUsersToInsert = dailyUserDocs.map(d => ({
    id: d.$id,
    date: d.date || '',
    count: d.count !== undefined ? parseInt(d.count, 10) : 0,
    day: d.day || '',
    createdAt: toDate(d.$createdAt) || new Date(),
    updatedAt: toDate(d.$updatedAt) || new Date(),
  }));
  if (dailyUsersToInsert.length > 0) {
    await prisma.dailyUser.createMany({ data: dailyUsersToInsert, skipDuplicates: true });
  }
  console.log(`✅ Daily Users migrated: ${dailyUsersToInsert.length}`);

  // ----------------------------------------------------
  // STEP 6: CONTRIBUTORS
  // ----------------------------------------------------
  console.log('\n--- 6. Migrating Contributors ---');
  const contributorDocs = collections['contributors'] || [];
  const contributorsToInsert = contributorDocs.map(c => {
    const rawUserId = getRelId(c.user) || (c.userId && validUserIds.has(c.userId) ? c.userId : null);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: c.$id,
      username: c.username || null,
      institution: c.institution || null,
      country: c.country || null,
      bio: c.bio || null,
      category: toStringArray(c.category),
      reviewImages: toStringArray(c.reviewImages),
      profileImage: c.profileImage || null,
      status: c.status || null,
      userId,
      approvalNotes: c.approvalNotes || null,
      followers: c.followers ? parseInt(c.followers, 10) : 0,
      followersIds: c.followersIds || null,
      total_earnings: c.total_earnings ? parseInt(c.total_earnings, 10) : null,
      hasSeenCelebration: c.hasSeenCelebration === true,
      agreed: c.agreed === true,
      uploadCount: c.uploadCount ? parseInt(c.uploadCount, 10) : 0,
      weeklyUploadCount: c.weeklyUploadCount ? parseInt(c.weeklyUploadCount, 10) : 0,
      isTopContributor: c.isTopContributor === true,
      topContributorWeek: c.topContributorWeek || null,
      joinedContest: c.joinedContest === true,
      joinedContestAt: c.joinedContestAt || null,
      phone: c.phone || null,
      createdAt: toDate(c.$createdAt) || new Date(),
      updatedAt: toDate(c.$updatedAt) || new Date(),
    };
  });
  if (contributorsToInsert.length > 0) {
    await prisma.contributor.createMany({ data: contributorsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Contributors migrated: ${contributorsToInsert.length}`);
  const validContributorIds = new Set((await prisma.contributor.findMany({ select: { id: true } })).map(c => c.id));

  // ----------------------------------------------------
  // STEP 7: COURSE REVIEWS AND RATINGS
  // ----------------------------------------------------
  console.log('\n--- 7. Migrating Course Reviews ---');
  const reviewDocs = collections['course_review_and_rating'] || [];
  const reviewsToInsert = reviewDocs.map(r => {
    const rawCourseId = getRelId(r.courses);
    const courseId = rawCourseId && validCourseIds.has(rawCourseId) ? rawCourseId : null;
    const rawUserId = getRelId(r.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: r.$id,
      courseId,
      userId,
      rating: r.rating ? parseInt(r.rating, 10) : null,
      review: r.review || null,
      createdAt: toDate(r.$createdAt) || new Date(),
      updatedAt: toDate(r.$updatedAt) || new Date(),
    };
  });
  if (reviewsToInsert.length > 0) {
    await prisma.courseReviewAndRating.createMany({ data: reviewsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Course Reviews migrated: ${reviewsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 8: PAYMENTS
  // ----------------------------------------------------
  console.log('\n--- 8. Migrating Payments ---');
  const paymentDocs = collections['payments'] || [];
  const paymentsToInsert = paymentDocs.map(p => {
    const rawUserId = getRelId(p.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: p.$id,
      type: p.type || null,
      status: p.status || null,
      userId,
      description: p.description || null,
      transactionId: p.transactionId || null,
      courses: p.courses || null,
      provider: p.provider || null,
      amount: p.amount ? parseFloat(p.amount) : null,
      createdAt: toDate(p.$createdAt) || new Date(),
      updatedAt: toDate(p.$updatedAt) || new Date(),
    };
  });
  if (paymentsToInsert.length > 0) {
    await prisma.payment.createMany({ data: paymentsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Payments migrated: ${paymentsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 9: EARNINGS
  // ----------------------------------------------------
  console.log('\n--- 9. Migrating Earnings ---');
  const earningDocs = collections['earnings'] || [];
  const earningsToInsert = earningDocs.map(e => {
    const rawContributorId = getRelId(e.contributors);
    const contributorId = rawContributorId && validContributorIds.has(rawContributorId) ? rawContributorId : null;
    return {
      id: e.$id,
      description: e.description || null,
      courses: e.courses || null,
      type: e.type || null,
      contributorId,
      amount: e.amount ? parseFloat(e.amount) : null,
      createdAt: toDate(e.$createdAt) || new Date(),
      updatedAt: toDate(e.$updatedAt) || new Date(),
    };
  });
  if (earningsToInsert.length > 0) {
    await prisma.earning.createMany({ data: earningsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Earnings migrated: ${earningsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 10: WALLET
  // ----------------------------------------------------
  console.log('\n--- 10. Migrating Wallets ---');
  const walletDocs = collections['wallet'] || [];
  const walletsToInsert = walletDocs.map(w => {
    const rawUserId = getRelId(w.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: w.$id,
      userId,
      cashout_account: w.cashout_account || null,
      balance: w.balance ? parseFloat(w.balance) : 0,
      createdAt: toDate(w.$createdAt) || new Date(),
      updatedAt: toDate(w.$updatedAt) || new Date(),
    };
  });
  if (walletsToInsert.length > 0) {
    for (let i = 0; i < walletsToInsert.length; i += 200) {
      await prisma.wallet.createMany({ data: walletsToInsert.slice(i, i + 200), skipDuplicates: true });
    }
  }
  console.log(`✅ Wallets migrated: ${walletsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 11: LIBRARY
  // ----------------------------------------------------
  console.log('\n--- 11. Migrating Library ---');
  const libraryDocs = collections['library'] || [];
  const librariesToInsert = libraryDocs.map(l => {
    const rawUserId = getRelId(l.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: l.$id,
      userId,
      oneTime: l.oneTime || null,
      subscription: l.subscription || null,
      createdAt: toDate(l.$createdAt) || new Date(),
      updatedAt: toDate(l.$updatedAt) || new Date(),
    };
  });
  if (librariesToInsert.length > 0) {
    await prisma.library.createMany({ data: librariesToInsert, skipDuplicates: true });
  }
  console.log(`✅ Libraries migrated: ${librariesToInsert.length}`);

  // ----------------------------------------------------
  // STEP 12: TRANSACTIONS
  // ----------------------------------------------------
  console.log('\n--- 12. Migrating Transactions ---');
  const txDocs = collections['transactions'] || [];
  const txToInsert = txDocs.map(t => {
    const rawUserId = getRelId(t.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: t.$id,
      userId,
      type: t.type || 'deposit',
      direction: t.direction || null,
      amount: t.amount ? parseFloat(t.amount) : null,
      reference: t.reference || null,
      createdAt: toDate(t.$createdAt) || new Date(),
      updatedAt: toDate(t.$updatedAt) || new Date(),
    };
  });
  if (txToInsert.length > 0) {
    for (let i = 0; i < txToInsert.length; i += 200) {
      await prisma.transaction.createMany({ data: txToInsert.slice(i, i + 200), skipDuplicates: true });
    }
  }
  console.log(`✅ Transactions migrated: ${txToInsert.length}`);

  // ----------------------------------------------------
  // STEP 13: WALLET HISTORY
  // ----------------------------------------------------
  console.log('\n--- 13. Migrating Wallet History ---');
  const whDocs = collections['wallet_history'] || [];
  const whToInsert = whDocs.map(w => {
    const rawUserId = getRelId(w.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: w.$id,
      userId,
      type: w.type || null,
      description: w.description || null,
      amount: w.amount ? parseFloat(w.amount) : null,
      createdAt: toDate(w.$createdAt) || new Date(),
      updatedAt: toDate(w.$updatedAt) || new Date(),
    };
  });
  if (whToInsert.length > 0) {
    await prisma.walletHistory.createMany({ data: whToInsert, skipDuplicates: true });
  }
  console.log(`✅ Wallet History migrated: ${whToInsert.length}`);

  // ----------------------------------------------------
  // STEP 14: WITHDRAWALS
  // ----------------------------------------------------
  console.log('\n--- 14. Migrating Withdrawals ---');
  const withDocs = collections['withdrawals'] || [];
  const withToInsert = withDocs.map(w => {
    const rawUserId = getRelId(w.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: w.$id,
      userId,
      amount: w.amount ? parseFloat(w.amount) : null,
      status: w.status || 'pending',
      description: w.description || null,
      refund: w.refund ? parseFloat(w.refund) : null,
      createdAt: toDate(w.$createdAt) || new Date(),
      updatedAt: toDate(w.$updatedAt) || new Date(),
    };
  });
  if (withToInsert.length > 0) {
    await prisma.withdrawal.createMany({ data: withToInsert, skipDuplicates: true });
  }
  console.log(`✅ Withdrawals migrated: ${withToInsert.length}`);

  // ----------------------------------------------------
  // STEP 15: WITHDRAWAL REQUESTS
  // ----------------------------------------------------
  console.log('\n--- 15. Migrating Withdrawal Requests ---');
  const wrDocs = collections['withdrawal_requests'] || [];
  const wrToInsert = wrDocs.map(w => {
    const rawUserId = getRelId(w.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: w.$id,
      userId,
      amount: w.amount ? parseFloat(w.amount) : null,
      createdAt: toDate(w.$createdAt) || new Date(),
      updatedAt: toDate(w.$updatedAt) || new Date(),
    };
  });
  if (wrToInsert.length > 0) {
    await prisma.withdrawalRequest.createMany({ data: wrToInsert, skipDuplicates: true });
  }
  console.log(`✅ Withdrawal Requests migrated: ${wrToInsert.length}`);

  // ----------------------------------------------------
  // STEP 16: SUBSCRIPTIONS
  // ----------------------------------------------------
  console.log('\n--- 16. Migrating Subscriptions ---');
  const subDocs = collections['subscriptions'] || [];
  const subsToInsert = subDocs.map(s => {
    const rawUserId = getRelId(s.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    const rawCourseId = getRelId(s.courses);
    const courseId = rawCourseId && validCourseIds.has(rawCourseId) ? rawCourseId : null;
    return {
      id: s.$id,
      userId,
      courseId,
      startDate: toDate(s.startDate),
      endDate: toDate(s.endDate),
      status: s.status || null,
      createdAt: toDate(s.$createdAt) || new Date(),
      updatedAt: toDate(s.$updatedAt) || new Date(),
    };
  });
  if (subsToInsert.length > 0) {
    await prisma.subscription.createMany({ data: subsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Subscriptions migrated: ${subsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 17: ANALYTICS EVENTS
  // ----------------------------------------------------
  console.log('\n--- 17. Migrating Analytics Events ---');
  const aeDocs = collections['analytics_events'] || [];
  const aeToInsert = aeDocs.map(e => ({
    id: e.$id,
    eventName: e.eventName || '',
    distinctId: e.distinctId || '',
    userId: e.userId || null,
    metadata: e.metadata || null,
    value: e.value ? parseFloat(e.value) : null,
    createdAt: toDate(e.$createdAt) || new Date(),
    updatedAt: toDate(e.$updatedAt) || new Date(),
  }));
  if (aeToInsert.length > 0) {
    for (let i = 0; i < aeToInsert.length; i += 500) {
      await prisma.analyticsEvent.createMany({ data: aeToInsert.slice(i, i + 500), skipDuplicates: true });
      console.log(`  Analytics Events progress: ${Math.min(i + 500, aeToInsert.length)} / ${aeToInsert.length}`);
    }
  }
  console.log(`✅ Analytics Events migrated: ${aeToInsert.length}`);

  // ----------------------------------------------------
  // STEP 18: ANALYTICS DAILY METRICS
  // ----------------------------------------------------
  console.log('\n--- 18. Migrating Analytics Daily Metrics ---');
  const admDocs = collections['analytics_daily_metrics'] || [];
  const admToInsert = admDocs.map(m => ({
    id: m.$id,
    date: m.date || '',
    metric: m.metric || '',
    value: m.value ? parseFloat(m.value) : 0,
    category: m.category || null,
    dimension: m.dimension || null,
    createdAt: toDate(m.$createdAt) || new Date(),
    updatedAt: toDate(m.$updatedAt) || new Date(),
  }));
  if (admToInsert.length > 0) {
    for (let i = 0; i < admToInsert.length; i += 500) {
      await prisma.analyticsDailyMetric.createMany({ data: admToInsert.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`✅ Analytics Daily Metrics migrated: ${admToInsert.length}`);

  // ----------------------------------------------------
  // STEP 19: DOCUMENTS
  // ----------------------------------------------------
  console.log('\n--- 19. Migrating Documents ---');
  const docDocs = collections['documents'] || [];
  const docsToInsert = docDocs.map(d => {
    const rawCourseId = getRelId(d.courses);
    const courseId = rawCourseId && validCourseIds.has(rawCourseId) ? rawCourseId : null;
    const rawUserId = getRelId(d.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: d.$id,
      courseId,
      userId,
      fileUrl: d.fileUrl || null,
      fileName: d.fileName || null,
      fileSize: d.fileSize ? parseFloat(d.fileSize) : null,
      fileType: d.fileType || null,
      description: d.description || null,
      status: d.status || 'pending',
      reviewReason: d.reviewReason || null,
      createdAt: toDate(d.$createdAt) || new Date(),
      updatedAt: toDate(d.$updatedAt) || new Date(),
    };
  });
  if (docsToInsert.length > 0) {
    await prisma.document.createMany({ data: docsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Documents migrated: ${docsToInsert.length}`);
  const validDocumentIds = new Set((await prisma.document.findMany({ select: { id: true } })).map(d => d.id));

  // ----------------------------------------------------
  // STEP 20: STREAKS
  // ----------------------------------------------------
  console.log('\n--- 20. Migrating Streaks ---');
  const streakDocs = collections['streaks'] || [];
  const streaksToInsert = streakDocs.map(s => {
    const rawContributorId = getRelId(s.contributors);
    const contributorId = rawContributorId && validContributorIds.has(rawContributorId) ? rawContributorId : null;
    const rawUserId = getRelId(s.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: s.$id,
      contributorId,
      userId,
      currentStreak: s.currentStreak ? parseInt(s.currentStreak, 10) : null,
      longestStreak: s.longestStreak ? parseInt(s.longestStreak, 10) : null,
      joinedDate: s.joinedDate || null,
      lastUploadDate: s.lastUploadDate || null,
      streakHistory: s.streakHistory || null,
      createdAt: toDate(s.$createdAt) || new Date(),
      updatedAt: toDate(s.$updatedAt) || new Date(),
    };
  });
  if (streaksToInsert.length > 0) {
    await prisma.streak.createMany({ data: streaksToInsert, skipDuplicates: true });
  }
  console.log(`✅ Streaks migrated: ${streaksToInsert.length}`);

  // ----------------------------------------------------
  // STEP 21: WEEKLY AWARDS
  // ----------------------------------------------------
  console.log('\n--- 21. Migrating Weekly Awards ---');
  const waDocs = collections['weekly_awards'] || [];
  const waToInsert = waDocs.map(w => {
    const rawContributorId = getRelId(w.contributors);
    const contributorId = rawContributorId && validContributorIds.has(rawContributorId) ? rawContributorId : null;
    return {
      id: w.$id,
      contributorId,
      contributorName: w.contributorName || null,
      contributorImage: w.contributorImage || null,
      weekStart: w.weekStart || null,
      weekEnd: w.weekEnd || null,
      weeklyUploads: w.weeklyUploads ? parseInt(w.weeklyUploads, 10) : null,
      totalUploads: w.totalUploads ? parseInt(w.totalUploads, 10) : null,
      awardedAt: w.awardedAt || null,
      createdAt: toDate(w.$createdAt) || new Date(),
      updatedAt: toDate(w.$updatedAt) || new Date(),
    };
  });
  if (waToInsert.length > 0) {
    await prisma.weeklyAward.createMany({ data: waToInsert, skipDuplicates: true });
  }
  console.log(`✅ Weekly Awards migrated: ${waToInsert.length}`);

  // ----------------------------------------------------
  // STEP 22: DOCUMENT REVIEWS
  // ----------------------------------------------------
  console.log('\n--- 22. Migrating Document Reviews ---');
  const drDocs = collections['document_reviews'] || [];
  const drToInsert = drDocs.map(d => {
    const rawDocumentId = getRelId(d.documents);
    const documentId = rawDocumentId && validDocumentIds.has(rawDocumentId) ? rawDocumentId : null;
    const rawCourseId = getRelId(d.courses);
    const courseId = rawCourseId && validCourseIds.has(rawCourseId) ? rawCourseId : null;
    const rawContributorId = getRelId(d.contributors);
    const contributorId = rawContributorId && validContributorIds.has(rawContributorId) ? rawContributorId : null;
    return {
      id: d.$id,
      documentId,
      courseId,
      contributorId,
      complaint: d.complaint || null,
      status: d.status || 'pending',
      adminReason: d.adminReason || null,
      createdAt: toDate(d.$createdAt) || new Date(),
      updatedAt: toDate(d.$updatedAt) || new Date(),
    };
  });
  if (drToInsert.length > 0) {
    await prisma.documentReview.createMany({ data: drToInsert, skipDuplicates: true });
  }
  console.log(`✅ Document Reviews migrated: ${drToInsert.length}`);

  // ----------------------------------------------------
  // STEP 23: MONTHLY USERS
  // ----------------------------------------------------
  console.log('\n--- 23. Migrating Monthly Users ---');
  const muDocs = collections['monthly_users'] || [];
  const muToInsert = muDocs.map(m => ({
    id: m.$id,
    date: m.date || null,
    month: m.month || null,
    count: m.count ? parseInt(m.count, 10) : null,
    createdAt: toDate(m.$createdAt) || new Date(),
    updatedAt: toDate(m.$updatedAt) || new Date(),
  }));
  if (muToInsert.length > 0) {
    await prisma.monthlyUser.createMany({ data: muToInsert, skipDuplicates: true });
  }
  console.log(`✅ Monthly Users migrated: ${muToInsert.length}`);

  // ----------------------------------------------------
  // STEP 24: WEEKLY USERS
  // ----------------------------------------------------
  console.log('\n--- 24. Migrating Weekly Users ---');
  const wuDocs = collections['weekly_users'] || [];
  const wuToInsert = wuDocs.map(w => ({
    id: w.$id,
    date: w.date || null,
    count: w.count ? parseInt(w.count, 10) : null,
    createdAt: toDate(w.$createdAt) || new Date(),
    updatedAt: toDate(w.$updatedAt) || new Date(),
  }));
  if (wuToInsert.length > 0) {
    await prisma.weeklyUser.createMany({ data: wuToInsert, skipDuplicates: true });
  }
  console.log(`✅ Weekly Users migrated: ${wuToInsert.length}`);

  // ----------------------------------------------------
  // STEP 25: CHATS
  // ----------------------------------------------------
  console.log('\n--- 25. Migrating Chats ---');
  const chatDocs = collections['chats'] || [];
  const chatsToInsert = chatDocs.map(c => ({
    id: c.$id,
    participants: toStringArray(c.participants),
    lastMessage: c.lastMessage || null,
    lastMessageSenderId: c.lastMessageSenderId || null,
    lastMessageAt: toDate(c.lastMessageAt),
    unreadCounts: c.unreadCounts || null,
    createdAt: toDate(c.$createdAt) || new Date(),
    updatedAt: toDate(c.$updatedAt) || new Date(),
  }));
  if (chatsToInsert.length > 0) {
    await prisma.chat.createMany({ data: chatsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Chats migrated: ${chatsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 26: MESSAGES
  // ----------------------------------------------------
  console.log('\n--- 26. Migrating Messages ---');
  const msgDocs = collections['messages'] || [];
  const msgsToInsert = msgDocs.map(m => ({
    id: m.$id,
    chatId: m.chatId || null,
    senderId: m.senderId || null,
    text: m.text || null,
    status: m.status || null,
    createdAt: toDate(m.$createdAt) || new Date(),
    updatedAt: toDate(m.$updatedAt) || new Date(),
  }));
  if (msgsToInsert.length > 0) {
    await prisma.message.createMany({ data: msgsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Messages migrated: ${msgsToInsert.length}`);

  // ----------------------------------------------------
  // STEP 27: BUSINESSES
  // ----------------------------------------------------
  console.log('\n--- 27. Migrating Businesses ---');
  const bizDocs = collections['businesses'] || [];
  const bizToInsert = bizDocs.map(b => {
    const rawUserId = getRelId(b.user);
    const userId = rawUserId && validUserIds.has(rawUserId) ? rawUserId : null;
    return {
      id: b.$id,
      name: b.name || null,
      phone: b.phone || null,
      bannerImage: b.bannerImage || null,
      userId,
      status: b.status || null,
      createdAt: toDate(b.$createdAt) || new Date(),
      updatedAt: toDate(b.$updatedAt) || new Date(),
    };
  });
  if (bizToInsert.length > 0) {
    await prisma.business.createMany({ data: bizToInsert, skipDuplicates: true });
  }
  console.log(`✅ Businesses migrated: ${bizToInsert.length}`);

  // ----------------------------------------------------
  // STEP 28: CONTEST PERFORMANCE
  // ----------------------------------------------------
  console.log('\n--- 28. Migrating Contest Performance ---');
  const cpDocs = collections['contest_performance'] || [];
  const cpToInsert = cpDocs.map(c => {
    const rawContributorId = getRelId(c.contributors);
    const contributorId = rawContributorId && validContributorIds.has(rawContributorId) ? rawContributorId : null;
    return {
      id: c.$id,
      contributorId,
      totalPoints: c.totalPoints ? parseFloat(c.totalPoints) : null,
      dailyPoints: c.dailyPoints || null,
      uniqueUsersReached: c.uniqueUsersReached || null,
      newUsers: c.newUsers || null,
      usersReachedIds: c.usersReachedIds || null,
      returningUsers: c.returningUsers || null,
      acquisitionScore: c.acquisitionScore ? parseFloat(c.acquisitionScore) : 0,
      engagementScore: c.engagementScore ? parseFloat(c.engagementScore) : 0,
      contentScore: c.contentScore ? parseFloat(c.contentScore) : 0,
      engagementActivity: c.engagementActivity || null,
      dailyCourseRatings: c.dailyCourseRatings || null,
      coursesPoints: c.coursesPoints || null,
      uploadQuality: c.uploadQuality || null,
      referralClicks: c.referralClicks || null,
      uploadsCreated: c.uploadsCreated || null,
      Prize: c.Prize ? parseFloat(c.Prize) : null,
      isTop3Contributor: c.isTop3Contributor === true,
      createdAt: toDate(c.$createdAt) || new Date(),
      updatedAt: toDate(c.$updatedAt) || new Date(),
    };
  });
  if (cpToInsert.length > 0) {
    await prisma.contestPerformance.createMany({ data: cpToInsert, skipDuplicates: true });
  }
  console.log(`✅ Contest Performance migrated: ${cpToInsert.length}`);

  // ----------------------------------------------------
  // STEP 29: SOURCES
  // ----------------------------------------------------
  console.log('\n--- 29. Migrating Sources ---');
  const srcDocs = collections['sources'] || [];
  const srcToInsert = srcDocs.map(s => ({
    id: s.$id,
    name: s.name || null,
    clickCount: s.clickCount ? parseInt(s.clickCount, 10) : null,
    signUpCount: s.signUpCount ? parseInt(s.signUpCount, 10) : null,
    contributorCount: s.contributorCount ? parseInt(s.contributorCount, 10) : null,
    createdAt: toDate(s.$createdAt) || new Date(),
    updatedAt: toDate(s.$updatedAt) || new Date(),
  }));
  if (srcToInsert.length > 0) {
    await prisma.source.createMany({ data: srcToInsert, skipDuplicates: true });
  }
  console.log(`✅ Sources migrated: ${srcToInsert.length}`);

  // ----------------------------------------------------
  // STEP 30: COMMUNITIES
  // ----------------------------------------------------
  console.log('\n--- 30. Migrating Communities ---');
  const commDocs = collections['communities'] || [];
  const commToInsert = commDocs.map(c => {
    const rawContributorId = getRelId(c.contributors);
    const contributorId = rawContributorId && validContributorIds.has(rawContributorId) ? rawContributorId : null;
    return {
      id: c.$id,
      contributorId,
      createdAt: toDate(c.$createdAt) || new Date(),
      updatedAt: toDate(c.$updatedAt) || new Date(),
    };
  });
  if (commToInsert.length > 0) {
    await prisma.community.createMany({ data: commToInsert, skipDuplicates: true });
  }
  console.log(`✅ Communities migrated: ${commToInsert.length}`);

  // ----------------------------------------------------
  // STEP 31: THREADS
  // ----------------------------------------------------
  console.log('\n--- 31. Migrating Threads ---');
  const threadDocs = collections['threads'] || [];
  const threadsToInsert = threadDocs.map(t => ({
    id: t.$id,
    communityId: t.communityId || '',
    posterId: t.posterId || '',
    isPosterAContributor: t.isPosterAContributor === true,
    content: t.content || '',
    mediaUrl: t.mediaUrl || null,
    mediaType: t.mediaType || null,
    parentId: t.parentId || null,
    likes: t.likes || null,
    commentCount: t.commentCount ? parseInt(t.commentCount, 10) : 0,
    mediaData: t.mediaData || null,
    createdAt: toDate(t.$createdAt) || new Date(),
    updatedAt: toDate(t.$updatedAt) || new Date(),
  }));
  if (threadsToInsert.length > 0) {
    await prisma.thread.createMany({ data: threadsToInsert, skipDuplicates: true });
  }
  console.log(`✅ Threads migrated: ${threadsToInsert.length}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n====================================================');
  console.log(`🎉 ALL 31 TABLES + USERS SUCCESSFULLY MIGRATED TO NEON!`);
  console.log(`Total Migration Time: ${elapsed}s`);
  console.log('====================================================');
}

migrate()
  .catch(err => {
    console.error('❌ Migration error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
