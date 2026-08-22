const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = '69617e75000c6c010a75';

async function updateSchema() {
  try {
    console.log('Adding new attributes to threads collection...');
    const threadCollId = 'threads';
    
    // parentId (String, not required)
    console.log('Creating parentId attribute...');
    await databases.createStringAttribute(DATABASE_ID, threadCollId, 'parentId', 255, false);
    
    // likes (String, not required) - using string to store stringified array
    console.log('Creating likes attribute...');
    await databases.createStringAttribute(DATABASE_ID, threadCollId, 'likes', 65535, false);
    
    // commentCount (Integer, not required, default: 0)
    console.log('Creating commentCount attribute...');
    await databases.createIntegerAttribute(DATABASE_ID, threadCollId, 'commentCount', false, 0, 1000000000, 0);
    
    console.log('Schema update completed!');
  } catch(e) {
    console.error(e);
  }
}
updateSchema();
