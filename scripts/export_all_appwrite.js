const fs = require('fs');
const path = require('path');
const { Client, Databases, Query, Users } = require('node-appwrite');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const usersService = new Users(client);
const DATABASE_ID = '69617e75000c6c010a75';

async function fetchAllAuthUsers() {
  console.log('Fetching all Appwrite Auth Users...');
  let allUsers = [];
  let offset = 0;
  while (true) {
    const res = await usersService.list([
      Query.limit(100),
      Query.offset(offset)
    ]);
    allUsers = allUsers.concat(res.users);
    console.log(`  Fetched ${allUsers.length} / ${res.total} auth users...`);
    if (allUsers.length >= res.total || res.users.length === 0) break;
    offset += 100;
  }
  return allUsers;
}

async function fetchAllDocuments(collectionId) {
  let allDocs = [];
  let offset = 0;
  while (true) {
    const res = await databases.listDocuments(DATABASE_ID, collectionId, [
      Query.limit(100),
      Query.offset(offset)
    ]);
    allDocs = allDocs.concat(res.documents);
    if (allDocs.length >= res.total || res.documents.length === 0) break;
    offset += 100;
  }
  return allDocs;
}

async function exportAll() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('STARTING COMPLETE ZERO-LOSS EXPORT FROM APPWRITE');
  console.log('====================================================');

  const authUsers = await fetchAllAuthUsers();
  console.log(`✅ Total Auth Users Exported: ${authUsers.length}`);

  // Fetch list of all collections
  const colRes = await databases.listCollections(DATABASE_ID, [Query.limit(100)]);
  const collections = colRes.collections;
  console.log(`Found ${collections.length} collections in Appwrite.`);

  const exportedCollections = {};

  for (const col of collections) {
    console.log(`Exporting collection: ${col.name} (${col.$id})...`);
    const docs = await fetchAllDocuments(col.$id);
    exportedCollections[col.$id] = docs;
    console.log(`  -> Exported ${docs.length} documents for ${col.name} (${col.$id})`);
  }

  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      databaseId: DATABASE_ID,
      totalAuthUsers: authUsers.length,
      collectionsCount: Object.keys(exportedCollections).length,
    },
    authUsers,
    collections: exportedCollections,
  };

  const outputDir = path.join(__dirname, '../migration_data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'appwrite_full_export.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('====================================================');
  console.log(`✅ COMPLETE EXPORT SAVED TO: ${outputPath}`);
  console.log(`Time taken: ${elapsed}s`);
  console.log('====================================================');
}

exportAll().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
