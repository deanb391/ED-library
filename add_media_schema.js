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
    await databases.createStringAttribute(DATABASE_ID, 'threads', 'mediaData', 65535, false);
    console.log('Schema update completed!');
  } catch(e) {
    console.error(e);
  }
}
updateSchema();
