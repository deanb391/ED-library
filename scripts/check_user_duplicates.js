const fs = require('fs');
const path = require('path');

const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, '../migration_data/appwrite_full_export.json'), 'utf-8'));
const authUsers = snapshot.authUsers;
const userDocs = snapshot.collections['user'] || [];

console.log('Total Auth Users:', authUsers.length);
console.log('Total User Docs:', userDocs.length);

const emailCounts = new Map();
for (const u of authUsers) {
  const email = (u.email || '').trim().toLowerCase();
  emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
}

console.log('\n--- Duplicate Emails in Auth Users ---');
for (const [email, count] of emailCounts.entries()) {
  if (count > 1) {
    console.log(`Email: "${email}" appears ${count} times in Auth!`);
    const matching = authUsers.filter(u => (u.email || '').trim().toLowerCase() === email);
    console.log('  Accounts:', matching.map(m => ({ id: m.$id, name: m.name, reg: m.registration })));
  }
}

const docIdSet = new Set(userDocs.map(d => d.$id));
const authIdSet = new Set(authUsers.map(a => a.$id));

console.log('\n--- Profiles not in Auth ---');
const orphanProfiles = userDocs.filter(d => !authIdSet.has(d.$id));
console.log(`Found ${orphanProfiles.length} profiles without auth account:`, orphanProfiles.map(p => ({ id: p.$id, email: p.email, username: p.username })));
